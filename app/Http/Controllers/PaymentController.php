<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\OfflinePaymentMethod;
use App\Models\OfflinePaymentSubmission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Storage;
use App\Services\PaymentFinalizer;

class PaymentController extends Controller
{
    private $chapaSecretKey;
    private $chapaPublicKey;
    private $chapaBaseUrl;
    private PaymentFinalizer $paymentFinalizer;

    public function __construct()
    {
        $this->chapaSecretKey = config('services.chapa.secret_key');
        $this->chapaPublicKey = config('services.chapa.public_key');
        $this->chapaBaseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
        $this->paymentFinalizer = app(PaymentFinalizer::class);
    }

    public function selectMethod(Request $request)
    {
        try {
            // Generate order ID if not provided
            $orderId = $request->get('order_id', 'ORDER-' . Str::random(10) . '-' . time());
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');

            // Validate required data
            if (!$amount || $amount <= 0) {
                return redirect()->route('checkout')->with('error', 'Invalid amount specified');
            }

            // Create order when user proceeds to payment
            $order = $this->createOrderFromCart($orderId, $amount, $currency);
            if (!$order) {
                return redirect()->route('checkout')->with('error', 'Failed to create order. Please try again.');
            }

            return Inertia::render('admin/payment/select-method', [
                'order_id' => $orderId,
                'amount' => floatval($amount),
                'currency' => $currency,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment method selection failed: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
        }
    }

    public function showPaymentPage(Request $request)
    {
        // Remove or fix this problematic log line
        Log::info("=== Payment page display started ===", [
            'request_url' => $request->fullUrl(),
            'request_method' => $request->method(),
            'input_data' => $request->except(['_token'])
        ]);
        
        // Get authenticated user first
        $user = auth()->user();
        if (!$user) {
            Log::error('User not authenticated for payment page');
            return redirect()->route('login')->with('error', 'Please login to continue with payment');
        }

        try {
            // Get payment data from request
            $orderId = $request->get('order_id');
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');
            $paymentMethod = $request->get('payment_method'); // 'offline' or null for regular
            $cartItems = $request->get('cart_items');

            Log::info('Payment page request data', [
                'order_id' => $orderId,
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethod,
                'cart_items_raw' => is_string($cartItems) ? substr($cartItems, 0, 200) . '...' : 'not_string',
                'user_id' => $user->id
            ]);

            // Parse cart items if it's a JSON string
            if (is_string($cartItems)) {
                try {
                    $decodedItems = json_decode($cartItems, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new \Exception('Invalid JSON in cart_items: ' . json_last_error_msg());
                    }
                    $cartItems = $decodedItems;
                } catch (\Exception $e) {
                    Log::error('Failed to decode cart items JSON', [
                        'error' => $e->getMessage(),
                        'cart_items' => $cartItems
                    ]);
                    return redirect()->route('checkout')->with('error', 'Invalid cart data. Please try again.');
                }
            }

            // Validate required data
            if (!$orderId || !$amount || $amount <= 0) {
                Log::error('Missing or invalid payment information', [
                    'order_id' => $orderId,
                    'amount' => $amount
                ]);
                return redirect()->route('checkout')->with('error', 'Missing payment information');
            }

            // Validate cart items
            if (empty($cartItems) || !is_array($cartItems)) {
                Log::error('No cart items provided', [
                    'cart_items' => $cartItems,
                    'is_array' => is_array($cartItems),
                    'count' => is_array($cartItems) ? count($cartItems) : 'N/A'
                ]);
                return redirect()->route('checkout')->with('error', 'No items in cart. Please add items before proceeding.');
            }

            // Start transaction to ensure data consistency
            DB::beginTransaction();

            try {
                // Check if order already exists for this user and order_id
                $existingOrder = Order::where('order_number', $orderId)
                    ->where('user_id', $user->id)
                    ->with('items') // Eager load items
                    ->first();
                
                if ($existingOrder) {
                    Log::info('Found existing order', [
                        'order_id' => $existingOrder->id,
                        'order_number' => $existingOrder->order_number,
                        'items_count' => $existingOrder->items->count(),
                        'status' => $existingOrder->status,
                        'payment_status' => $existingOrder->payment_status
                    ]);

                    // If order has no items, try to add them from cart
                    if ($existingOrder->items->count() === 0) {
                        Log::info('Adding items to existing empty order');
                        $itemsAdded = $this->addItemsToOrder($existingOrder, $cartItems);
                        if (!$itemsAdded) {
                            throw new \Exception('Failed to add items to existing order');
                        }
                        $existingOrder->refresh(); // Refresh to get updated items
                    }
                    
                    $order = $existingOrder;
                } else {
                    // Create new order with items
                    Log::info('Creating new order with items', [
                        'order_number' => $orderId,
                        'cart_items_count' => count($cartItems)
                    ]);
                    
                    $order = $this->createOrderFromCart($orderId, $amount, $currency, $cartItems);
                    if (!$order) {
                        throw new \Exception('Failed to create order from cart');
                    }
                }
                
                // Ensure we have an order with items
                $currentItemCount = $order->items()->count();
                if ($currentItemCount === 0) {
                    Log::error('Order has no items after creation/update', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'cart_items_count' => count($cartItems)
                    ]);
                    throw new \Exception('Cannot proceed with empty order. Please add items to your cart.');
                }

                // Update order payment details if needed
                $updateData = [];
                if ($order->payment_status !== 'pending') {
                    $updateData['payment_status'] = 'pending';
                }
                if ($order->total_amount != $amount) {
                    $updateData['total_amount'] = $amount;
                }
                if ($order->currency !== $currency) {
                    $updateData['currency'] = $currency;
                }
                
                if (!empty($updateData)) {
                    $order->update($updateData);
                    Log::info('Updated order payment details', array_merge(['order_id' => $order->id], $updateData));
                }

                // Commit the transaction if we got this far
                DB::commit();
                
                Log::info('Order ready for payment', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'items_count' => $currentItemCount,
                    'total_amount' => $order->total_amount,
                    'payment_method' => $paymentMethod
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error during order processing', [
                    'error' => $e->getMessage(),
                    'order_id' => $orderId ?? 'N/A',
                    'user_id' => $user->id,
                    'trace' => $e->getTraceAsString()
                ]);
                
                return redirect()->route('checkout')->with('error', 'An error occurred while processing your order: ' . $e->getMessage());
            }

            // Get customer info
            $customerEmail = $user->email;
            $customerName = $user->name;

            // Get offline payment methods for offline payments
            $offlinePaymentMethods = collect();
            if ($paymentMethod === 'offline') {
                try {
                    $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
                    Log::info('Retrieved offline payment methods', [
                        'count' => $offlinePaymentMethods->count()
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to retrieve offline payment methods', [
                        'error' => $e->getMessage()
                    ]);
                    // Continue anyway - the component will handle empty collection
                }
            }

            // Log final data being sent to frontend
            Log::info('Rendering payment process page', [
                'order_id' => $orderId,
                'total_amount' => $amount,
                'currency' => $currency,
                'payment_method_type' => $paymentMethod,
                'offline_methods_count' => $offlinePaymentMethods->count(),
                'customer_email' => $customerEmail,
                'customer_name' => $customerName
            ]);

            return Inertia::render('payment/payment-process', [
                'order_id' => $orderId,
                'total_amount' => floatval($amount),
                'currency' => $currency,
                'customer_email' => $customerEmail,
                'customer_name' => $customerName,
                'payment_method_type' => $paymentMethod, // 'offline' or null
                'offlinePaymentMethods' => $offlinePaymentMethods,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment page display failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['_token'])
            ]);
            return redirect()->route('checkout')->with('error', 'An error occurred while loading the payment page: ' . $e->getMessage());
        }
    } 

    public function submitOffline(Request $request)
    {
        // Start logging with a unique request ID
        $requestId = 'REQ-' . Str::random(8) . '-' . time();
        $logContext = ['request_id' => $requestId];
        
        \Log::info('=== OFFLINE PAYMENT SUBMISSION STARTED ===', array_merge($logContext, [
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'input' => $request->except(['payment_screenshot'])
        ]));

        // Validate request
        try {
            $validated = $request->validate([
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string',
                'offline_payment_method_id' => 'required|integer|exists:offline_payment_methods,id',
                'payment_reference' => 'nullable|string|max:255',
                'payment_notes' => 'nullable|string|max:5000',
                'payment_screenshot' => 'required|image|max:5120', // 5MB
            ]);
            \Log::info('Validation passed', $logContext);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            \Log::error('Validation failed', ['errors' => $errors] + $logContext);
            throw $e;
        }

        try {
            // Get user info first to log who's making the request
            $user = auth()->user();
            if (!$user) {
                throw new \Exception('User not authenticated');
            }
            
            \Log::info('Authenticated User:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'name' => $user->name
            ] + $logContext);

            // Store the uploaded screenshot
            try {
                $file = $request->file('payment_screenshot');
                \Log::info('Processing uploaded file:', [
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ] + $logContext);
                
                $path = $file->store('offline-payments', 'public');
                \Log::info('File stored successfully', ['path' => $path] + $logContext);
            } catch (\Exception $e) {
                \Log::error('Failed to store payment screenshot', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ] + $logContext);
                throw $e;
            }

            // Generate unique submission reference
            $submissionRef = 'OFFLINE-' . Str::random(8) . '-' . time();
            \Log::info('Generated submission reference', ['ref' => $submissionRef] + $logContext);

            // Start database transaction
            DB::beginTransaction();
            
            try {
                $orderNumber = trim($validated['order_id']);
                
                // First, try to find the most recent pending/processing order for this user
                $order = Order::with(['items'])
                    ->where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'processing'])
                    ->where('payment_status', 'pending')
                    ->orderBy('created_at', 'desc')
                    ->first();

                // If no recent pending order found, try to match by order number
                if (!$order) {
                    // Try exact match first
                    $order = Order::with(['items'])
                        ->where('order_number', $orderNumber)
                        ->where('user_id', $user->id)
                        ->first();

                    // If not found, try case-insensitive search
                    if (!$order) {
                        $order = Order::with(['items'])
                            ->whereRaw('LOWER(order_number) = ?', [strtolower($orderNumber)])
                            ->where('user_id', $user->id)
                            ->first();
                    }
                }

                // If still not found, log all recent orders for debugging
                if (!$order) {
                    $recentOrders = Order::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->limit(5)
                        ->get(['id', 'order_number', 'status', 'payment_status', 'created_at']);

                    \Log::error('Order not found for offline payment', [
                        'requested_order_number' => $orderNumber,
                        'user_id' => $user->id,
                        'recent_orders' => $recentOrders->toArray(),
                        'request_data' => $validated
                    ] + $logContext);

                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Order not found. Please ensure you are using the most recent order or try again.',
                        'order_number' => $orderNumber,
                        'recent_orders' => $recentOrders
                    ], 404);
                }

                if (!$order) {
                    $errorMsg = 'Order not found for offline payment. Please restart the checkout process.';
                    
                    // Get all orders for this user for debugging
                    $userOrders = Order::where('user_id', $user->id)
                        ->orderBy('created_at', 'desc')
                        ->limit(5)
                        ->get(['id', 'order_number', 'status', 'created_at']);
                    
                    \Log::error($errorMsg, [
                        'requested_order_number' => $orderNumber,
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'user_orders' => $userOrders->toArray(),
                        'request_data' => $request->except(['payment_screenshot']),
                        'existing_orders' => Order::where('order_number', $orderNumber)
                            ->orWhere('order_number', 'like', '%' . $orderNumber . '%')
                            ->select(['id', 'user_id', 'order_number', 'status', 'created_at'])
                            ->get()
                            ->toArray(),
                    ] + $logContext);
                    
                    return back()->with('error', $errorMsg)->withInput();
                }
                
                // Ensure order has items
                if ($order->items->isEmpty()) {
                    $errorMsg = 'Cannot process payment for an empty order. Please add items to your cart and try again.';
                    \Log::error($errorMsg, [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ] + $logContext);
                    
                    throw new \Exception($errorMsg);
                }

                // Update order status
                $order->update([
                    'payment_status' => 'pending',  // Changed from 'pending_verification' to 'pending' to match the database enum
                    'payment_method' => 'offline',
                    'status' => 'processing'
                ]);
                
                \Log::info('Order updated for offline payment', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'item_count' => $order->items()->count(),
                    'payment_status' => $order->payment_status
                ] + $logContext);

                // Create offline payment submission
                $submissionData = [
                    'user_id' => $user->id,
                    'submission_ref' => $submissionRef,
                    'offline_payment_method_id' => $validated['offline_payment_method_id'],
                    'order_id' => $validated['order_id'],
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'customer_name' => $user->name,
                    'customer_email' => $user->email,
                    'customer_phone' => $user->phone ?? null,
                    'payment_reference' => $validated['payment_reference'],
                    'payment_notes' => $validated['payment_notes'],
                    'payment_screenshot' => $path,
                    'status' => 'pending',
                ];
                \Log::info('Creating offline payment submission', $submissionData + $logContext);
                
                $submission = OfflinePaymentSubmission::create($submissionData);
                \Log::info('Offline payment submission created', [
                    'submission_id' => $submission->id,
                    'status' => $submission->status
                ] + $logContext);

                // Create corresponding payment transaction record
                $transactionData = [
                    'tx_ref' => $submissionRef,
                    'order_id' => $validated['order_id'],
                    'amount' => $validated['amount'],
                    'currency' => $validated['currency'],
                    'customer_email' => $user->email,
                    'customer_name' => $user->name,
                    'customer_phone' => $user->phone ?? null,
                    'payment_method' => 'offline',
                    'gateway_status' => 'proof_uploaded',
                    'admin_status' => 'unseen',
                    'gateway_payload' => [
                        'offline_method_id' => $validated['offline_payment_method_id'],
                        'payment_reference' => $validated['payment_reference'],
                        'payment_notes' => $validated['payment_notes'],
                        'screenshot_path' => $path,
                        'submitted_at' => now()->toISOString(),
                    ],
                ];
                \Log::info('Creating payment transaction', $transactionData + $logContext);
                
                PaymentTransaction::create($transactionData);
                \Log::info('Payment transaction created', ['tx_ref' => $submissionRef] + $logContext);
                
                DB::commit();
                \Log::info('Database transaction committed successfully', $logContext);
                
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Database transaction failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ] + $logContext);
                throw $e;
            }

            // Get payment method name for display
            $paymentMethodName = 'Offline Payment';
            if ($validated['offline_payment_method_id'] == 1) {
                $paymentMethodName = 'Commercial Bank of Ethiopia';
            } elseif ($validated['offline_payment_method_id'] == 2) {
                $paymentMethodName = 'Telebirr Mobile Money';
            }

            $successData = [
                'submission_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'payment_method' => $paymentMethodName,
            ];

            \Log::info('Offline payment submission successful', [
                'submission_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'is_inertia' => $request->header('X-Inertia') === 'true',
            ] + $logContext);

            if ($request->header('X-Inertia')) {
                return Inertia::render('payment/offline-submission-success', $successData);
            }

            // For API requests, return JSON response
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'redirect' => route('payment.offline.success', $successData),
                    'data' => $successData
                ]);
            }

            // For regular web requests, redirect to success page with flash data
            return redirect()->route('payment.offline.success', $successData);
            
        } catch (\Exception $e) {
            $errorMessage = 'Offline payment submission error: ' . $e->getMessage();
            \Log::error($errorMessage, [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ] + $logContext);
            
            $errorResponse = [
                'success' => false,
                'message' => 'Failed to process offline payment. Please try again or contact support.',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'request_id' => $requestId
            ];
            
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'payment' => $errorResponse['message'],
                    'request_id' => $requestId
                ]);
            }
            
            return response()->json($errorResponse, 500);
        } finally {
            \Log::info('=== OFFLINE PAYMENT SUBMISSION COMPLETED ===', [
                'request_id' => $requestId,
                'duration_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2)
            ]);
        }
    }

    public function offlineSubmissionSuccess(Request $request)
    {
        try {
            $submissionRef = $request->get('submission_ref');
            $orderId = $request->get('order_id');
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');
            $paymentMethod = $request->get('payment_method', 'Offline Payment');

            return Inertia::render('payment/offline-submission-success', [
                'submission_ref' => $submissionRef,
                'order_id' => $orderId,
                'amount' => floatval($amount),
                'currency' => $currency,
                'payment_method' => $paymentMethod,
            ]);
        } catch (\Exception $e) {
            Log::error('Offline submission success page error: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
        }
    }

    public function processPayment(Request $request)
    {
        // Start logging with a unique request ID
        $requestId = 'CHAPA-REQ-' . Str::random(8) . '-' . time();
        $logContext = ['request_id' => $requestId];
        
        \Log::info('=== CHAPA PAYMENT PROCESSING STARTED ===', $logContext);
        \Log::info('Request Data:', [
            'payment_method' => $request->payment_method,
            'order_id' => $request->order_id,
            'amount' => $request->amount,
            'currency' => $request->currency,
            'has_cart_items' => !empty($request->cart_items),
        ] + $logContext);

        try {
            $request->validate([
                'payment_method' => 'required|in:telebirr,cbe,paypal',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email',
                'customer_phone' => 'nullable|string',
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|in:ETB,USD',
                'cart_items' => 'nullable|string',
            ]);
            
            // Get cart items from the request
            $cartItems = $request->input('cart_items');
            if (is_string($cartItems)) {
                $cartItems = json_decode($cartItems, true);
            }
            
            // Log cart items (without sensitive data)
            if (is_array($cartItems)) {
                $logItems = array_map(function($item) {
                    return [
                        'id' => $item['id'] ?? null,
                        'name' => $item['name'] ?? null,
                        'price' => $item['price'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                    ];
                }, $cartItems);
                \Log::info('Processing cart items:', ['items' => $logItems] + $logContext);
            }

            // Generate transaction reference
            $txRef = 'TX-' . Str::random(10) . '-' . time();
            $description = 'Payment for Order: ' . $request->order_id;
            
            // Start database transaction
            DB::beginTransaction();
            
            try {
                // Create or get the order with cart items
                $order = Order::where('order_number', $request->order_id)->first();
                
                if ($order) {
                    \Log::info('Found existing order', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status
                    ] + $logContext);
                    
                    // Update existing order if needed
                    $order->update([
                        'payment_status' => 'pending',
                        'payment_method' => $request->payment_method,
                        'total_amount' => $request->amount,
                        'currency' => $request->currency,
                    ]);
                } else {
                    \Log::info('Creating new order with cart items', $logContext);
                    $order = $this->createOrderFromCart(
                        $request->order_id,
                        $request->amount,
                        $request->currency,
                        $cartItems
                    );
                    
                    if (!$order) {
                        throw new \Exception('Failed to create order');
                    }
                    \Log::info('Order created successfully', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number
                    ] + $logContext);
                }
                
                // Prepare Chapa payment data
                $paymentData = [
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'email' => $request->customer_email,
                    'first_name' => explode(' ', $request->customer_name)[0],
                    'last_name' => explode(' ', $request->customer_name . ' ')[1] ?? '',
                    'phone_number' => $request->customer_phone,
                    'tx_ref' => $txRef,
                    'callback_url' => route('payment.callback'),
                    'return_url' => route('payment.return', ['tx_ref' => $txRef]), 
                    'customization' => [
                        'title' => 'ShopHub Payment',
                        'description' => preg_replace('/[^a-zA-Z0-9\s\._-]/', '', $description), 
                        'logo' => asset('images/logo.png'),
                    ],
                    'meta' => [
                        'order_id' => $request->order_id,
                        'payment_method' => $request->payment_method,
                    ],
                ];

                // Log payment data (excluding sensitive information)
                $logPaymentData = $paymentData;
                if (isset($logPaymentData['meta']['card_details'])) {
                    unset($logPaymentData['meta']['card_details']);
                }
                \Log::info('Initiating Chapa payment', [
                    'payment_data' => $logPaymentData,
                    'chapa_endpoint' => $this->chapaBaseUrl . '/transaction/initialize'
                ] + $logContext);

                // Make request to Chapa API
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->chapaSecretKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(30) // 30 seconds timeout
                ->retry(3, 100) // Retry 3 times with 100ms delay
                ->post($this->chapaBaseUrl . '/transaction/initialize', $paymentData);

                $responseData = $response->json();
                \Log::info('Chapa API Response:', [
                    'status' => $response->status(),
                    'response' => $responseData
                ] + $logContext);

                if ($response->successful() && ($responseData['status'] ?? '') === 'success') {
                    // Store transaction details in database
                    $transactionData = [
                        'tx_ref' => $txRef,
                        'order_id' => $request->order_id,
                        'amount' => $request->amount,
                        'currency' => $request->currency,
                        'customer_email' => $request->customer_email,
                        'customer_name' => $request->customer_name,
                        'customer_phone' => $request->customer_phone,
                        'payment_method' => 'chapa',
                        'gateway_status' => 'pending',
                        'admin_status' => 'unseen',
                        'checkout_url' => $responseData['data']['checkout_url'] ?? null,
                        'gateway_payload' => $responseData['data'] ?? [],
                    ];
                    
                    PaymentTransaction::create($transactionData);
                    \Log::info('Transaction stored successfully', [
                        'tx_ref' => $txRef,
                        'checkout_url' => $responseData['data']['checkout_url'] ?? null
                    ] + $logContext);

                    DB::commit();
                    \Log::info('Database transaction committed successfully', $logContext);

                    $redirectUrl = $responseData['data']['checkout_url'] ?? '#';
                    \Log::info('Redirecting to Chapa checkout', [
                        'redirect_url' => $redirectUrl
                    ] + $logContext);

                    return Inertia::location($redirectUrl);
                }
                
                // Handle API call failure or unsuccessful response
                $errorMsg = $responseData['message'] ?? 'Unknown error occurred';
                \Log::error('Chapa payment initialization failed', [
                    'status' => $response->status(),
                    'response' => $responseData,
                    'error' => $errorMsg
                ] + $logContext);
                
                // Update order status to failed
                if (isset($order)) {
                    $order->update(['payment_status' => 'failed']);
                }
                
                DB::rollBack();
                
                // Return error response based on request type
                if ($request->header('X-Inertia')) {
                    return back()->withErrors([
                        'payment' => 'Payment initialization failed: ' . $errorMsg,
                        'request_id' => $requestId
                    ]);
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Payment initialization failed: ' . $errorMsg,
                    'request_id' => $requestId
                ], 400);
                
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Exception during Chapa payment processing:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_id' => $requestId
                ] + $logContext);
                
                // Update order status to failed if order exists
                if (isset($order)) {
                    $order->update(['payment_status' => 'failed']);
                }
                
                if ($request->header('X-Inertia')) {
                    return back()->withErrors([
                        'payment' => 'An error occurred while processing your payment. Please try again.',
                        'request_id' => $requestId
                    ]);
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while processing your payment. Please try again.',
                    'error' => config('app.debug') ? $e->getMessage() : null,
                    'request_id' => $requestId
                ], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Payment processing error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_id' => $requestId ?? 'N/A'
            ] + $logContext);
            
            $errorMessage = 'An error occurred while processing your payment. ';
            $errorMessage .= config('app.debug') ? $e->getMessage() : 'Please try again later.';
            
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'payment' => $errorMessage,
                    'request_id' => $requestId ?? 'N/A'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'request_id' => $requestId ?? 'N/A'
            ], 500);
        } finally {
            \Log::info('=== CHAPA PAYMENT PROCESSING COMPLETED ===', [
                'request_id' => $requestId ?? 'N/A',
                'duration_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2)
            ]);
        }
    }

    // FIXED: Improved order creation method with cart items
    /**
     * Add items to an existing order
     */
    private function addItemsToOrder($order, $items)
    {
        try {
            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['id'],
                    'product_snapshot' => json_encode([
                        'id' => $item['id'],
                        'name' => $item['name'],
                        'price' => $item['price'],
                        'image' => $item['image'] ?? null,
                        'created_at' => now()->toDateTimeString(),
                        'updated_at' => now()->toDateTimeString()
                    ]),
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                ]);
            }
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to add items to order: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'items' => $items
            ]);
            return false;
        }
    }

    private function createOrderFromCart($orderId, $amount, $currency, $cartItems = null)
    {
        $user = auth()->user();
        if (!$user) {
            \Log::error('Cannot create order: No authenticated user');
            return null;
        }

        // Generate a consistent order number format
        $orderNumber = 'ORD-' . strtoupper(Str::random(12));
        \Log::info('Generating new order', [
            'user_id' => $user->id,
            'requested_order_id' => $orderId,
            'generated_order_number' => $orderNumber,
            'amount' => $amount,
            'currency' => $currency
        ]);

        // Check if order already exists for this user with the same amount (to prevent duplicates)
        $existingOrder = Order::where('user_id', $user->id)
            ->where('total_amount', $amount)
            ->where('currency', $currency)
            ->where('status', 'processing')
            ->where('created_at', '>', now()->subHour()) // Within the last hour
            ->orderBy('created_at', 'desc')
            ->first();
            
        if ($existingOrder) {
            \Log::info('Similar order found, returning existing order', [
                'order_id' => $existingOrder->id,
                'order_number' => $existingOrder->order_number,
                'status' => $existingOrder->status,
                'payment_status' => $existingOrder->payment_status,
                'created_at' => $existingOrder->created_at->toDateTimeString(),
                'user_id' => $user->id
            ]);
            return $existingOrder;
        }

        try {
            $orderData = [
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_status' => 'pending',
                'payment_method' => 'offline',
                'currency' => $currency,
                'subtotal' => $amount,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $amount,
                'shipping_method' => 'standard',
            ];
            
            \Log::info('Creating new order', $orderData);
            $order = Order::create($orderData);

            // Create order items if cart items are provided
            if ($cartItems && is_array($cartItems)) {
                $itemsCreated = 0;
                
                foreach ($cartItems as $item) {
                    try {
                        if (empty($item['id']) || empty($item['price']) || empty($item['quantity'])) {
                            \Log::warning('Invalid cart item format', [
                                'order_id' => $order->id,
                                'item' => $item
                            ]);
                            continue;
                        }
                        
                        $itemData = [
                            'order_id' => $order->id,
                            'product_id' => $item['id'],
                            'quantity' => $item['quantity'] ?? 1,
                            'unit_price' => $item['price'],
                            'total_price' => ($item['price'] * ($item['quantity'] ?? 1)),
                            'product_snapshot' => [
                                'id' => $item['id'],
                                'name' => $item['name'] ?? 'Unknown Product',
                                'price' => $item['price'],
                                'image' => $item['image'] ?? null,
                                'created_at' => now()->toDateTimeString(),
                                'updated_at' => now()->toDateTimeString()
                            ]
                        ];
                        
                        // Log the item being added
                        \Log::debug('Creating order item', [
                            'order_id' => $order->id,
                            'product_id' => $item['id'],
                            'quantity' => $itemData['quantity'],
                            'unit_price' => $itemData['unit_price']
                        ]);
                        
                        // Create the order item
                        $orderItem = OrderItem::create([
                            'order_id' => $itemData['order_id'],
                            'product_id' => $itemData['product_id'],
                            'quantity' => $itemData['quantity'],
                            'price' => $itemData['unit_price'],
                            'total' => $itemData['total_price'],
                            'product_snapshot' => json_encode($itemData['product_snapshot'])
                        ]);
                        
                        $itemsCreated++;
                    } catch (\Exception $e) {
                        Log::error('Error creating order item: ' . $e->getMessage(), [
                            'item' => $item,
                            'order_id' => $order->id,
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Continue with next item instead of failing the whole order
                        continue;
                    }
                }
                
                // If no items were created, update the order status to failed
                if ($itemsCreated === 0) {
                    $order->update([
                        'status' => 'failed',
                        'notes' => 'Order failed: No valid items could be added to the order.'
                    ]);
                    \Log::error('Order created with no items', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'user_id' => $user->id,
                        'cart_items' => $cartItems
                    ]);
                    return null;
                }
            }

            return $order;
        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return null;
        }
    }

    // FIXED: Improved order update method
    private function updateOrderPaymentStatus($orderId, $paymentStatus, $paymentMethod = null)
    {
        try {
            $order = Order::where('order_number', $orderId)->first();
            if ($order) {
                // Update payment status (must be one of: pending, paid, failed, refunded)
                $validStatuses = ['pending', 'paid', 'failed', 'refunded', 'pending_verification'];
                $order->payment_status = in_array($paymentStatus, $validStatuses) 
                    ? $paymentStatus 
                    : 'pending';
                    
                // Update payment method if provided
                if ($paymentMethod) {
                    $order->payment_method = $paymentMethod;
                }
                
                // Update order status based on payment status
                if ($paymentStatus === 'paid') {
                    $order->status = 'processing';
                } elseif ($paymentStatus === 'failed') {
                    $order->status = 'processing'; // Keep as 'processing' even if payment fails
                }
                
                $order->save();

                Log::info("Order {$orderId} payment status updated to: {$paymentStatus}, order status: {$order->status}");
            } else {
                Log::warning("Order not found for update: {$orderId}");
            }
        } catch (\Exception $e) {
            Log::error('Failed to update order payment status: ' . $e->getMessage());
            throw $e; // Re-throw to allow caller to handle the exception
        }
    }

    // NEW: Payment callback handler for Chapa
    public function paymentCallback(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info('Payment callback received', ['payload' => $payload]);

            // Extract transaction reference and status from payload
            $txRef = $payload['tx_ref'] ?? null;
            $status = $payload['status'] ?? null;

            if (!$txRef) {
                Log::warning('Payment callback missing tx_ref', ['payload' => $payload]);
                return response()->json(['error' => 'Missing tx_ref'], 400);
            }

            // Find the payment transaction
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                Log::warning('Payment transaction not found for callback', ['tx_ref' => $txRef]);
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            // Update transaction status
            $gatewayStatus = $this->mapChapaStatusToGatewayStatus($status);
            if ($gatewayStatus) {
                $transaction->update([
                    'gateway_status' => $gatewayStatus,
                    'gateway_payload' => $payload,
                ]);

                // Update order status
                $this->updateOrderPaymentStatus($transaction->order_id, $gatewayStatus, 'chapa');

                Log::info('Payment callback processed successfully', [
                    'tx_ref' => $txRef,
                    'gateway_status' => $gatewayStatus
                ]);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }

    // NEW: Payment return handler for Chapa
    public function paymentReturn(Request $request, $txRef)
    {
        try {
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                Log::warning('Payment transaction not found for return', ['tx_ref' => $txRef]);
                return redirect()->route('payment.failed')->with('error', 'Transaction not found');
            }

            $order = Order::where('order_number', $transaction->order_id)->first();
            if (!$order) {
                Log::warning('Order not found for payment return', ['tx_ref' => $txRef]);
                return redirect()->route('payment.failed')->with('error', 'Order not found');
            }

            // Determine success or failure based on gateway status
            if ($transaction->gateway_status === 'paid') {
                return redirect()->route('payment.success', [
                    'order_id' => $order->order_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'payment_method' => 'Chapa',
                ]);
            } else {
                return redirect()->route('payment.failed', [
                    'order_id' => $order->order_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'error' => 'Payment was not successful',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Payment return processing failed', [
                'error' => $e->getMessage(),
                'tx_ref' => $txRef
            ]);

            return redirect()->route('payment.failed')->with('error', 'An error occurred while processing your payment');
        }
    }

    // NEW: Payment success page
    public function paymentSuccess(Request $request)
    {
        try {
            $orderId = $request->get('order_id');
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');
            $paymentMethod = $request->get('payment_method', 'Online Payment');

            return Inertia::render('payment/payment-success', [
                'order_id' => $orderId,
                'amount' => floatval($amount),
                'currency' => $currency,
                'payment_method' => $paymentMethod,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment success page error: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
        }
    }

    // NEW: Payment failed page
    public function paymentFailed(Request $request)
    {
        try {
            $orderId = $request->get('order_id');
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');
            $error = $request->get('error', 'Payment was not successful');

            return Inertia::render('payment/payment-failed', [
                'order_id' => $orderId,
                'amount' => floatval($amount),
                'currency' => $currency,
                'error' => $error,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment failed page error: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
        }
    }

    // Helper method to map Chapa status to our gateway status
    private function mapChapaStatusToGatewayStatus(?string $status): ?string
    {
        return match (strtolower($status ?? '')) {
            'success', 'successful', 'completed' => 'paid',
            'failed', 'cancelled', 'timeout' => 'failed',
            'pending', 'processing' => 'pending',
            'refunded' => 'refunded',
            default => null,
        };
    }

    // Helper method to get order items for display
    private function getOrderItemsForDisplay($orderId)
    {
        try {
            return DB::table('order_items as oi')
                ->join('products as p', 'oi.product_id', '=', 'p.id')
                ->leftJoin('product_images as pi', function($join) {
                    $join->on('p.id', '=', 'pi.product_id')
                         ->where('pi.is_primary', true);
                })
                ->select([
                    'oi.id',
                    'p.name',
                    'oi.quantity',
                    'oi.price',
                    'pi.image_path as image',
                ])
                ->where('oi.order_id', $orderId)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'price' => (float) $item->price,
                        'image' => $item->image ? asset('storage/' . $item->image) : null,
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get order items: ' . $e->getMessage());
            return [];
        }
    }
}