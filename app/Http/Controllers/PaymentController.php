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

    // Updated showPaymentPage method in PaymentController.php
    public function showPaymentPage(Request $request)
    {
        Log::info("Showing payment page with parameters:", $request->all());
        
        // Get authenticated user first
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login')->with('error', 'Please login to continue with payment');
        }

        try {
            // Get payment data from request
            $orderId = $request->get('order_id');
            $amount = $request->get('amount', 0);
            $currency = $request->get('currency', 'ETB');
            $paymentMethod = $request->get('payment_method'); // 'offline' or null for Chapa
            $cartItems = $request->get('cart_items');

            // If cart_items is a JSON string, decode it
            if (is_string($cartItems)) {
                $cartItems = json_decode($cartItems, true);
            }

            // Validate required data
            if (!$orderId || !$amount || $amount <= 0) {
                return redirect()->route('checkout')->with('error', 'Missing payment information');
            }

            Log::info('Payment page parameters:', [
                'order_id' => $orderId,
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethod,
                'has_cart_items' => !empty($cartItems),
                'user_id' => $user->id,
            ]);

            // Start transaction to ensure data consistency
            DB::beginTransaction();

            try {
                // Create or update order with items
                $existingOrder = Order::where('order_number', $orderId)
                    ->where('user_id', $user->id)
                    ->first();
                
                if ($existingOrder) {
                    // If order exists but has no items, try to add them
                    if ($existingOrder->items()->count() === 0 && !empty($cartItems)) {
                        $this->addItemsToOrder($existingOrder, $cartItems);
                        $existingOrder->refresh();
                    }
                } else {
                    // Create new order with items
                    $order = $this->createOrderFromCart($orderId, $amount, $currency, $cartItems);
                    if (!$order) {
                        DB::rollBack();
                        return redirect()->route('checkout')->with('error', 'Failed to create order. Please try again.');
                    }
                    $existingOrder = $order;
                }
                
                // Ensure we have an order with items
                if ($existingOrder->items()->count() === 0) {
                    DB::rollBack();
                    Log::error('Order created without items', [
                        'order_id' => $orderId,
                        'cart_items' => $cartItems,
                        'user_id' => $user->id
                    ]);
                    return redirect()->route('checkout')->with('error', 'Cannot proceed with empty order. Please add items to your cart.');
                }

                DB::commit();
                
                // Get customer info
                $customerEmail = $user->email;
                $customerName = $user->name;

                // FIXED: Check payment method and render appropriate page
                if ($paymentMethod === 'offline') {
                    // For offline payment, get offline payment methods and render offline form
                    $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
                    
                    Log::info('Rendering offline payment form', [
                        'offline_methods_count' => $offlinePaymentMethods->count()
                    ]);

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => 'offline',
                        'offlinePaymentMethods' => $offlinePaymentMethods,
                    ]);
                } else {
                    // For Chapa payment (default), render Chapa payment form
                    Log::info('Rendering Chapa payment form');

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => null, // This tells the React component to show Chapa form
                        'offlinePaymentMethods' => collect(), // Empty collection
                    ]);
                }

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error during order creation/update: ' . $e->getMessage(), [
                    'exception' => $e,
                    'order_id' => $orderId ?? 'N/A',
                    'user_id' => $user->id,
                    'trace' => $e->getTraceAsString()
                ]);
                
                return redirect()->route('checkout')->with('error', 'An error occurred while processing your order. Please try again.');
            }
        } catch (\Exception $e) {
            Log::error('Payment page display failed: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'An error occurred. Please try again.');
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

    /**
     * Show Chapa payment method selection page
     */
    public function showChapaMethodSelect(Request $request)
    {
        try {
            // Validate required parameters
            $request->validate([
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|in:ETB,USD',
                'cart_items' => 'nullable',
            ]);

            // If cart_items is a JSON string, decode it for the frontend
            $cartItems = $request->input('cart_items');
            if (is_string($cartItems)) {
                $cartItems = json_decode($cartItems, true) ?? [];
            }

            return Inertia::render('payment/chapa-method-select', [
                'order_id' => $request->order_id,
                'amount' => (float)$request->amount,
                'currency' => $request->currency,
                'cart_items' => $cartItems,
                'auth' => [
                    'user' => [
                        'name' => auth()->user()->name ?? '',
                        'email' => auth()->user()->email ?? '',
                        'phone' => auth()->user()->phone ?? '',
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Chapa method select error: ' . $e->getMessage());
            return redirect()->route('checkout')->with('error', 'Invalid payment parameters');
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
            'phone_number' => $request->has('phone_number') ? 'provided' : 'not provided',
        ] + $logContext);

        try {
            // Get authenticated user
            $user = auth()->user();
            if (!$user) {
                throw new \Exception('User not authenticated');
            }

            // Validate required fields
            $validated = $request->validate([
                'payment_method' => 'required|in:chapa,telebirr,cbe,paypal',
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|in:ETB,USD',
                'cart_items' => 'nullable', // Accepts both string and array
                // Note: Removed customer_phone validation as it's now fetched from user profile
            ]);
            
            // Convert cart_items to array if it's a string
            if (is_string($request->cart_items)) {
                $cartItems = json_decode($request->cart_items, true) ?? [];
                $request->merge(['cart_items' => $cartItems]);
            }
            
            // Get customer details from authenticated user
            $customerName = $user->name ?? 'Customer';
            $customerEmail = $user->email ?? 'no-email@example.com';
            // Get phone number from user's profile
            $customerPhone = $user->phone;
            
            if (empty($customerPhone)) {
                throw new \Exception('Phone number is required. Please update your profile with a valid phone number before proceeding with the payment.');
            }
            
            // Log customer details being used
            \Log::info('Customer details prepared:', [
                'name' => $customerName,
                'email' => $customerEmail,
                'phone' => $customerPhone,
                'source' => [
                    'name_from' => $user->name ? 'user' : 'default',
                    'email_from' => $user->email ? 'user' : 'default',
                    'phone_from' => $user->phone ? 'user' : 'not_set'
                ]
            ] + $logContext);

            // Get cart items from the request
            $cartItems = $request->input('cart_items', []);
            if (is_string($cartItems)) {
                $cartItems = json_decode($cartItems, true) ?? [];
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
                $firstName = explode(' ', $customerName)[0];
                $lastName = explode(' ', $customerName . ' ')[1] ?? '';
                $description = 'Payment for Order: ' . $order->order_number;
                
                $paymentData = [
                    'amount' => $request->amount,
                    'currency' => $request->currency,
                    'email' => $customerEmail,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone_number' => $customerPhone,
                    'tx_ref' => $txRef,
                    'callback_url' => route('payment.callback'),
                    'return_url' => route('payment.return', ['tx_ref' => $txRef]), 
                    'customization' => [
                        'title' => 'ShopHub Payment',
                        'description' => preg_replace('/[^a-zA-Z0-9\s\._-]/', '', $description), 
                        'logo' => asset('images/logo.png'),
                    ],
                    'meta' => [
                        'order_id' => $order->order_number, // Use the actual order number from database
                        'payment_method' => $request->payment_method,
                    ],
                ];

                // Prepare sanitized payment data for logging
                $logPaymentData = [
                    'amount' => $paymentData['amount'],
                    'currency' => $paymentData['currency'],
                    'email' => $paymentData['email'],
                    'first_name' => $paymentData['first_name'],
                    'last_name' => $paymentData['last_name'],
                    'phone_number' => $paymentData['phone_number'],
                    'tx_ref' => $paymentData['tx_ref'],
                    'callback_url' => $paymentData['callback_url'],
                    'return_url' => $paymentData['return_url'],
                    'customization' => $paymentData['customization'],
                    'meta' => [
                        'order_id' => $paymentData['meta']['order_id'],
                        'payment_method' => $paymentData['meta']['payment_method']
                    ]
                ];
                
                \Log::info('Prepared payment data for Chapa API', [
                    'payment_data' => $logPaymentData,
                    'request_data' => $request->except(['_token', 'card_number', 'cvv', 'expiry_date'])
                ] + $logContext);
                \Log::info('Initiating Chapa payment', [
                    'payment_data' => $logPaymentData,
                    'chapa_endpoint' => $this->chapaBaseUrl . '/transaction/initialize'
                ] + $logContext);

                // Log before making API call
                \Log::info('Making request to Chapa API', [
                    'endpoint' => $this->chapaBaseUrl . '/transaction/initialize',
                    'headers' => [
                        'Authorization' => 'Bearer ' . (str_repeat('*', 8) . substr($this->chapaSecretKey, -4)),
                        'Content-Type' => 'application/json'
                    ]
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
                $logResponse = $responseData;
                if (isset($logResponse['data']['checkout_url'])) {
                    $logResponse['data']['checkout_url'] = substr($logResponse['data']['checkout_url'], 0, 50) . '...';
                }
                
                \Log::info('Chapa API Response:', [
                    'status' => $response->status(),
                    'response' => $logResponse,
                    'success' => $response->successful(),
                    'chapa_status' => $responseData['status'] ?? 'unknown',
                    'has_checkout_url' => !empty($responseData['data']['checkout_url'] ?? null)
                ] + $logContext);

                if ($response->successful() && ($responseData['status'] ?? '') === 'success') {
                    // Store transaction details in database
                    $transactionData = [
                        'tx_ref' => $txRef,
                        'order_id' => $order->order_number, // Use the actual order number from database
                        'amount' => $request->amount,
                        'currency' => $request->currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'customer_phone' => $customerPhone,
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

                    // FIXED: Use proper redirect instead of Inertia::location()
                    // Check if this is an AJAX/Inertia request
                    if ($request->header('X-Inertia') || $request->wantsJson()) {
                        // For AJAX/Inertia requests, return JSON with redirect URL
                        return response()->json([
                            'success' => true,
                            'redirect_url' => $redirectUrl,
                            'message' => 'Redirecting to payment gateway...'
                        ]);
                    } else {
                        // For regular form submissions, use standard redirect
                        return redirect()->away($redirectUrl);
                    }
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
                if ($request->header('X-Inertia') || $request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment initialization failed: ' . $errorMsg,
                        'request_id' => $requestId
                    ], 400);
                }
                
                return back()->withErrors([
                    'payment' => 'Payment initialization failed: ' . $errorMsg,
                    'request_id' => $requestId
                ]);
                
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
                
                if ($request->header('X-Inertia') || $request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'An error occurred while processing your payment. Please try again.',
                        'error' => config('app.debug') ? $e->getMessage() : null,
                        'request_id' => $requestId
                    ], 500);
                }
                
                return back()->withErrors([
                    'payment' => 'An error occurred while processing your payment. Please try again.',
                    'request_id' => $requestId
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('Payment processing error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_id' => $requestId ?? 'N/A'
            ] + $logContext);
            
            $errorMessage = 'An error occurred while processing your payment. ';
            $errorMessage .= config('app.debug') ? $e->getMessage() : 'Please try again later.';
            
            if ($request->header('X-Inertia') || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'request_id' => $requestId ?? 'N/A'
                ], 500);
            }
            
            return back()->withErrors([
                'payment' => $errorMessage,
                'request_id' => $requestId ?? 'N/A'
            ]);
        } finally {
            \Log::info('=== CHAPA PAYMENT PROCESSING COMPLETED ===', [
                'request_id' => $requestId ?? 'N/A',
                'duration_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2)
            ]);
        }
    } 

    /**
     * Add items to an existing order
     */
    // private function addItemsToOrder($order, $items)
    // {
    //     try {
    //         foreach ($items as $item) {
    //             $order->items()->create([
    //                 'product_id' => $item['id'],
    //                 'product_snapshot' => json_encode([
    //                     'id' => $item['id'],
    //                     'name' => $item['name'],
    //                     'price' => $item['price'],
    //                     'image' => $item['image'] ?? null,
    //                     'created_at' => now()->toDateTimeString(),
    //                     'updated_at' => now()->toDateTimeString()
    //                 ]),
    //                 'quantity' => $item['quantity'],
    //                 'price' => $item['price'],
    //                 'total' => $item['price'] * $item['quantity'],
    //             ]);
    //         }
    //         return true;
    //     } catch (\Exception $e) {
    //         \Log::error('Failed to add items to order: ' . $e->getMessage(), [
    //             'order_id' => $order->id,
    //             'items' => $items
    //         ]);
    //         return false;
    //     }
    // }

    private function createOrderFromCart($orderId, $amount, $currency, $cartItems = null)
    {
        $user = auth()->user();
        if (!$user) {
            \Log::error('Cannot create order: No authenticated user');
            return null;
        }

        // Clean and validate order ID
        $orderId = trim($orderId);
        if (empty($orderId)) {
            $orderId = 'ORDER-' . Str::upper(Str::random(8)) . '-' . time();
            \Log::warning('Empty order ID provided, generated new one', ['generated_order_id' => $orderId]);
        }

        // Check if order already exists for this user
        $existingOrder = Order::where('order_number', $orderId)
            ->where('user_id', $user->id)
            ->first();
            
        if ($existingOrder) {
            \Log::info('Order already exists, returning existing order', [
                'order_id' => $existingOrder->id,
                'order_number' => $existingOrder->order_number,
                'user_id' => $user->id
            ]);
            return $existingOrder;
        }

        try {
            // Create the order
            $order = Order::create([
                'order_number' => $orderId,
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_status' => 'pending',
                'payment_method' => 'pending', // Will be updated when payment is processed
                'currency' => $currency,
                'subtotal' => $amount,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $amount,
                'shipping_method' => 'standard',
            ]);

            \Log::info('Order created successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $user->id,
                'amount' => $amount
            ]);

            // Create order items if cart items are provided
            if ($cartItems && is_array($cartItems) && count($cartItems) > 0) {
                \Log::info('Adding cart items to order', [
                    'order_id' => $order->id,
                    'item_count' => count($cartItems)
                ]);

                foreach ($cartItems as $item) {
                    try {
                        // Validate required item fields
                        if (!isset($item['id']) || !isset($item['name']) || !isset($item['price']) || !isset($item['quantity'])) {
                            \Log::warning('Skipping invalid cart item - missing required fields', [
                                'item' => $item,
                                'order_id' => $order->id
                            ]);
                            continue;
                        }

                        // Ensure quantity and price are numeric
                        $quantity = is_numeric($item['quantity']) ? (int)$item['quantity'] : 1;
                        $price = is_numeric($item['price']) ? (float)$item['price'] : 0;
                        
                        if ($quantity <= 0) {
                            \Log::warning('Skipping cart item with invalid quantity', [
                                'item' => $item,
                                'order_id' => $order->id
                            ]);
                            continue;
                        }

                        if ($price < 0) {
                            \Log::warning('Skipping cart item with invalid price', [
                                'item' => $item,
                                'order_id' => $order->id
                            ]);
                            continue;
                        }

                        // Create order item
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $item['id'],
                            'product_snapshot' => json_encode([
                                'id' => $item['id'],
                                'name' => $item['name'],
                                'price' => $price,
                                'image' => $item['image'] ?? null,
                                'created_at' => now()->toDateTimeString(),
                                'updated_at' => now()->toDateTimeString()
                            ]),
                            'quantity' => $quantity,
                            'price' => $price,
                            'total' => $price * $quantity,
                        ]);

                        \Log::debug('Order item created', [
                            'order_id' => $order->id,
                            'product_id' => $item['id'],
                            'quantity' => $quantity,
                            'price' => $price,
                            'total' => $price * $quantity
                        ]);

                    } catch (\Exception $e) {
                        \Log::error('Error creating order item: ' . $e->getMessage(), [
                            'item' => $item,
                            'order_id' => $order->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Continue with next item instead of failing the whole order
                        continue;
                    }
                }

                // Verify that at least one item was created
                $itemCount = $order->items()->count();
                if ($itemCount === 0) {
                    \Log::warning('No valid items were added to order', [
                        'order_id' => $order->id,
                        'cart_items' => $cartItems
                    ]);
                } else {
                    \Log::info('Order items created successfully', [
                        'order_id' => $order->id,
                        'item_count' => $itemCount
                    ]);
                }
            } else {
                \Log::warning('No cart items provided for order', [
                    'order_id' => $order->id,
                    'cart_items_type' => gettype($cartItems),
                    'cart_items_count' => is_array($cartItems) ? count($cartItems) : 0
                ]);
            }

            return $order;

        } catch (\Exception $e) {
            \Log::error('Order creation failed: ' . $e->getMessage(), [
                'order_id' => $orderId,
                'user_id' => $user->id,
                'amount' => $amount,
                'currency' => $currency,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Add items to an existing order
     */
    private function addItemsToOrder($order, $items)
    {
        if (!$order || !is_array($items) || empty($items)) {
            \Log::warning('Invalid parameters for addItemsToOrder', [
                'has_order' => !!$order,
                'items_type' => gettype($items),
                'items_count' => is_array($items) ? count($items) : 0
            ]);
            return false;
        }

        try {
            \Log::info('Adding items to existing order', [
                'order_id' => $order->id,
                'item_count' => count($items)
            ]);

            foreach ($items as $item) {
                try {
                    // Validate required item fields
                    if (!isset($item['id']) || !isset($item['name']) || !isset($item['price']) || !isset($item['quantity'])) {
                        \Log::warning('Skipping invalid item - missing required fields', [
                            'item' => $item,
                            'order_id' => $order->id
                        ]);
                        continue;
                    }

                    // Ensure quantity and price are numeric
                    $quantity = is_numeric($item['quantity']) ? (int)$item['quantity'] : 1;
                    $price = is_numeric($item['price']) ? (float)$item['price'] : 0;
                    
                    if ($quantity <= 0 || $price < 0) {
                        \Log::warning('Skipping item with invalid quantity or price', [
                            'item' => $item,
                            'order_id' => $order->id
                        ]);
                        continue;
                    }

                    $order->items()->create([
                        'product_id' => $item['id'],
                        'product_snapshot' => json_encode([
                            'id' => $item['id'],
                            'name' => $item['name'],
                            'price' => $price,
                            'image' => $item['image'] ?? null,
                            'created_at' => now()->toDateTimeString(),
                            'updated_at' => now()->toDateTimeString()
                        ]),
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $price * $quantity,
                    ]);

                } catch (\Exception $e) {
                    \Log::error('Error adding item to order: ' . $e->getMessage(), [
                        'item' => $item,
                        'order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                    continue; // Continue with next item
                }
            }

            $itemCount = $order->items()->count();
            \Log::info('Items added to order', [
                'order_id' => $order->id,
                'final_item_count' => $itemCount
            ]);

            return $itemCount > 0;

        } catch (\Exception $e) {
            \Log::error('Failed to add items to order: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'items_count' => count($items),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    } 

    // FIXED: Improved order update method
    private function updateOrderPaymentStatus($orderId, $paymentStatus, $paymentMethod = null)
    {
        \Log::info('=== UPDATING ORDER PAYMENT STATUS ===', [
            'order_id' => $orderId,
            'payment_status' => $paymentStatus,
            'payment_method' => $paymentMethod,
        ]);
        
        try {
            $order = Order::where('order_number', $orderId)->first();
            if ($order) {
                $oldPaymentStatus = $order->payment_status;
                $oldOrderStatus = $order->status;
                $oldPaymentMethod = $order->payment_method;
                
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
                
                \Log::info('Order payment status updated successfully', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'old_payment_status' => $oldPaymentStatus,
                    'new_payment_status' => $order->payment_status,
                    'old_order_status' => $oldOrderStatus,
                    'new_order_status' => $order->status,
                    'old_payment_method' => $oldPaymentMethod,
                    'new_payment_method' => $order->payment_method,
                    'updated_at' => $order->updated_at,
                ]);
            } else {
                \Log::warning('Order not found for payment status update', [
                    'order_id' => $orderId,
                    'search_method' => 'order_number',
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update order payment status', [
                'order_id' => $orderId,
                'payment_status' => $paymentStatus,
                'payment_method' => $paymentMethod,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw to allow caller to handle the exception
        }
    }

    // NEW: Payment callback handler for Chapa
    public function paymentCallback(Request $request)
    {
        \Log::info('=== CHAPA PAYMENT CALLBACK RECEIVED ===', [
            'timestamp' => now()->toISOString(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'raw_content' => $request->getContent(),
        ]);
        
        try {
            $payload = $request->all();
            \Log::info('Payment callback payload parsed', [
                'payload' => $payload,
                'payload_type' => gettype($payload),
                'payload_keys' => array_keys($payload),
            ]);

            // Extract transaction reference and status from payload
            $txRef = $payload['tx_ref'] ?? null;
            $status = $payload['status'] ?? null;
            
            \Log::info('Extracted callback data', [
                'tx_ref' => $txRef,
                'status' => $status,
                'all_payload_keys' => array_keys($payload),
            ]);

            if (!$txRef) {
                \Log::warning('Payment callback missing tx_ref', [
                    'payload' => $payload,
                    'available_keys' => array_keys($payload),
                ]);
                return response()->json(['error' => 'Missing tx_ref'], 400);
            }

            // Find the payment transaction
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                \Log::warning('Payment transaction not found for callback', [
                    'tx_ref' => $txRef,
                    'available_transactions' => PaymentTransaction::select('tx_ref', 'created_at')->orderBy('created_at', 'desc')->limit(5)->get()->toArray(),
                ]);
                return response()->json(['error' => 'Transaction not found'], 404);
            }
            
            \Log::info('Found transaction for callback', [
                'tx_ref' => $txRef,
                'transaction_id' => $transaction->id,
                'current_gateway_status' => $transaction->gateway_status,
                'current_status' => $transaction->status,
                'order_id' => $transaction->order_id,
            ]);

            // Update transaction status
            $gatewayStatus = $this->mapChapaStatusToGatewayStatus($status);
            \Log::info('Status mapping result', [
                'chapa_status' => $status,
                'mapped_gateway_status' => $gatewayStatus,
            ]);
            
            if ($gatewayStatus) {
                $oldStatus = $transaction->gateway_status;
                $transaction->update([
                    'gateway_status' => $gatewayStatus,
                    'gateway_payload' => $payload,
                ]);
                
                \Log::info('Transaction status updated', [
                    'tx_ref' => $txRef,
                    'old_gateway_status' => $oldStatus,
                    'new_gateway_status' => $gatewayStatus,
                    'transaction_updated' => true,
                ]);

                // Update order status
                $this->updateOrderPaymentStatus($transaction->order_id, $gatewayStatus, 'chapa');
                
                \Log::info('Order payment status updated', [
                    'order_id' => $transaction->order_id,
                    'new_payment_status' => $gatewayStatus,
                ]);

                \Log::info('Payment callback processed successfully', [
                    'tx_ref' => $txRef,
                    'gateway_status' => $gatewayStatus,
                    'order_id' => $transaction->order_id,
                ]);
            } else {
                \Log::warning('Could not map Chapa status to gateway status', [
                    'tx_ref' => $txRef,
                    'chapa_status' => $status,
                    'mapped_status' => $gatewayStatus,
                ]);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            \Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }
    
    // Test endpoint to manually trigger callback (for debugging)
    public function testCallback(Request $request)
    {
        \Log::info('=== TEST CALLBACK ENDPOINT HIT ===', [
            'timestamp' => now()->toISOString(),
            'request_data' => $request->all(),
        ]);
        
        // Get the most recent transaction for testing
        $transaction = PaymentTransaction::orderBy('created_at', 'desc')->first();
        
        if (!$transaction) {
            return response()->json(['error' => 'No transactions found'], 404);
        }
        
        \Log::info('Test callback using transaction', [
            'tx_ref' => $transaction->tx_ref,
            'current_status' => $transaction->gateway_status,
        ]);
        
        // Simulate a successful payment callback
        $testPayload = [
            'tx_ref' => $transaction->tx_ref,
            'status' => 'success',
            'message' => 'Test callback',
        ];
        
        // Create a new request with test data
        $testRequest = new Request($testPayload);
        
        return $this->paymentCallback($testRequest);
    }
    
    // Payment verification endpoint - check Chapa status directly
    public function verifyPayment(Request $request, $txRef)
    {
        try {
            \Log::info('=== PAYMENT VERIFICATION REQUEST ===', [
                'tx_ref' => $txRef,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            // Find the transaction
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                \Log::warning('Transaction not found for verification', ['tx_ref' => $txRef]);
                return response()->json(['error' => 'Transaction not found'], 404);
            }
            
            // Check current status in our database
            $currentStatus = $transaction->gateway_status;
            \Log::info('Current transaction status', [
                'tx_ref' => $txRef,
                'current_status' => $currentStatus,
                'transaction_id' => $transaction->id,
            ]);
            
            // If already paid, return success
            if ($currentStatus === 'paid') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment already confirmed',
                    'gateway_status' => $currentStatus,
                    'redirect_url' => route('payment.return', ['tx_ref' => $txRef])
                ]);
            }
            
            // Try to verify with Chapa API
            $chapaStatus = $this->verifyWithChapa($txRef);
            \Log::info('Chapa verification result', [
                'tx_ref' => $txRef,
                'chapa_status' => $chapaStatus,
            ]);
            
            if ($chapaStatus === 'paid') {
                // Update our database
                $transaction->gateway_status = 'paid';
                $transaction->status = 'completed';
                $transaction->save();
                
                // Update order status
                $this->updateOrderPaymentStatus($transaction->order_id, 'paid', 'chapa');
                
                \Log::info('Payment verified and updated', [
                    'tx_ref' => $txRef,
                    'order_id' => $transaction->order_id,
                ]);
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment verified successfully',
                    'gateway_status' => 'paid',
                    'redirect_url' => route('payment.return', ['tx_ref' => $txRef])
                ]);
            }
            
            return response()->json([
                'status' => 'pending',
                'message' => 'Payment still being processed',
                'gateway_status' => $currentStatus,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Payment verification failed', [
                'tx_ref' => $txRef,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json(['error' => 'Verification failed'], 500);
        }
    }
    
    // Helper method to verify payment with Chapa API
    private function verifyWithChapa($txRef)
    {
        try {
            $chapaSecretKey = config('services.chapa.secret_key');
            $chapaEndpoint = 'https://api.chapa.co/v1/transaction/verify/' . $txRef;
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chapaSecretKey,
                'Content-Type' => 'application/json',
            ])->get($chapaEndpoint);
            
            if ($response->successful()) {
                $responseData = $response->json();
                \Log::info('Chapa verification response', [
                    'tx_ref' => $txRef,
                    'response' => $responseData,
                ]);
                
                // Check if payment was successful
                if (isset($responseData['data']['status']) && $responseData['data']['status'] === 'success') {
                    return 'paid';
                }
            }
            
            return 'pending';
            
        } catch (\Exception $e) {
            \Log::error('Chapa verification API call failed', [
                'tx_ref' => $txRef,
                'error' => $e->getMessage(),
            ]);
            
            return 'pending';
        }
    }

    // NEW: Payment return handler for Chapa
    public function paymentReturn(Request $request, $txRef)
    {
        \Log::info('=== PAYMENT RETURN REQUEST STARTED ===', [
            'tx_ref' => $txRef,
            'full_url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'query_params' => $request->query(),
        ]);

        try {
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                Log::warning('Payment transaction not found for return', ['tx_ref' => $txRef]);
                return Inertia::render('payment/payment-failed', [
                    'error' => 'Transaction not found',
                    'order_id' => null,
                    'amount' => 0,
                    'currency' => 'ETB',
                    'transaction_id' => $txRef, // Include the transaction reference for debugging
                ]);
            }

            // Log transaction details for debugging
            \Log::info('Looking up order for transaction', [
                'tx_ref' => $txRef,
                'transaction_order_id' => $transaction->order_id,
                'transaction_status' => $transaction->status,
                'gateway_status' => $transaction->gateway_status,
                'payment_method' => $transaction->payment_method ?? null
            ]);

            // First, try to find the order using the reference from the transaction
            $order = null;
            $searchMethods = [];
            
            // Method 1: Search by order_number (exact match) - this should work now
            if (!$order) {
                $searchMethods[] = 'order_number exact match';
                $order = Order::where('order_number', $transaction->order_id)->first();
                if ($order) {
                    \Log::info('Order found by exact order_number match', [
                        'tx_ref' => $txRef,
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'transaction_order_id' => $transaction->order_id
                    ]);
                }
            }
            
            // Method 2: If order_id is numeric, search by ID
            if (!$order && is_numeric($transaction->order_id)) {
                $searchMethods[] = 'numeric ID match';
                $order = Order::find($transaction->order_id);
                if ($order) {
                    \Log::info('Order found by numeric ID match', [
                        'tx_ref' => $txRef,
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'transaction_order_id' => $transaction->order_id
                    ]);
                }
            }
            
            // Method 3: Try timestamp-based lookup for ORDER-XXXX-1234567890 format
            if (!$order && preg_match('/^ORDER-[A-Z0-9]+-(\d+)$/', $transaction->order_id, $matches)) {
                $timestamp = $matches[1];
                $searchMethods[] = 'timestamp-based lookup';
                $start = date('Y-m-d H:i:s', ($timestamp / 1000) - 10);
                $end = date('Y-m-d H:i:s', ($timestamp / 1000) + 10);
                
                \Log::debug('Using timestamp-based order lookup', [
                    'tx_ref' => $txRef,
                    'timestamp' => $timestamp,
                    'start' => $start,
                    'end' => $end,
                    'order_reference' => $transaction->order_id
                ]);
                
                $order = Order::whereBetween('created_at', [$start, $end])
                    ->orderBy('created_at', 'desc')
                    ->first();
                    
                if ($order) {
                    \Log::info('Order found by timestamp-based lookup', [
                        'tx_ref' => $txRef,
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'transaction_order_id' => $transaction->order_id
                    ]);
                }
            }

            // If order still not found, try to find the most recent order for this user
            if (!$order) {
                $searchMethods[] = 'recent user order';
                $searchTime = now()->subMinutes(5);
                
                \Log::debug('Order not found by reference, trying to find most recent order for user', [
                    'tx_ref' => $txRef,
                    'user_id' => $transaction->user_id,
                    'search_time' => $searchTime->toDateTimeString(),
                    'attempted_methods' => $searchMethods
                ]);
                
                $query = Order::where('created_at', '>=', $searchTime)
                    ->orderBy('created_at', 'desc');
                
                if ($transaction->user_id) {
                    $query->where('user_id', $transaction->user_id);
                }
                
                $order = $query->first();
                
                if ($order) {
                    \Log::info('Found recent order for user', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'created_at' => $order->created_at,
                        'amount' => $transaction->amount,
                        'tx_ref' => $txRef
                    ]);
                    
                    // Update the transaction with the found order ID if different
                    if ($transaction->order_id !== $order->id) {
                        $transaction->order_id = $order->id;
                        $transaction->save();
                    }
                }
            }
            
            // If we still don't have an order, return error
            if (!$order) {
                $errorContext = [
                    'tx_ref' => $txRef, 
                    'order_reference' => $transaction->order_id,
                    'user_id' => $transaction->user_id ?? null,
                    'attempted_methods' => $searchMethods ?? [],
                    'search_time' => now()->subMinutes(5)->toDateTimeString(),
                    'transaction_data' => $transaction->toArray()
                ];
                
                \Log::warning('Order not found for payment return', $errorContext);
                
                return Inertia::render('payment/payment-failed', [
                    'error' => 'We encountered an issue locating your order. Please contact support with reference: ' . $txRef,
                    'order_id' => $transaction->order_id,
                    'amount' => $transaction->amount ?? 0,
                    'currency' => $transaction->currency ?? 'ETB',
                    'transaction_id' => $txRef,
                    'error_code' => 'order_not_found',
                    'show_contact_support' => true,
                    'support_reference' => $txRef,
                    'debug_info' => config('app.debug') ? $errorContext : null
                ]);
            }
            
            // If we get here, we have an order
            \Log::info('=== PAYMENT RETURN DECISION POINT ===', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => $transaction->amount,
                'tx_ref' => $txRef,
                'transaction_gateway_status' => $transaction->gateway_status,
                'transaction_status' => $transaction->status,
                'transaction_admin_status' => $transaction->admin_status,
                'transaction_payment_method' => $transaction->payment_method,
                'transaction_created_at' => $transaction->created_at,
                'transaction_updated_at' => $transaction->updated_at,
                'order_payment_status' => $order->payment_status,
                'order_status' => $order->status,
                'order_payment_method' => $order->payment_method,
                'order_created_at' => $order->created_at,
                'order_updated_at' => $order->updated_at,
                'gateway_payload' => $transaction->gateway_payload,
            ]);
            
            // Check payment status and decide which page to show
            $gatewayStatus = $transaction->gateway_status;
            \Log::info('Payment status check', [
                'tx_ref' => $txRef,
                'gateway_status' => $gatewayStatus,
                'decision_logic' => [
                    'paid' => 'SUCCESS_PAGE',
                    'pending' => 'PENDING_PAGE', 
                    'failed' => 'FAILED_PAGE',
                    'default' => 'FAILED_PAGE'
                ]
            ]);
            
            if ($gatewayStatus === 'paid') {
                // Payment was successful
                return Inertia::render('payment/payment-success', [
                    'order_id' => $order->order_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'payment_method' => 'Chapa',
                    'transaction_id' => $transaction->tx_ref,
                ]);
            } elseif ($gatewayStatus === 'pending') {
                // Payment is still pending - show pending page
                \Log::info('Payment is pending', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'tx_ref' => $txRef,
                    'gateway_status' => $transaction->gateway_status,
                    'message' => 'Payment is still being processed by Chapa'
                ]);
                
                return Inertia::render('payment/payment-pending', [
                    'order_id' => $order->order_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'transaction_id' => $transaction->tx_ref,
                    'message' => 'Your payment is being processed. Please wait a moment and refresh this page to check the status.',
                    'check_again_url' => route('payment.return', ['tx_ref' => $txRef]),
                ]);
            } else {
                // Payment failed or other error
                \Log::warning('Payment not successful', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'tx_ref' => $txRef,
                    'gateway_status' => $transaction->gateway_status,
                    'transaction_status' => $transaction->status
                ]);
                
                return Inertia::render('payment/payment-failed', [
                    'order_id' => $order->order_number,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'error' => 'Payment was not successful',
                    'error_code' => $transaction->gateway_status ?? 'payment_failed',
                    'transaction_id' => $transaction->tx_ref,
                    'show_contact_support' => true,
                    'support_reference' => $txRef,
                    'debug_info' => config('app.debug') ? [
                        'gateway_status' => $transaction->gateway_status,
                        'status' => $transaction->status,
                        'order_id' => $order->id
                    ] : null
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Payment return processing failed', [
                'error' => $e->getMessage(),
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'tx_ref' => $txRef,
                'request_data' => $request->all()
            ]);

            return Inertia::render('payment/payment-failed', [
                'error' => 'An error occurred while processing your payment',
                'order_id' => null,
                'amount' => 0,
                'currency' => 'ETB',
                'error_code' => 'processing_error',
                'show_contact_support' => true,
                'support_reference' => $txRef ?? 'N/A',
                'debug_info' => config('app.debug') ? [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ]);
        }
    }

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
        $normalizedStatus = strtolower($status ?? '');
        $mappedStatus = match ($normalizedStatus) {
            'success', 'successful', 'completed' => 'paid',
            'failed', 'cancelled', 'timeout' => 'failed',
            'pending', 'processing' => 'pending',
            'refunded' => 'refunded',
            default => null,
        };
        
        \Log::info('Chapa status mapping', [
            'original_status' => $status,
            'normalized_status' => $normalizedStatus,
            'mapped_status' => $mappedStatus,
        ]);
        
        return $mappedStatus;
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