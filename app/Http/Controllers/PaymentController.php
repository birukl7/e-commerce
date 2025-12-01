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
use App\Models\ChapaPaymentMethod;
use Illuminate\Support\Facades\Storage;
use App\Services\ImageUrlService;
use App\Services\PaymentFinalizer;
use App\Services\TaxService;
use App\Services\SiteConfigService;

class PaymentController extends Controller
{
    private $chapaSecretKey;
    private $chapaPublicKey;
    private $chapaBaseUrl;
    private PaymentFinalizer $paymentFinalizer;
    private TaxService $taxService;
    private SiteConfigService $siteConfig;

    public function __construct()
    {
        $this->chapaSecretKey = config('services.chapa.secret_key');
        $this->chapaPublicKey = config('services.chapa.public_key');
        $this->chapaBaseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
        $this->paymentFinalizer = app(PaymentFinalizer::class);
        $this->taxService = app(TaxService::class);
        $this->siteConfig = app(SiteConfigService::class);
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
                $paymentType = $request->get('payment_type', 'regular');
                $isProductRequestPayment = in_array($paymentType, ['product_request_advance', 'product_request_final']);
                $productRequestId = $request->get('product_request_id');
                
                $existingOrder = null;
                
                // For product request payments, use the order from ProductRequest if it exists
                // Don't create orders here - let PaymentFinalizer create them when payment is approved
                if ($isProductRequestPayment && $productRequestId) {
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    if ($productRequest && $productRequest->order_id) {
                        // Use existing order from product request
                        $existingOrder = Order::find($productRequest->order_id);
                        if ($existingOrder && $existingOrder->user_id !== $user->id) {
                            // Security check: ensure order belongs to user
                            $existingOrder = null;
                        }
                    }
                    // If no order exists yet, that's fine - PaymentFinalizer will create it when payment is approved
                    // We don't create orders here for product requests to avoid creating orders without items
                } else {
                    // For regular payments, create or update order with items
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
                        $shippingAddress = $request->get('shipping_address');
                        $order = $this->createOrderFromCart($orderId, $amount, $currency, $cartItems, $shippingAddress);
                        if (!$order) {
                            DB::rollBack();
                            return redirect()->route('checkout')->with('error', 'Failed to create order. Please try again.');
                        }
                        $existingOrder = $order;
                    }
                }
                
                // Ensure we have an order with items (skip check for product request payments)
                // For product request payments, order might not exist yet (will be created by PaymentFinalizer)
                if ($existingOrder && $existingOrder->items()->count() === 0 && !$isProductRequestPayment) {
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
                // Check if we should show payment method selection (for retry payments or when explicitly requested)
                // Only show selection if retry is true AND payment_method is not explicitly set
                $isRetry = $request->get('retry', false);
                $showMethodSelection = ($isRetry && !$paymentMethod) || $request->get('show_method_selection', false);
                
                if ($paymentMethod === 'offline') {
                    // For offline payment, get offline payment methods and render offline form
                    $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
                    
                    $paymentType = $request->get('payment_type', 'regular');
                    $productRequestId = $request->get('product_request_id');
                    
                    // Calculate tax for product request payments
                    $taxService = app(\App\Services\TaxService::class);
                    $taxCalculation = null;
                    $subtotal = null;
                    
                    if (in_array($paymentType, ['product_request_advance', 'product_request_final']) && $productRequestId) {
                        $productRequest = \App\Models\ProductRequest::find($productRequestId);
                        if ($productRequest) {
                            if ($paymentType === 'product_request_advance') {
                                $subtotal = (float) $productRequest->advance_amount;
                                $taxCalculation = $taxService->calculateTaxes($subtotal);
                                $amount = $taxCalculation['total']; // Update amount to include tax
                            } elseif ($paymentType === 'product_request_final') {
                                $subtotal = (float) $productRequest->final_amount;
                                $taxCalculation = $taxService->calculateTaxes($subtotal);
                                $amount = $taxCalculation['total']; // Update amount to include tax
                            }
                        }
                    }
                    
                    Log::info('Rendering offline payment form', [
                        'offline_methods_count' => $offlinePaymentMethods->count(),
                        'payment_type' => $paymentType,
                        'has_tax' => $taxCalculation !== null
                    ]);

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxCalculation ? $taxCalculation['total_tax_amount'] : null,
                        'tax_breakdown' => $taxCalculation ? $taxCalculation['taxes'] : null,
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => 'offline',
                        'offlinePaymentMethods' => $offlinePaymentMethods,
                        'payment_type' => $paymentType,
                        'product_request_id' => $productRequestId,
                        'description' => $request->get('description'),
                    ]);
                } elseif ($paymentMethod === 'chapa') {
                    // For Chapa payment (when explicitly specified), render Chapa payment form
                    Log::info('Rendering Chapa payment form');

                    // Get active Chapa payment methods
                    $chapaPaymentMethods = $this->siteConfig->getChapaPaymentMethods();
                    
                    // Log payment methods for debugging
                    Log::info('Chapa payment methods retrieved', [
                        'count' => count($chapaPaymentMethods),
                        'methods' => $chapaPaymentMethods,
                        'order_id' => $orderId,
                        'user_id' => $user->id
                    ]);
                    
                    // If no methods found, log warning and check database directly
                    if (empty($chapaPaymentMethods)) {
                        $allMethods = \App\Models\ChapaPaymentMethod::all();
                        $activeMethods = \App\Models\ChapaPaymentMethod::active()->get();
                        
                        Log::warning('No active Chapa payment methods found', [
                            'total_methods_in_db' => $allMethods->count(),
                            'active_methods_in_db' => $activeMethods->count(),
                            'all_methods' => $allMethods->toArray(),
                            'active_methods' => $activeMethods->toArray(),
                            'cache_key' => 'chapa_payment_methods_active'
                        ]);
                        
                        // Clear cache and try again
                        $this->siteConfig->clearChapaPaymentMethodsCache();
                        $chapaPaymentMethods = $this->siteConfig->getChapaPaymentMethods();
                        
                        Log::info('Retried after cache clear', [
                            'count' => count($chapaPaymentMethods)
                        ]);
                    }

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => 'chapa', // Explicitly set to 'chapa' to show Chapa form directly
                        'offlinePaymentMethods' => collect(), // Empty collection
                        'chapaPaymentMethods' => $chapaPaymentMethods,
                        'payment_type' => $request->get('payment_type', 'regular'),
                        'product_request_id' => $request->get('product_request_id'),
                        'description' => $request->get('description'),
                        'cart_items' => $cartItems,
                    ]);
                } elseif ($showMethodSelection || !$paymentMethod) {
                    // Show payment method selection page (for retry payments or when no method specified)
                    Log::info('Rendering payment method selection page', [
                        'show_method_selection' => $showMethodSelection,
                        'payment_method' => $paymentMethod,
                        'retry' => $request->get('retry', false)
                    ]);
                    
                    // Get offline payment methods for the selection page
                    $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => null, // null triggers payment method selection UI
                        'offlinePaymentMethods' => $offlinePaymentMethods,
                        'payment_type' => $request->get('payment_type', 'regular'),
                        'product_request_id' => $request->get('product_request_id'),
                        'description' => $request->get('description'),
                        'cart_items' => $cartItems,
                    ]);
                } else {
                    // Default fallback: show Chapa payment form
                    Log::info('Rendering Chapa payment form (default fallback)');

                    return Inertia::render('payment/payment-process', [
                        'order_id' => $orderId,
                        'total_amount' => floatval($amount),
                        'currency' => $currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'payment_method_type' => 'chapa', // Explicitly set to 'chapa' to show Chapa form directly
                        'offlinePaymentMethods' => collect(), // Empty collection
                        'payment_type' => $request->get('payment_type', 'regular'),
                        'product_request_id' => $request->get('product_request_id'),
                        'description' => $request->get('description'),
                        'cart_items' => $cartItems,
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
                'payment_type' => 'nullable|string',
                'product_request_id' => 'nullable|integer',
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
                
                $path = $file->store('payment-proofs', 'public');
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
                $paymentType = $validated['payment_type'] ?? 'regular';
                $productRequestId = $validated['product_request_id'] ?? null;
                
                $order = null;
                $productRequest = null;
                
                // Handle product request payments (advance or final) differently
                if (in_array($paymentType, ['product_request_advance', 'product_request_final']) && $productRequestId) {
                    \Log::info('Processing product request payment offline', [
                        'product_request_id' => $productRequestId,
                        'payment_type' => $paymentType,
                        'order_id' => $orderNumber
                    ] + $logContext);
                    
                    // Find the product request
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    
                    if (!$productRequest) {
                        \Log::error('Product request not found for payment', [
                            'product_request_id' => $productRequestId,
                            'user_id' => $user->id,
                            'payment_type' => $paymentType
                        ] + $logContext);
                        
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Product request not found. Please try again.',
                        ], 404);
                    }
                    
                    // Verify the product request belongs to the user
                    // Cast to int to handle potential type mismatch (string vs int)
                    if ((int)$productRequest->user_id !== (int)$user->id) {
                        \Log::error('Product request does not belong to user', [
                            'product_request_id' => $productRequestId,
                            'user_id' => $user->id,
                            'product_request_user_id' => $productRequest->user_id
                        ] + $logContext);
                        
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Unauthorized access to product request.',
                        ], 403);
                    }
                    
                    // Validate payment status based on payment type
                    if ($paymentType === 'product_request_advance') {
                        // Check if advance payment is still pending
                        if ($productRequest->advance_payment_status !== 'pending') {
                            \Log::error('Advance payment already processed', [
                                'product_request_id' => $productRequestId,
                                'advance_payment_status' => $productRequest->advance_payment_status
                            ] + $logContext);
                            
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'Advance payment has already been processed for this request.',
                            ], 400);
                        }
                        
                        // Create order immediately when payment is submitted (not waiting for approval)
                        // This allows customers to see their order right away with "pending" payment status
                        // Refresh to get latest order_id
                        $productRequest->refresh();
                        
                        \Log::info('[ORDER CREATION] Checking if order exists for product request on payment submission', [
                            'product_request_id' => $productRequestId,
                            'payment_type' => $paymentType,
                            'current_order_id' => $productRequest->order_id,
                            'product_request_has_image' => !empty($productRequest->image),
                            'product_request_image_path' => $productRequest->image,
                        ] + $logContext);
                        
                        if (!$productRequest->order_id) {
                            try {
                                \Log::info('[ORDER CREATION] Creating order immediately for product request advance payment submission', [
                                    'product_request_id' => $productRequestId,
                                    'payment_type' => $paymentType,
                                    'product_name' => $productRequest->product_name,
                                    'amount' => $productRequest->amount,
                                    'has_image' => !empty($productRequest->image),
                                    'image_path' => $productRequest->image,
                                ] + $logContext);
                                
                                $order = $productRequest->createOrder(markPaid: false);
                                
                                if (!$order || !$order->id) {
                                    throw new \RuntimeException('createOrder returned null or order without ID');
                                }
                                
                                // Refresh to get the updated order_id
                                $productRequest->refresh();
                                
                                // Verify order item was created
                                $orderItemCount = $order->items()->count();
                                $orderItems = $order->items;
                                
                                \Log::info('[ORDER CREATION] Order created immediately for product request advance payment', [
                                    'product_request_id' => $productRequestId,
                                    'order_id' => $order->id,
                                    'order_number' => $order->order_number,
                                    'product_request_order_id' => $productRequest->order_id,
                                    'order_item_count' => $orderItemCount,
                                    'order_payment_status' => $order->payment_status,
                                    'order_status' => $order->status,
                                ] + $logContext);
                                
                                // Log order item details including image
                                if ($orderItemCount > 0) {
                                    foreach ($orderItems as $item) {
                                        $snapshot = is_array($item->product_snapshot) 
                                            ? $item->product_snapshot 
                                            : json_decode($item->product_snapshot, true);
                                        
                                        \Log::info('[ORDER CREATION] Order item details', [
                                            'order_id' => $order->id,
                                            'order_item_id' => $item->id,
                                            'product_id' => $item->product_id,
                                            'product_name' => $snapshot['name'] ?? null,
                                            'snapshot_has_image' => isset($snapshot['image']),
                                            'snapshot_image' => $snapshot['image'] ?? null,
                                            'quantity' => $item->quantity,
                                            'price' => $item->price,
                                        ]);
                                    }
                                } else {
                                    \Log::warning('[ORDER CREATION] Order created but has no items!', [
                                        'order_id' => $order->id,
                                        'order_number' => $order->order_number,
                                        'product_request_id' => $productRequestId,
                                    ]);
                                }
                            } catch (\Exception $e) {
                                \Log::error('[ORDER CREATION] Failed to create order for product request advance payment submission', [
                                    'product_request_id' => $productRequestId,
                                    'error' => $e->getMessage(),
                                    'error_class' => get_class($e),
                                    'file' => $e->getFile(),
                                    'line' => $e->getLine(),
                                    'trace' => $e->getTraceAsString()
                                ] + $logContext);
                                // Don't fail the payment submission if order creation fails - log and continue
                                // Order will be created when payment is approved
                            }
                        } else {
                            $existingOrder = \App\Models\Order::find($productRequest->order_id);
                            $existingOrderItemCount = $existingOrder ? $existingOrder->items()->count() : 0;
                            
                            \Log::info('[ORDER CREATION] Order already exists for product request, reusing existing order', [
                                'product_request_id' => $productRequestId,
                                'order_id' => $productRequest->order_id,
                                'order_number' => $existingOrder ? $existingOrder->order_number : 'NOT FOUND',
                                'order_exists' => $existingOrder !== null,
                                'order_item_count' => $existingOrderItemCount,
                            ] + $logContext);
                        }
                    } elseif ($paymentType === 'product_request_final') {
                        // Check if final payment is still pending and product has arrived
                        if ($productRequest->final_payment_status !== 'pending') {
                            \Log::error('Final payment already processed', [
                                'product_request_id' => $productRequestId,
                                'final_payment_status' => $productRequest->final_payment_status
                            ] + $logContext);
                            
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'Final payment has already been processed for this request.',
                            ], 400);
                        }
                        
                        if (!$productRequest->product_arrived_at) {
                            \Log::error('Product has not arrived yet', [
                                'product_request_id' => $productRequestId,
                            ] + $logContext);
                            
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'Product has not arrived yet. Final payment cannot be processed.',
                            ], 400);
                        }
                        
                        // CRITICAL: For final payment, ensure we use the existing order from advance payment
                        // NEVER create a new order for final payment - reuse the one from advance payment
                        $productRequest->refresh();
                        if ($productRequest->order_id) {
                            $existingOrder = \App\Models\Order::find($productRequest->order_id);
                            if ($existingOrder) {
                                \Log::info('[ORDER REUSE] Final payment will reuse existing order from advance payment', [
                                    'product_request_id' => $productRequestId,
                                    'existing_order_id' => $existingOrder->id,
                                    'existing_order_number' => $existingOrder->order_number,
                                    'order_item_count' => $existingOrder->items()->count(),
                                ] + $logContext);
                            } else {
                                \Log::error('[ORDER REUSE] Final payment: Order ID exists but order not found!', [
                                    'product_request_id' => $productRequestId,
                                    'invalid_order_id' => $productRequest->order_id,
                                ] + $logContext);
                            }
                        } else {
                            \Log::error('[ORDER REUSE] Final payment: No order exists yet! Order should have been created during advance payment.', [
                                'product_request_id' => $productRequestId,
                                'action' => 'This is a critical error - order should exist from advance payment',
                            ] + $logContext);
                        }
                    }
                    
                } else {
                    // Regular order processing
                    \Log::info('Processing regular order offline payment', [
                        'order_id' => $orderNumber,
                        'user_id' => $user->id
                    ] + $logContext);
                    
                    // PRIORITY 1: Try to match by exact order_number first (most reliable)
                    $order = Order::with(['items'])
                        ->where('order_number', $orderNumber)
                        ->where('user_id', $user->id)
                        ->first();

                    // PRIORITY 2: If not found, try case-insensitive search
                    if (!$order) {
                        $order = Order::with(['items'])
                            ->whereRaw('LOWER(order_number) = ?', [strtolower($orderNumber)])
                            ->where('user_id', $user->id)
                            ->first();
                    }

                    // PRIORITY 3: If still not found, try to find the most recent pending/processing order for this user
                    if (!$order) {
                        $order = Order::with(['items'])
                            ->where('user_id', $user->id)
                            ->whereIn('status', ['pending', 'processing'])
                            ->where('payment_status', 'pending')
                            ->orderBy('created_at', 'desc')
                            ->first();
                    }
                    
                    // PRIORITY 4: If still not found, try any recent order for this user (more lenient)
                    if (!$order) {
                        $order = Order::with(['items'])
                            ->where('user_id', $user->id)
                            ->orderBy('created_at', 'desc')
                            ->first();
                    }

                    // PRIORITY 5: If still not found, try to create the order from cart items as last resort
                    if (!$order) {
                        $cartItems = $request->get('cart_items');
                        if (is_string($cartItems)) {
                            $cartItems = json_decode($cartItems, true);
                        }
                        
                        if (!empty($cartItems) && is_array($cartItems)) {
                            \Log::warning('Order not found, attempting to create it now as last resort', [
                                'order_number' => $orderNumber,
                                'user_id' => $user->id,
                                'cart_items_count' => count($cartItems)
                            ] + $logContext);
                            
                            try {
                                $order = $this->createOrderFromCart($orderNumber, $validated['amount'], $validated['currency'], $cartItems);
                                if ($order) {
                                    // Refresh to ensure items relationship is loaded
                                    $order->refresh();
                                    $order->load('items');
                                    \Log::info('Order created successfully as fallback', [
                                        'order_id' => $order->id,
                                        'order_number' => $order->order_number,
                                        'items_count' => $order->items->count()
                                    ] + $logContext);
                                }
                            } catch (\Exception $e) {
                                \Log::error('Failed to create order as fallback', [
                                    'error' => $e->getMessage(),
                                    'trace' => $e->getTraceAsString()
                                ] + $logContext);
                            }
                        }
                    }
                    
                    // If still not found after all attempts, log and return error
                    if (!$order) {
                        $recentOrders = Order::where('user_id', $user->id)
                            ->orderBy('created_at', 'desc')
                            ->limit(5)
                            ->get(['id', 'order_number', 'status', 'payment_status', 'created_at']);

                        \Log::error('Order not found for offline payment after all lookup attempts', [
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
                    
                    // Ensure order has items (only for regular orders)
                    if ($order->items->isEmpty()) {
                        $errorMsg = 'Cannot process payment for an empty order. Please add items to your cart and try again.';
                        \Log::error($errorMsg, [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                        ] + $logContext);
                        
                        throw new \Exception($errorMsg);
                    }
                }

                // Calculate tax for product request payments
                $taxService = app(\App\Services\TaxService::class);
                $taxCalculation = null;
                $subtotal = null;
                
                if ($paymentType === 'product_request_advance' && $productRequest) {
                    $subtotal = (float) $productRequest->advance_amount;
                    $taxCalculation = $taxService->calculateTaxes($subtotal);
                } elseif ($paymentType === 'product_request_final' && $productRequest) {
                    $subtotal = (float) $productRequest->final_amount;
                    $taxCalculation = $taxService->calculateTaxes($subtotal);
                }
                
                // Handle order/product request updates based on payment type
                if ($paymentType === 'product_request_advance' && $productRequest) {
                    // Prevent payment processing if request is terminated
                    if ($productRequest->isTerminated()) {
                        \Log::warning('Attempted to process advance payment for terminated request', [
                            'product_request_id' => $productRequest->id,
                            'status' => $productRequest->status,
                            'lost_interest_at' => $productRequest->lost_interest_at,
                        ]);
                        return back()->withErrors(['error' => 'Cannot process payment: This request has been terminated.'])->withInput();
                    }

                    // Don't mark as paid immediately - wait for admin approval
                    // Just set status to processing (proof uploaded)
                    $productRequest->update([
                        'advance_payment_status' => 'processing',
                        'payment_reference' => $submissionRef,
                        'payment_method' => 'offline',
                    ]);
                    
                    \Log::info('Product request advance payment proof uploaded', [
                        'product_request_id' => $productRequest->id,
                        'advance_payment_status' => $productRequest->advance_payment_status,
                        'tx_ref' => $submissionRef
                    ] + $logContext);
                    
                } elseif ($paymentType === 'product_request_final' && $productRequest) {
                    // Prevent payment processing if request is terminated
                    if ($productRequest->isTerminated()) {
                        \Log::warning('Attempted to process final payment for terminated request', [
                            'product_request_id' => $productRequest->id,
                            'status' => $productRequest->status,
                            'lost_interest_at' => $productRequest->lost_interest_at,
                        ]);
                        return back()->withErrors(['error' => 'Cannot process payment: This request has been terminated.'])->withInput();
                    }

                    // Don't mark as paid immediately - wait for admin approval
                    // Just set status to processing (proof uploaded)
                    $productRequest->update([
                        'final_payment_status' => 'processing',
                        'payment_reference' => $submissionRef,
                        'payment_method' => 'offline',
                    ]);
                    
                    \Log::info('Product request final payment proof uploaded', [
                        'product_request_id' => $productRequest->id,
                        'final_payment_status' => $productRequest->final_payment_status,
                        'tx_ref' => $submissionRef
                    ] + $logContext);
                    
                } else {
                    // Update regular order status
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
                }

                // Create offline payment submission
                $submissionData = [
                    'user_id' => $user->id,
                    'submission_ref' => $submissionRef,
                    'offline_payment_method_id' => $validated['offline_payment_method_id'],
                    // Link payment transaction to order for product requests
                    // For advance payment: use order if it exists (created on submission)
                    // For final payment: MUST use existing order from advance payment
                    'order_id' => in_array($paymentType, ['product_request_advance', 'product_request_final']) 
                        ? ($productRequest && $productRequest->order_id ? $productRequest->order_id : null)
                        : $order->id,
                    'product_request_id' => in_array($paymentType, ['product_request_advance', 'product_request_final']) ? $productRequest->id : null,
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

                // Use tax-calculated total amount for transaction
                $totalAmount = $taxCalculation ? $taxCalculation['total'] : $validated['amount'];
                
                // Create corresponding payment transaction record
                // For product request payments, link to the order if it exists (created on submission)
                // CRITICAL: For final payment, MUST use existing order from advance payment
                $orderIdForTransaction = null;
                if (in_array($paymentType, ['product_request_advance', 'product_request_final']) && $productRequest) {
                    $productRequest->refresh(); // Ensure we have latest order_id
                    $orderIdForTransaction = $productRequest->order_id; // Use existing order for both advance and final
                    $orderIdForTransaction = $productRequest->order_id;
                } else {
                    $orderIdForTransaction = $order->id ?? null;
                }
                
                $transactionData = [
                    'tx_ref' => $submissionRef,
                    'order_id' => $orderIdForTransaction,
                    'product_request_id' => in_array($paymentType, ['product_request_advance', 'product_request_final']) ? $productRequest->id : null,
                    'amount' => $totalAmount, // Include tax in the amount
                    'currency' => $validated['currency'],
                    'customer_email' => $user->email,
                    'customer_name' => $user->name,
                    'customer_phone' => $user->phone ?? null,
                    'payment_method' => 'offline',
                    'gateway_status' => 'proof_uploaded',
                    'admin_status' => 'unseen',
                    'gateway_payload' => array_merge([
                        'offline_method_id' => $validated['offline_payment_method_id'],
                        'payment_reference' => $validated['payment_reference'],
                        'payment_notes' => $validated['payment_notes'],
                        'screenshot_path' => $path,
                        'submitted_at' => now()->toISOString(),
                        'payment_type' => $paymentType,
                    ], $taxCalculation ? [
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxCalculation['total_tax_amount'],
                        'taxes' => $taxCalculation['taxes'],
                    ] : []),
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

            \Log::info('Offline payment submission successful', [
                'submission_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'is_inertia' => $request->header('X-Inertia') === 'true',
                'payment_type' => $paymentType,
                'product_request_id' => $productRequestId,
            ] + $logContext);

            // Handle product request offline payments - redirect to specific success pages
            if ($productRequestId && ($paymentType === 'product_request_advance' || $paymentType === 'product_request_final')) {
                $productRequest = \App\Models\ProductRequest::find($productRequestId);
                if ($productRequest && $productRequest->user_id === auth()->id()) {
                    $productRequest->refresh();
                    
                    if ($paymentType === 'product_request_advance') {
                        // Render advance payment offline success page
                        // Always return Inertia for product request payments if X-Inertia header is present
                        if ($request->header('X-Inertia')) {
                            return Inertia::render('product-requests/advance-payment-success-offline', [
                                'productRequest' => [
                                    'id' => $productRequest->id,
                                    'product_name' => $productRequest->product_name,
                                    'advance_amount' => $productRequest->advance_amount,
                                    'final_amount' => $productRequest->final_amount,
                                    'currency' => $productRequest->currency,
                                    'payment_reference' => $productRequest->payment_reference,
                                    'advance_payment_status' => $productRequest->advance_payment_status,
                                    'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                                ],
                                'submission_ref' => $submissionRef,
                                'amount' => $validated['amount'],
                                'payment_method' => $paymentMethodName,
                            ]);
                        }
                        // If no X-Inertia header, redirect to success route (for browser navigation)
                        return redirect()->route('product-requests.advance-payment.success', $productRequest->id)
                            ->with('success', 'Offline payment submitted successfully!');
                    } elseif ($paymentType === 'product_request_final') {
                        // Render final payment offline success page
                        // Always return Inertia for product request payments if X-Inertia header is present
                        if ($request->header('X-Inertia')) {
                            return Inertia::render('product-requests/final-payment-success-offline', [
                                'productRequest' => [
                                    'id' => $productRequest->id,
                                    'product_name' => $productRequest->product_name,
                                    'final_amount' => $productRequest->final_amount,
                                    'currency' => $productRequest->currency,
                                    'payment_reference' => $productRequest->payment_reference,
                                    'final_payment_status' => $productRequest->final_payment_status,
                                    'order_id' => $productRequest->order_id,
                                    'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                                ],
                                'submission_ref' => $submissionRef,
                                'amount' => $validated['amount'],
                                'payment_method' => $paymentMethodName,
                            ]);
                        }
                        // If no X-Inertia header, redirect to success route (for browser navigation)
                        return redirect()->route('product-requests.final-payment.success', $productRequest->id)
                            ->with('success', 'Offline payment submitted successfully!');
                    }
                }
            }

            // Regular order offline payment success
            $successData = [
                'submission_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'payment_method' => $paymentMethodName,
                'payment_type' => $paymentType,
                'product_request_id' => $productRequestId,
            ];

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
            $duration = defined('LARAVEL_START') 
                ? round((microtime(true) - LARAVEL_START) * 1000, 2)
                : null;
            
            \Log::info('=== OFFLINE PAYMENT SUBMISSION COMPLETED ===', [
                'request_id' => $requestId,
                'duration_ms' => $duration
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
                'payment_type' => 'nullable|string',
                'product_request_id' => 'nullable|integer',
                'description' => 'nullable|string',
            ]);

            // If cart_items is a JSON string, decode it for the frontend
            $cartItems = $request->input('cart_items');
            if (is_string($cartItems)) {
                $cartItems = json_decode($cartItems, true) ?? [];
            }

            // Get product name for advance payments
            $productName = null;
            if ($request->payment_type === 'product_request_advance' && $request->product_request_id) {
                $productRequest = \App\Models\ProductRequest::find($request->product_request_id);
                $productName = $productRequest ? $productRequest->product_name : 'Product Request';
            }

            // Get active Chapa payment methods
            $chapaPaymentMethods = $this->siteConfig->getChapaPaymentMethods();
            
            // Log payment methods for debugging
            \Log::info('Chapa method select - payment methods retrieved', [
                'count' => count($chapaPaymentMethods),
                'methods' => $chapaPaymentMethods,
                'order_id' => $request->order_id
            ]);
            
            // If no methods found, log warning and check database directly
            if (empty($chapaPaymentMethods)) {
                $allMethods = \App\Models\ChapaPaymentMethod::all();
                $activeMethods = \App\Models\ChapaPaymentMethod::active()->get();
                
                \Log::warning('No active Chapa payment methods found in showChapaMethodSelect', [
                    'total_methods_in_db' => $allMethods->count(),
                    'active_methods_in_db' => $activeMethods->count(),
                    'all_methods' => $allMethods->toArray(),
                    'active_methods' => $activeMethods->toArray(),
                    'cache_key' => 'chapa_payment_methods_active'
                ]);
                
                // Clear cache and try again
                $this->siteConfig->clearChapaPaymentMethodsCache();
                $chapaPaymentMethods = $this->siteConfig->getChapaPaymentMethods();
                
                \Log::info('Retried after cache clear in showChapaMethodSelect', [
                    'count' => count($chapaPaymentMethods)
                ]);
            }

            return Inertia::render('payment/chapa-method-select', [
                'order_id' => $request->order_id,
                'amount' => (float)$request->amount,
                'currency' => $request->currency,
                'cart_items' => $cartItems,
                'payment_type' => $request->payment_type ?: 'regular', // Default to 'regular' if not provided
                'product_request_id' => $request->product_request_id,
                'product_name' => $productName,
                'description' => $request->description,
                'chapaPaymentMethods' => $chapaPaymentMethods,
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
            'payment_type' => $request->input('payment_type'),
            'product_request_id' => $request->input('product_request_id'),
            'description' => $request->input('description'),
        ] + $logContext);

        try {
            // Get authenticated user
            $user = auth()->user();
            if (!$user) {
                throw new \Exception('User not authenticated');
            }

            // Get valid payment method codes from database
            $validPaymentMethods = ChapaPaymentMethod::where('is_active', true)
                ->pluck('code')
                ->toArray();
            
            // Add 'chapa' as a valid option (used for routing, not as a specific method)
            $validPaymentMethods[] = 'chapa';
            
            // Validate required fields (accept phone_number if provided)
            $validated = $request->validate([
                'payment_method' => ['required', 'in:' . implode(',', $validPaymentMethods)],
                'order_id' => 'required|string',
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|in:ETB,USD',
                'cart_items' => 'nullable', // Accepts both string and array
                'phone_number' => 'nullable|string',
                'payment_type' => 'nullable|string|in:regular,product_request_advance,product_request_final',
                'product_request_id' => 'nullable|integer|exists:product_requests,id',
                'description' => 'nullable|string',
            ]);
            
            // Convert cart_items to array if it's a string
            if (is_string($request->cart_items)) {
                $cartItems = json_decode($request->cart_items, true) ?? [];
                $request->merge(['cart_items' => $cartItems]);
            }
            
            // Get customer details from authenticated user (allow override from request)
            $customerName = $user->name ?? 'Customer';
            $customerEmail = $user->email ?? 'no-email@example.com';
            // Prefer phone from request if provided, else fallback to user's profile
            $customerPhone = $request->input('phone_number');
            if (empty($customerPhone)) {
                $customerPhone = $user->phone;
            }

            if (empty($customerPhone)) {
                $message = 'Phone number is required. Please enter a phone number or update your profile with a valid phone number before proceeding with the payment.';
                if ($request->header('X-Inertia') || $request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => $message,
                        'request_id' => $requestId,
                        'errors' => ['phone_number' => $message]
                    ], 422);
                }
                return back()->withErrors(['phone_number' => $message]);
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

            // Generate transaction reference based on payment type
            // Default to 'regular' if payment_type is null or empty
            $paymentType = $request->input('payment_type');
            if (empty($paymentType)) {
                $paymentType = 'regular';
            }
            $productRequestId = $request->input('product_request_id');
            
            \Log::info('Payment type determined', [
                'payment_type_from_request' => $request->input('payment_type'),
                'payment_type_final' => $paymentType,
                'is_regular' => $paymentType === 'regular',
            ] + $logContext);
            
            // Use appropriate prefix for product request payments
            if ($paymentType === 'product_request_advance' && $productRequestId) {
                $txRef = 'ADV-' . $productRequestId . '-' . now()->timestamp;
            } elseif ($paymentType === 'product_request_final' && $productRequestId) {
                $txRef = 'FINAL-' . $productRequestId . '-' . now()->timestamp;
            } else {
                $txRef = 'TX-' . Str::random(10) . '-' . time();
            }
            
            // Calculate tax for all payment types
            $taxService = app(\App\Services\TaxService::class);
            $taxCalculation = null;
            $subtotal = null;
            $amountWithTax = (float) $request->amount; // Default to request amount
            
            if (in_array($paymentType, ['product_request_advance', 'product_request_final']) && $productRequestId) {
                $productRequest = \App\Models\ProductRequest::find($productRequestId);
                if ($productRequest) {
                    if ($paymentType === 'product_request_advance') {
                        $subtotal = (float) $productRequest->advance_amount;
                        $taxCalculation = $taxService->calculateTaxes($subtotal);
                        $amountWithTax = $taxCalculation['total']; // Use total with tax
                    } elseif ($paymentType === 'product_request_final') {
                        $subtotal = (float) $productRequest->final_amount;
                        $taxCalculation = $taxService->calculateTaxes($subtotal);
                        $amountWithTax = $taxCalculation['total']; // Use total with tax
                    }
                    
                    \Log::info('Tax calculated for product request payment', [
                        'payment_type' => $paymentType,
                        'product_request_id' => $productRequestId,
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxCalculation['total_tax_amount'],
                        'total_with_tax' => $amountWithTax,
                    ] + $logContext);
                }
            } elseif ($paymentType === 'regular') {
                // Calculate tax for regular orders
                // First, try to get subtotal from existing order
                $existingOrder = Order::where('order_number', $request->order_id)->first();
                if ($existingOrder && $existingOrder->subtotal > 0) {
                    // Use order's subtotal if it exists
                    $subtotal = (float) $existingOrder->subtotal;
                } else {
                    // Calculate subtotal from cart items
                    $subtotal = 0;
                    if (is_array($cartItems) && count($cartItems) > 0) {
                        foreach ($cartItems as $item) {
                            $itemPrice = (float) ($item['price'] ?? 0);
                            $itemQuantity = (int) ($item['quantity'] ?? 1);
                            $subtotal += $itemPrice * $itemQuantity;
                        }
                    } else {
                        // If no cart items and order exists, try to calculate from order items
                        if ($existingOrder && $existingOrder->items()->count() > 0) {
                            $subtotal = (float) $existingOrder->items()->sum('total');
                        } else {
                            // Fallback to request amount as subtotal (assume it's pre-tax)
                            $subtotal = (float) $request->amount;
                        }
                    }
                }
                
                // Only calculate tax if we haven't already calculated it for this order
                // Check if order already has tax_amount set (meaning tax was already calculated)
                if ($existingOrder && $existingOrder->tax_amount > 0 && $existingOrder->total_amount > $existingOrder->subtotal) {
                    // Order already has tax calculated, use existing values
                    $amountWithTax = (float) $existingOrder->total_amount;
                    $taxCalculation = [
                        'subtotal' => (float) $existingOrder->subtotal,
                        'total_tax_amount' => (float) $existingOrder->tax_amount,
                        'total' => (float) $existingOrder->total_amount,
                        'taxes' => [], // We don't have the breakdown, but that's okay
                    ];
                    \Log::info('Using existing order tax calculation', [
                        'order_id' => $request->order_id,
                        'subtotal' => $taxCalculation['subtotal'],
                        'tax_amount' => $taxCalculation['total_tax_amount'],
                        'total_with_tax' => $amountWithTax,
                    ] + $logContext);
                } else {
                    // Calculate tax on the subtotal
                    $taxCalculation = $taxService->calculateTaxes($subtotal);
                    $amountWithTax = $taxCalculation['total']; // Use total with tax
                    
                    \Log::info('Tax calculated for regular order payment', [
                        'order_id' => $request->order_id,
                        'subtotal' => $subtotal,
                        'tax_amount' => $taxCalculation['total_tax_amount'],
                        'total_with_tax' => $amountWithTax,
                    ] + $logContext);
                }
            }
            
            // Start database transaction
            DB::beginTransaction();
            
            try {
                // For product request payments, we don't need to create/update orders
                $order = null;
                \Log::info('Checking payment type for order creation', [
                    'payment_type' => $paymentType,
                    'order_id_from_request' => $request->order_id,
                    'will_create_order' => $paymentType === 'regular',
                ] + $logContext);
                
                if ($paymentType === 'regular') {
                    // Create or get the order with cart items for regular payments
                    \Log::info('Looking up order by order_number', [
                        'order_number' => $request->order_id,
                    ] + $logContext);
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
                            'total_amount' => $amountWithTax, // Use tax-calculated amount
                            'tax_amount' => $taxCalculation ? $taxCalculation['total_tax_amount'] : ($order->tax_amount ?? 0),
                            'subtotal' => $subtotal ?? $order->subtotal,
                            'currency' => $request->currency,
                        ]);
                    } else {
                        \Log::info('Creating new order with cart items', [
                            'order_id' => $request->order_id,
                            'subtotal' => $subtotal,
                            'amount' => $request->amount,
                            'currency' => $request->currency,
                            'cart_items_count' => is_array($cartItems) ? count($cartItems) : 0,
                            'cart_items_type' => gettype($cartItems),
                            'has_shipping_address' => $request->has('shipping_address'),
                        ] + $logContext);
                        
                        // createOrderFromCart calculates tax internally, so pass subtotal, not total with tax
                        $shippingAddress = $request->get('shipping_address');
                        $order = $this->createOrderFromCart(
                            $request->order_id,
                            $subtotal ?? $request->amount, // Pass subtotal, not total with tax
                            $request->currency,
                            $cartItems,
                            $shippingAddress
                        );
                        
                        if (!$order || !$order->id) {
                            // Check if order already exists (might be a race condition)
                            $existingOrderCheck = Order::where('order_number', $request->order_id)
                                ->where('user_id', $user->id)
                                ->first();
                            
                            if ($existingOrderCheck) {
                                \Log::warning('Order already exists but createOrderFromCart returned null - using existing order', [
                                    'order_id' => $request->order_id,
                                    'existing_order_id' => $existingOrderCheck->id,
                                    'existing_order_number' => $existingOrderCheck->order_number,
                                ] + $logContext);
                                $order = $existingOrderCheck;
                            } else {
                                \Log::error('Failed to create order - createOrderFromCart returned null or invalid order', [
                                    'order_id' => $request->order_id,
                                    'subtotal' => $subtotal,
                                    'amount' => $request->amount,
                                    'cart_items_count' => is_array($cartItems) ? count($cartItems) : 0,
                                    'user_id' => $user->id,
                                    'check_existing_order' => $existingOrderCheck ? 'found' : 'not_found',
                                ] + $logContext);
                                DB::rollBack();
                                throw new \Exception('Failed to create order. Please try again.');
                            }
                        }
                        \Log::info('Order created successfully', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'total_amount' => $order->total_amount,
                            'user_id' => $order->user_id,
                        ] + $logContext);
                    }
                }
                
                // Prepare Chapa payment data
                $firstName = explode(' ', $customerName)[0];
                $lastName = explode(' ', $customerName . ' ')[1] ?? '';
                
                // Set description based on payment type
                $paymentType = $request->input('payment_type', 'regular');
                $customDescription = $request->input('description');
                
                if ($customDescription) {
                    $description = $customDescription;
                } elseif ($paymentType === 'product_request_advance') {
                    $description = 'Advance Payment for Product Request';
                } elseif ($paymentType === 'product_request_final') {
                    $description = 'Final Payment for Product Request';
                } else {
                    $description = 'Payment for Order: ' . ($order->order_number ?? $request->order_id);
                }
                
                $paymentData = [
                    'amount' => $amountWithTax, // Use tax-calculated amount for product requests
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
                        'order_id' => $order->order_number ?? $request->order_id, // Use the actual order number from database if available
                        'payment_method' => $request->payment_method,
                        'payment_type' => $paymentType,
                        'product_request_id' => $request->input('product_request_id'),
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
                    // Payment type and product request ID already determined above
                    
                    // For regular payments, ensure we have an order and use numeric order ID
                    // For product request payments, use null for order_id
                    $orderIdForTransaction = null;
                    if ($paymentType === 'regular') {
                        // Double-check that order exists and is valid
                        if (!$order || !$order->id) {
                            \Log::error('Order not found or invalid when creating payment transaction for regular payment', [
                                'order_id' => $request->order_id,
                                'tx_ref' => $txRef,
                                'payment_type' => $paymentType,
                                'order_exists' => $order !== null,
                                'order_has_id' => $order && isset($order->id),
                                'order_variable' => $order ? ['id' => $order->id, 'order_number' => $order->order_number] : null,
                            ] + $logContext);
                            
                            // Try to find the order one more time
                            $order = Order::where('order_number', $request->order_id)->first();
                            
                            // If still not found, create it now as a last resort
                            // This handles edge cases where order creation might have failed silently
                            if (!$order) {
                                \Log::warning('Order not found, attempting to create it now as last resort', [
                                    'order_id' => $request->order_id,
                                    'amount' => $amountWithTax,
                                    'subtotal' => $subtotal,
                                    'currency' => $request->currency,
                                    'cart_items_count' => is_array($cartItems) ? count($cartItems) : 0,
                                    'has_cart_items' => !empty($cartItems),
                                ] + $logContext);
                                
                                // Ensure we have cart items - if not, we can't create the order properly
                                if (empty($cartItems) || !is_array($cartItems)) {
                                    \Log::error('Cannot create order without cart items', [
                                        'cart_items' => $cartItems,
                                    ] + $logContext);
                                    DB::rollBack();
                                    throw new \Exception('Cannot create order: cart items are missing. Please try again.');
                                }
                                
                                $shippingAddress = $request->get('shipping_address');
                                $order = $this->createOrderFromCart(
                                    $request->order_id,
                                    $subtotal ?? $request->amount,
                                    $request->currency,
                                    $cartItems,
                                    $shippingAddress
                                );
                                
                                if (!$order || !$order->id) {
                                    \Log::error('Failed to create order on retry - createOrderFromCart returned null', [
                                        'order_id' => $request->order_id,
                                    ] + $logContext);
                                    DB::rollBack();
                                    throw new \Exception('Order not found and could not be created. Cannot proceed with payment.');
                                }
                                
                                \Log::info('Order created successfully on retry', [
                                    'order_id' => $order->id,
                                    'order_number' => $order->order_number,
                                    'total_amount' => $order->total_amount,
                                ]);
                            } else {
                                \Log::warning('Order found on retry lookup', [
                                    'order_id' => $order->id,
                                    'order_number' => $order->order_number,
                                ]);
                            }
                        }
                        
                        // Use numeric order ID (not order_number string) for proper foreign key relationship
                        $orderIdForTransaction = $order->id;
                        
                        \Log::info('Setting order_id for payment transaction', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'tx_ref' => $txRef,
                        ] + $logContext);
                    }
                    
                    // Check if this is a retry payment - look for existing transaction that was reset during retry
                    // This could be a rejected transaction that was reset, or a transaction that's already in retry state
                    $existingTransaction = null;
                    if ($paymentType === 'regular' && $orderIdForTransaction) {
                        // Check for existing transaction for this order that's not completed
                        // Look for transactions that are either rejected (and will be reset) or already reset (unseen/pending)
                        $existingTransaction = PaymentTransaction::where('order_id', $orderIdForTransaction)
                            ->where(function($query) {
                                $query->where('admin_status', 'rejected')
                                      ->orWhere(function($q) {
                                          $q->where('admin_status', 'unseen')
                                            ->where('gateway_status', 'pending');
                                      });
                            })
                            ->where('gateway_status', '!=', 'paid') // Don't reuse if already paid
                            ->orderBy('created_at', 'desc')
                            ->first();
                    } elseif ($productRequestId) {
                        // Check for existing transaction for this product request
                        $existingTransaction = PaymentTransaction::where('product_request_id', $productRequestId)
                            ->where(function($query) {
                                $query->where('admin_status', 'rejected')
                                      ->orWhere(function($q) {
                                          $q->where('admin_status', 'unseen')
                                            ->where('gateway_status', 'pending');
                                      });
                            })
                            ->where('gateway_status', '!=', 'paid') // Don't reuse if already paid
                            ->orderBy('created_at', 'desc')
                            ->first();
                    }
                    
                    // Store transaction details in database
                    $transactionData = [
                        'tx_ref' => $txRef,
                        'order_id' => $orderIdForTransaction,
                        'product_request_id' => $productRequestId, // Include product_request_id for advance/final payments
                        'amount' => $amountWithTax, // Use tax-calculated amount
                        'currency' => $request->currency,
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'customer_phone' => $customerPhone,
                        'payment_method' => 'chapa',
                        'gateway_status' => 'pending',
                        'admin_status' => 'unseen',
                        'checkout_url' => $responseData['data']['checkout_url'] ?? null,
                        'gateway_payload' => array_merge($responseData['data'] ?? [], [
                            'payment_type' => $paymentType,
                            'order_number' => $order->order_number ?? $request->order_id, // Store order_number in payload for reference
                        ], $taxCalculation ? [
                            'subtotal' => $subtotal,
                            'tax_amount' => $taxCalculation['total_tax_amount'],
                            'taxes' => $taxCalculation['taxes'],
                        ] : []),
                    ];
                    
                    // If we found an existing transaction (rejected or reset), update it instead of creating a new one
                    // This prevents duplicate transactions and ensures the retry uses the same transaction
                    if ($existingTransaction) {
                        \Log::info('Updating existing transaction for retry', [
                            'existing_transaction_id' => $existingTransaction->id,
                            'old_tx_ref' => $existingTransaction->tx_ref,
                            'old_admin_status' => $existingTransaction->admin_status,
                            'old_gateway_status' => $existingTransaction->gateway_status,
                            'new_tx_ref' => $txRef,
                        ] + $logContext);
                        
                        // Update the existing transaction with new payment attempt details
                        $existingTransaction->update($transactionData);
                        \Log::info('Existing transaction updated for retry', [
                            'transaction_id' => $existingTransaction->id,
                            'tx_ref' => $txRef,
                        ] + $logContext);
                    } else {
                        // Create new transaction
                        PaymentTransaction::create($transactionData);
                        \Log::info('New transaction created', [
                            'tx_ref' => $txRef,
                        ] + $logContext);
                    }
                    \Log::info('Transaction stored successfully', [
                        'tx_ref' => $txRef,
                        'checkout_url' => $responseData['data']['checkout_url'] ?? null
                    ] + $logContext);

                    // For product request payments, update the status to 'processing' (awaiting payment approval)
                    // This ensures status is set BEFORE redirecting to Chapa
                    if ($paymentType === 'product_request_advance' && $productRequestId) {
                        $productRequest = \App\Models\ProductRequest::find($productRequestId);
                        if ($productRequest && $productRequest->user_id === $user->id) {
                            // Prevent payment processing if request is terminated
                            if ($productRequest->isTerminated()) {
                                \Log::warning('Attempted to process advance payment for terminated request', [
                                    'product_request_id' => $productRequestId,
                                    'status' => $productRequest->status,
                                    'lost_interest_at' => $productRequest->lost_interest_at,
                                ]);
                                return redirect()->route('request.index')
                                    ->with('error', 'Cannot process payment: This request has been terminated.');
                            }

                            // Only update if not already processing or paid
                            if ($productRequest->advance_payment_status !== 'processing' && $productRequest->advance_payment_status !== 'paid') {
                                $productRequest->update([
                                    'advance_payment_status' => 'processing',
                                    'payment_reference' => $txRef,
                                    'payment_method' => 'chapa',
                                ]);
                                \Log::info('Product request advance payment status set to processing', [
                                    'product_request_id' => $productRequestId,
                                    'tx_ref' => $txRef,
                                ] + $logContext);
                            }
                        }
                    } elseif ($paymentType === 'product_request_final' && $productRequestId) {
                        $productRequest = \App\Models\ProductRequest::find($productRequestId);
                        if ($productRequest && $productRequest->user_id === $user->id) {
                            // Prevent payment processing if request is terminated
                            if ($productRequest->isTerminated()) {
                                \Log::warning('Attempted to process final payment for terminated request', [
                                    'product_request_id' => $productRequestId,
                                    'status' => $productRequest->status,
                                    'lost_interest_at' => $productRequest->lost_interest_at,
                                ]);
                                return redirect()->route('request.index')
                                    ->with('error', 'Cannot process payment: This request has been terminated.');
                            }

                            // Only update if not already processing or paid
                            if ($productRequest->final_payment_status !== 'processing' && $productRequest->final_payment_status !== 'paid') {
                                $productRequest->update([
                                    'final_payment_status' => 'processing',
                                    'payment_reference' => $txRef,
                                    'payment_method' => 'chapa',
                                ]);
                                \Log::info('Product request final payment status set to processing', [
                                    'product_request_id' => $productRequestId,
                                    'tx_ref' => $txRef,
                                ] + $logContext);
                            }
                        }
                    }

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
            $duration = defined('LARAVEL_START') 
                ? round((microtime(true) - LARAVEL_START) * 1000, 2)
                : null;
            
            \Log::info('=== CHAPA PAYMENT PROCESSING COMPLETED ===', [
                'request_id' => $requestId ?? 'N/A',
                'duration_ms' => $duration
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

    /**
     * Extract shipping address data from request or user's saved address
     */
    private function extractShippingAddressData($shippingAddress, $user)
    {
        $data = [
            'shipping_fullname' => $user->name,
            'shipping_email' => $user->email,
            'shipping_phone' => $user->phone,
            'shipping_address' => null,
            'shipping_city' => null,
            'shipping_country' => 'Ethiopia',
            'billing_fullname' => $user->name,
            'billing_email' => $user->email,
            'billing_phone' => $user->phone,
            'billing_address' => null,
            'billing_city' => null,
            'billing_country' => 'Ethiopia',
        ];

        // If shipping address is provided (from checkout form)
        if ($shippingAddress) {
            // Handle both object and array formats
            if (is_string($shippingAddress)) {
                $shippingAddress = json_decode($shippingAddress, true);
            }

            if (is_array($shippingAddress)) {
                // Extract from checkout form format
                $fullName = trim(($shippingAddress['firstName'] ?? '') . ' ' . ($shippingAddress['lastName'] ?? ''));
                if (empty($fullName)) {
                    $fullName = $user->name;
                }

                $data['shipping_fullname'] = $fullName;
                $data['shipping_email'] = $shippingAddress['email'] ?? $user->email;
                $data['shipping_phone'] = $shippingAddress['phone'] ?? $user->phone;
                $data['shipping_address'] = $shippingAddress['address'] ?? null;
                $data['shipping_city'] = $shippingAddress['city'] ?? null;
                $data['shipping_country'] = $shippingAddress['country'] ?? 'Ethiopia';
                
                // Use same data for billing (can be updated later if needed)
                $data['billing_fullname'] = $data['shipping_fullname'];
                $data['billing_email'] = $data['shipping_email'];
                $data['billing_phone'] = $data['shipping_phone'];
                $data['billing_address'] = $data['shipping_address'];
                $data['billing_city'] = $data['shipping_city'];
                $data['billing_country'] = $data['shipping_country'];
            }
        } else {
            // Try to get from user's default saved address
            $defaultAddress = $user->addresses()->where('is_default', true)->first();
            if ($defaultAddress) {
                $data['shipping_address'] = $defaultAddress->address_line_1 . 
                    ($defaultAddress->address_line_2 ? ', ' . $defaultAddress->address_line_2 : '');
                $data['shipping_city'] = $defaultAddress->city;
                $data['shipping_country'] = $defaultAddress->country;
                $data['shipping_phone'] = $defaultAddress->phone ?? $user->phone;
                
                $data['billing_address'] = $data['shipping_address'];
                $data['billing_city'] = $data['shipping_city'];
                $data['billing_country'] = $data['shipping_country'];
            }
        }

        return $data;
    }

    /**
     * Update shipping address on existing order
     */
    private function updateOrderShippingAddress($order, $shippingAddress, $user)
    {
        $shippingData = $this->extractShippingAddressData($shippingAddress, $user);
        $order->update($shippingData);
    }

    private function createOrderFromCart($orderId, $amount, $currency, $cartItems = null, $shippingAddress = null)
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
            // Update shipping address if provided and order doesn't have one
            if ($shippingAddress && (!$existingOrder->shipping_address || !$existingOrder->shipping_city)) {
                $this->updateOrderShippingAddress($existingOrder, $shippingAddress, $user);
            }
            \Log::info('Order already exists, returning existing order', [
                'order_id' => $existingOrder->id,
                'order_number' => $existingOrder->order_number,
                'user_id' => $user->id
            ]);
            return $existingOrder;
        }

        try {
            // Determine subtotal from cart items when available
            $computedSubtotal = null;
            if (is_array($cartItems) && count($cartItems) > 0) {
                $computedSubtotal = 0.0;
                foreach ($cartItems as $item) {
                    if (!isset($item['price']) || !isset($item['quantity'])) {
                        continue;
                    }
                    $price = is_numeric($item['price']) ? (float)$item['price'] : 0.0;
                    $qty = is_numeric($item['quantity']) ? (int)$item['quantity'] : 0;
                    if ($qty > 0 && $price >= 0) {
                        $computedSubtotal += $price * $qty;
                    }
                }
            }

            // Fallback to provided amount if subtotal cannot be computed
            $subtotalForTax = $computedSubtotal !== null ? $computedSubtotal : (float) $amount;

            // Calculate taxes based on subtotal (pre-tax)
            $taxCalculation = $this->taxService->calculateTaxes($subtotalForTax);
            
            // Extract shipping address data
            $shippingData = $this->extractShippingAddressData($shippingAddress, $user);
            
            // Prepare order data
            $orderData = [
                'order_number' => $orderId,
                'user_id' => $user->id,
                'status' => 'processing',
                'payment_status' => 'pending',
                'payment_method' => 'pending', // Will be updated when payment is processed
                'currency' => $currency,
                'subtotal' => $subtotalForTax,
                'tax_amount' => $taxCalculation['total_tax_amount'],
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $taxCalculation['total'],
                'shipping_method' => 'standard',
            ] + $shippingData;
            
            \Log::info('Attempting to create order', [
                'order_number' => $orderId,
                'user_id' => $user->id,
                'order_data_keys' => array_keys($orderData),
                'subtotal' => $subtotalForTax,
                'total_amount' => $taxCalculation['total']
            ]);
            
            // Create the order with tax calculations
            try {
                $order = Order::create($orderData);
            } catch (\Illuminate\Database\QueryException $e) {
                // Check if it's a duplicate key error (order_number already exists)
                $errorCode = $e->errorInfo[1] ?? null;
                $errorMessage = $e->getMessage();
                
                // MySQL duplicate entry error code is 1062, PostgreSQL is 23505
                if ($errorCode == 1062 || $errorCode == 23505 || str_contains($errorMessage, 'Duplicate entry') || str_contains($errorMessage, 'duplicate key')) {
                    \Log::warning('Order number already exists, attempting to retrieve existing order', [
                        'order_number' => $orderId,
                        'user_id' => $user->id,
                        'error_code' => $errorCode,
                    ]);
                    
                    // Try to find the existing order
                    $existingOrder = Order::where('order_number', $orderId)
                        ->where('user_id', $user->id)
                        ->first();
                    
                    if ($existingOrder) {
                        \Log::info('Found existing order with same order_number, returning it', [
                            'order_id' => $existingOrder->id,
                            'order_number' => $existingOrder->order_number,
                        ]);
                        return $existingOrder;
                    } else {
                        // Order exists but belongs to different user - generate new order number
                        $newOrderId = 'ORDER-' . Str::upper(Str::random(8)) . '-' . time();
                        \Log::warning('Order number exists for different user, generating new order number', [
                            'old_order_number' => $orderId,
                            'new_order_number' => $newOrderId,
                        ]);
                        $orderData['order_number'] = $newOrderId;
                        $order = Order::create($orderData);
                    }
                } else {
                    // Other database error
                    \Log::error('Database error creating order', [
                        'order_number' => $orderId,
                        'user_id' => $user->id,
                        'error_code' => $e->getCode(),
                        'error_message' => $e->getMessage(),
                        'sql_state' => $e->errorInfo[0] ?? null,
                        'driver_code' => $e->errorInfo[1] ?? null,
                        'error_info' => $e->errorInfo ?? null,
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            } catch (\Exception $e) {
                \Log::error('General error creating order', [
                    'order_number' => $orderId,
                    'user_id' => $user->id,
                    'error_message' => $e->getMessage(),
                    'error_class' => get_class($e),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

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
            \Log::error('Order creation failed in createOrderFromCart', [
                'order_id' => $orderId,
                'user_id' => $user->id,
                'amount' => $amount,
                'currency' => $currency,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'cart_items_count' => is_array($cartItems) ? count($cartItems) : 0,
                'has_shipping_address' => !empty($shippingAddress),
            ]);
            
            // If it's a database query exception, log more details
            if ($e instanceof \Illuminate\Database\QueryException) {
                \Log::error('Database Query Exception details', [
                    'error_info' => $e->errorInfo ?? null,
                    'sql_state' => $e->errorInfo[0] ?? null,
                    'driver_code' => $e->errorInfo[1] ?? null,
                    'driver_message' => $e->errorInfo[2] ?? null,
                ]);
            }
            
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
                'tx_ref' => $txRef,
                'product_request_id' => $transaction->product_request_id,
            ]);
            
            if ($gatewayStatus) {
                $oldStatus = $transaction->gateway_status;
                
                // PREVENT DUPLICATE PROCESSING: Don't update if already processed
                if ($oldStatus === 'paid' && $gatewayStatus === 'paid') {
                    \Log::warning('Payment callback received for already paid transaction - skipping update', [
                        'tx_ref' => $txRef,
                        'current_status' => $oldStatus,
                        'new_status' => $gatewayStatus,
                        'product_request_id' => $transaction->product_request_id,
                    ]);
                    return response()->json(['status' => 'already_processed'], 200);
                }
                
                $transaction->update([
                    'gateway_status' => $gatewayStatus,
                    'gateway_payload' => $payload,
                ]);
                
                \Log::info('Transaction status updated', [
                    'tx_ref' => $txRef,
                    'old_gateway_status' => $oldStatus,
                    'new_gateway_status' => $gatewayStatus,
                    'transaction_updated' => true,
                    'product_request_id' => $transaction->product_request_id,
                ]);

                // Handle product request payments separately (don't update order status)
                if ($transaction->product_request_id) {
                    \Log::info('Product request payment callback - skipping order update, will be handled by PaymentFinalizer', [
                        'tx_ref' => $txRef,
                        'product_request_id' => $transaction->product_request_id,
                        'gateway_status' => $gatewayStatus,
                    ]);
                    // Product request payments are handled by PaymentFinalizer when admin approves
                    // Don't auto-process them here to prevent duplicate processing
                } else {
                    // Update order status for regular orders
                    $this->updateOrderPaymentStatus($transaction->order_id, $gatewayStatus, 'chapa');
                    
                    \Log::info('Order payment status updated', [
                        'order_id' => $transaction->order_id,
                        'new_payment_status' => $gatewayStatus,
                    ]);
                }

                \Log::info('Payment callback processed successfully', [
                    'tx_ref' => $txRef,
                    'gateway_status' => $gatewayStatus,
                    'order_id' => $transaction->order_id,
                    'product_request_id' => $transaction->product_request_id,
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
    public function paymentReturn(Request $request, $txRef = null)
    {
        // COMPREHENSIVE LOGGING: Log ALL incoming data from external URL
        \Log::info('=== PAYMENT RETURN REQUEST - RAW INCOMING DATA ===', [
            'timestamp' => now()->toISOString(),
            'method' => $request->method(),
            'full_url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'query_params' => $request->query()->all(),
            'path_params' => $request->route()->parameters(),
            'all_input' => $request->all(),
            'raw_content' => $request->getContent(),
            'tx_ref_from_path' => $txRef,
            'tx_ref_from_query' => $request->get('tx_ref'),
            'tx_ref_from_transaction_reference' => $request->get('transaction_reference'),
            'tx_ref_from_reference' => $request->get('reference'),
        ]);
        
        // Handle both path parameter and query parameter for tx_ref
        // Chapa might redirect with query parameters instead of path parameters
        if (empty($txRef)) {
            $txRef = $request->get('tx_ref') ?? $request->get('transaction_reference') ?? $request->get('reference');
        }

        \Log::info('=== PAYMENT RETURN REQUEST STARTED ===', [
            'tx_ref' => $txRef,
            'full_url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'query_params' => $request->query(),
            'path_params' => $request->route()->parameters(),
        ]);

        // If we still don't have a tx_ref, show a generic error page
        if (empty($txRef)) {
            \Log::warning('Payment return called without tx_ref', [
                'full_url' => $request->fullUrl(),
                'query_params' => $request->query(),
            ]);
            return Inertia::render('payment/payment-failed', [
                'error' => 'Payment reference not found. Please contact support if you made a payment.',
                'order_id' => null,
                'amount' => 0,
                'currency' => 'ETB',
                'error_code' => 'missing_reference',
                'show_contact_support' => true,
            ]);
        }

        try {
            $transaction = PaymentTransaction::where('tx_ref', $txRef)->first();
            if (!$transaction) {
                Log::warning('Payment transaction not found for return', ['tx_ref' => $txRef]);
                return Inertia::render('payment/payment-failed', [
                    'error' => 'Transaction not found. Please contact support with your payment reference.',
                    'order_id' => null,
                    'amount' => 0,
                    'currency' => 'ETB',
                    'transaction_id' => $txRef, // Include the transaction reference for debugging
                    'error_code' => 'transaction_not_found',
                    'show_contact_support' => true,
                ]);
            }

            // Log transaction details for debugging
            \Log::info('Looking up order for transaction', [
                'tx_ref' => $txRef,
                'transaction_order_id' => $transaction->order_id,
                'transaction_status' => $transaction->status,
                'gateway_status' => $transaction->gateway_status,
                'payment_method' => $transaction->payment_method ?? null,
                'customer_email' => $transaction->customer_email,
                'user_id' => $transaction->user_id,
                'gateway_payload' => $transaction->gateway_payload,
            ]);

            // Use OrderLookupService for consistent order lookup and normalization
            // This handles all cases: numeric order_id, string order_number, NULL order_id, etc.
            $orderLookupService = app(\App\Services\OrderLookupService::class);
            $order = $orderLookupService->getOrderForPayment($transaction);
            
            if ($order) {
                \Log::info('Order found using OrderLookupService', [
                    'tx_ref' => $txRef,
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'transaction_order_id' => $transaction->order_id,
                ]);
            } else {
                \Log::warning('Order not found using OrderLookupService', [
                    'tx_ref' => $txRef,
                    'transaction_order_id' => $transaction->order_id,
                    'customer_email' => $transaction->customer_email,
                    'amount' => $transaction->amount,
                ]);
            }
            
            // Check if this is a product request payment FIRST (before checking order)
            // Product request payments don't require orders, so handle them before order lookup
            $isAdvancePayment = str_starts_with($transaction->tx_ref, 'ADV-');
            $isFinalPayment = str_starts_with($transaction->tx_ref, 'FINAL-');
            $productRequestId = $transaction->product_request_id ?? null;
            
            // If we don't have product_request_id but have ADV-/FINAL- prefix, extract it
            if (!$productRequestId && ($isAdvancePayment || $isFinalPayment)) {
                $parts = explode('-', $transaction->tx_ref);
                if (count($parts) >= 2) {
                    $productRequestId = $parts[1];
                }
            }
            
            // Also check gateway_payload for product_request_id if not found yet
            if (!$productRequestId && $transaction->gateway_payload) {
                $payload = is_string($transaction->gateway_payload) 
                    ? json_decode($transaction->gateway_payload, true) 
                    : $transaction->gateway_payload;
                
                if (isset($payload['meta']['product_request_id'])) {
                    $productRequestId = $payload['meta']['product_request_id'];
                    \Log::info('Found product_request_id in gateway_payload', [
                        'product_request_id' => $productRequestId,
                        'tx_ref' => $txRef,
                    ]);
                }
            }
            
            // Handle product request payments first (no order needed)
            // Handle ALL statuses for product request payments (paid, failed, pending)
            // Check by product_request_id OR by prefix
            if ($productRequestId || ($isAdvancePayment || $isFinalPayment)) {
                \Log::info('=== PRODUCT REQUEST PAYMENT RETURN ===', [
                    'tx_ref' => $txRef,
                    'product_request_id' => $productRequestId,
                    'payment_type' => $isAdvancePayment ? 'advance' : 'final',
                    'transaction_gateway_status' => $transaction->gateway_status,
                    'transaction_payment_method' => $transaction->payment_method,
                ]);
                
                $gatewayStatus = $transaction->gateway_status;
                
                \Log::info('=== PRODUCT REQUEST PAYMENT RETURN - STATUS CHECK ===', [
                    'tx_ref' => $txRef,
                    'product_request_id' => $productRequestId,
                    'gateway_status' => $gatewayStatus,
                    'is_advance' => $isAdvancePayment,
                    'is_final' => $isFinalPayment,
                ]);
                
                // Handle FAILED payments FIRST - don't process them
                if ($gatewayStatus === 'failed') {
                    \Log::warning('Product request payment failed - showing failure page', [
                        'tx_ref' => $txRef,
                        'product_request_id' => $productRequestId,
                        'gateway_status' => $gatewayStatus,
                    ]);
                    
                    // Cast product_request_id to integer to handle string IDs from tx_ref extraction
                    $productRequestIdInt = is_numeric($productRequestId) ? (int) $productRequestId : null;
                    $productRequest = $productRequestIdInt 
                        ? \App\Models\ProductRequest::find($productRequestIdInt)
                        : null;
                    
                    \Log::info('Product request lookup for failed payment', [
                        'tx_ref' => $txRef,
                        'product_request_id_raw' => $productRequestId,
                        'product_request_id_int' => $productRequestIdInt,
                        'product_request_found' => $productRequest !== null,
                        'product_request_user_id' => $productRequest ? $productRequest->user_id : null,
                        'auth_user_id' => auth()->id(),
                        'user_id_match' => $productRequest ? ((int) $productRequest->user_id === (int) auth()->id()) : false,
                    ]);
                    
                    if ($productRequest && (int) $productRequest->user_id === (int) auth()->id()) {
                        $failurePage = $isAdvancePayment 
                            ? 'product-requests/advance-payment-failure'
                            : 'product-requests/final-payment-failure';
                        
                        return Inertia::render($failurePage, [
                            'productRequest' => [
                                'id' => $productRequest->id,
                                'product_name' => $productRequest->product_name,
                                'advance_amount' => $productRequest->advance_amount,
                                'final_amount' => $productRequest->final_amount,
                                'currency' => $productRequest->currency,
                            ],
                            'error_message' => 'Payment was not successful. Please try again.',
                            'payment_method' => 'chapa',
                            'retry_url' => $isAdvancePayment 
                                ? route('payment.show', ['order_id' => 'ADV-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->advance_amount, 'payment_type' => 'product_request_advance', 'product_request_id' => $productRequest->id])
                                : route('payment.show', ['order_id' => 'FINAL-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->final_amount, 'payment_type' => 'product_request_final', 'product_request_id' => $productRequest->id]),
                        ]);
                    } else {
                        // Product request not found or unauthorized - show generic failure page
                        \Log::warning('Product request not found or unauthorized for failed payment', [
                            'product_request_id' => $productRequestId,
                            'user_id' => auth()->id(),
                            'tx_ref' => $txRef
                        ]);
                        return Inertia::render('payment/payment-failed', [
                            'error' => 'Product request not found or unauthorized',
                            'order_id' => null,
                            'amount' => $transaction->amount ?? 0,
                            'currency' => $transaction->currency ?? 'ETB',
                            'transaction_id' => $txRef,
                            'error_code' => 'product_request_not_found',
                        ]);
                    }
                }
                
                // For product request payments, also check if status is 'processing' or 'pending'
                // because webhook might not have updated it yet, but payment was successful
                // We'll update the status to 'processing' regardless of gateway_status
                // BUT: Check for duplicate payments first
                if ($gatewayStatus === 'paid' || $gatewayStatus === 'pending' || $gatewayStatus === 'processing') {
                        // Refresh product request to get latest status
                        // Cast product_request_id to integer to handle string IDs from tx_ref extraction
                        $productRequestIdInt = is_numeric($productRequestId) ? (int) $productRequestId : null;
                        $productRequest = $productRequestIdInt 
                            ? \App\Models\ProductRequest::find($productRequestIdInt)
                            : null;
                        
                        \Log::info('Product request lookup for payment return', [
                            'tx_ref' => $txRef,
                            'product_request_id_raw' => $productRequestId,
                            'product_request_id_int' => $productRequestIdInt,
                            'product_request_found' => $productRequest !== null,
                            'product_request_user_id' => $productRequest ? $productRequest->user_id : null,
                            'auth_user_id' => auth()->id(),
                            'user_id_match' => $productRequest ? ((int) $productRequest->user_id === (int) auth()->id()) : false,
                        ]);
                        
                        if ($productRequest && (int) $productRequest->user_id === (int) auth()->id()) {
                            $productRequest->refresh();
                            
                            // Get the payment transaction for details
                            $paymentTransaction = PaymentTransaction::where('tx_ref', $txRef)->first();
                            
                            // PREVENT DUPLICATE PAYMENT PROCESSING
                            // Check if payment has already been processed
                            if ($isAdvancePayment) {
                                if ($productRequest->advance_payment_status === 'paid') {
                                    \Log::warning('Duplicate advance payment attempt - already paid', [
                                        'product_request_id' => $productRequestId,
                                        'tx_ref' => $txRef,
                                        'current_status' => $productRequest->advance_payment_status,
                                    ]);
                                    // Still show success page but don't process again
                                    return Inertia::render('product-requests/advance-payment-success-chapa', [
                                        'productRequest' => [
                                            'id' => $productRequest->id,
                                            'product_name' => $productRequest->product_name,
                                            'advance_amount' => $productRequest->advance_amount,
                                            'final_amount' => $productRequest->final_amount,
                                            'currency' => $productRequest->currency,
                                            'payment_reference' => $productRequest->payment_reference,
                                            'advance_payment_status' => $productRequest->advance_payment_status,
                                            'workflow_status' => $productRequest->getWorkflowStatus(),
                                        ],
                                        'transaction_id' => $paymentTransaction?->tx_ref,
                                        'amount' => $paymentTransaction?->amount ?? $productRequest->advance_amount,
                                        'message' => 'Your advance payment was already processed successfully.',
                                    ]);
                                }
                            } else {
                                if ($productRequest->final_payment_status === 'paid') {
                                    \Log::warning('Duplicate final payment attempt - already paid', [
                                        'product_request_id' => $productRequestId,
                                        'tx_ref' => $txRef,
                                        'current_status' => $productRequest->final_payment_status,
                                    ]);
                                    // Still show success page but don't process again
                                    return Inertia::render('product-requests/final-payment-success-chapa', [
                                        'productRequest' => [
                                            'id' => $productRequest->id,
                                            'product_name' => $productRequest->product_name,
                                            'final_amount' => $productRequest->final_amount,
                                            'currency' => $productRequest->currency,
                                            'payment_reference' => $productRequest->payment_reference,
                                            'final_payment_status' => $productRequest->final_payment_status,
                                            'order_id' => $productRequest->order_id,
                                            'workflow_status' => $productRequest->getWorkflowStatus(),
                                        ],
                                        'transaction_id' => $paymentTransaction?->tx_ref,
                                        'amount' => $paymentTransaction?->amount ?? $productRequest->final_amount,
                                        'message' => 'Your final payment was already processed successfully.',
                                    ]);
                                }
                            }
                            
                            // Ensure payment status is updated to 'processing' (awaiting payment approval)
                            // This ensures consistency even if webhook is delayed or hasn't run
                            $needsUpdate = false;
                            if ($isAdvancePayment) {
                            // Prevent payment processing if request is terminated
                            if ($productRequest->isTerminated()) {
                                \Log::warning('Attempted to process advance payment return for terminated request', [
                                    'product_request_id' => $productRequestId,
                                    'status' => $productRequest->status,
                                    'lost_interest_at' => $productRequest->lost_interest_at,
                                ]);
                                // Return to product request failure page
                                return Inertia::render('product-requests/advance-payment-failure', [
                                    'productRequest' => $productRequest,
                                    'message' => 'This request has been terminated. Payment cannot be processed.',
                                ]);
                            }

                            // Update to 'processing' if not already 'processing' or 'paid'
                            // This handles cases where status might be null, 'pending', or something else
                            if ($productRequest->advance_payment_status !== 'processing' && $productRequest->advance_payment_status !== 'paid') {
                                \Log::info('Updating advance payment status in paymentReturn', [
                                    'product_request_id' => $productRequestId,
                                    'tx_ref' => $txRef,
                                    'current_status' => $productRequest->advance_payment_status,
                                    'updating_to' => 'processing',
                                ]);
                                $productRequest->update([
                                    'advance_payment_status' => 'processing',
                                    'payment_reference' => $txRef,
                                    'payment_method' => 'chapa',
                                ]);
                                $needsUpdate = true;
                            }
                        } else {
                            // Final payment
                            // Prevent payment processing if request is terminated
                            if ($productRequest->isTerminated()) {
                                \Log::warning('Attempted to process final payment return for terminated request', [
                                    'product_request_id' => $productRequestId,
                                    'status' => $productRequest->status,
                                    'lost_interest_at' => $productRequest->lost_interest_at,
                                ]);
                                // Return to product request failure page
                                return Inertia::render('product-requests/final-payment-failure', [
                                    'productRequest' => $productRequest,
                                    'message' => 'This request has been terminated. Payment cannot be processed.',
                                ]);
                            }

                            if ($productRequest->final_payment_status !== 'processing' && $productRequest->final_payment_status !== 'paid') {
                                \Log::info('Updating final payment status in paymentReturn', [
                                    'product_request_id' => $productRequestId,
                                    'tx_ref' => $txRef,
                                    'current_status' => $productRequest->final_payment_status,
                                    'updating_to' => 'processing',
                                ]);
                                $productRequest->update([
                                    'final_payment_status' => 'processing',
                                    'payment_reference' => $txRef,
                                    'payment_method' => 'chapa',
                                ]);
                                $needsUpdate = true;
                            }
                        }
                        
                        // Ensure payment transaction is linked regardless of status update
                        if ($paymentTransaction) {
                            if (!$paymentTransaction->product_request_id) {
                                $paymentTransaction->update(['product_request_id' => $productRequestId]);
                            }
                            if ($paymentTransaction->admin_status !== 'approved') {
                                $paymentTransaction->update(['admin_status' => 'unseen']);
                            }
                        }
                        
                        // Always refresh to get latest status from database
                        $productRequest->refresh();
                        
                        // Render appropriate success page directly (don't redirect)
                        if ($isAdvancePayment) {
                            return Inertia::render('product-requests/advance-payment-success-chapa', [
                                'productRequest' => [
                                    'id' => $productRequest->id,
                                    'product_name' => $productRequest->product_name,
                                    'advance_amount' => $productRequest->advance_amount,
                                    'final_amount' => $productRequest->final_amount,
                                    'currency' => $productRequest->currency,
                                    'payment_reference' => $productRequest->payment_reference,
                                    'advance_payment_status' => $productRequest->advance_payment_status,
                                    'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                                ],
                                'transaction_id' => $paymentTransaction?->tx_ref,
                                'amount' => $paymentTransaction?->amount ?? $productRequest->advance_amount,
                                'message' => $productRequest->advance_payment_status === 'processing' 
                                    ? 'Your advance payment was successful! The payment is now pending admin approval.'
                                    : 'Your advance payment was successful! We will now start procuring your product.',
                            ]);
                        } else {
                            return Inertia::render('product-requests/final-payment-success-chapa', [
                                'productRequest' => [
                                    'id' => $productRequest->id,
                                    'product_name' => $productRequest->product_name,
                                    'final_amount' => $productRequest->final_amount,
                                    'currency' => $productRequest->currency,
                                    'payment_reference' => $productRequest->payment_reference,
                                    'final_payment_status' => $productRequest->final_payment_status,
                                    'order_id' => $productRequest->order_id,
                                    'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                                ],
                                'transaction_id' => $paymentTransaction?->tx_ref,
                                'amount' => $paymentTransaction?->amount ?? $productRequest->final_amount,
                                'message' => $productRequest->final_payment_status === 'processing'
                                    ? 'Your final payment was successful! The payment is now pending admin approval.'
                                    : 'Your final payment was successful! Your order is now complete.',
                            ]);
                        }
                    } else {
                        \Log::warning('Product request not found or unauthorized', [
                            'product_request_id' => $productRequestId,
                            'user_id' => auth()->id(),
                            'tx_ref' => $txRef
                        ]);
                        // Return error page for product request payments when not found
                        $renderData = [
                            'error' => 'Product request not found or unauthorized',
                            'order_id' => null,
                            'order_number' => null,
                            'amount' => $transaction->amount ?? 0,
                            'currency' => $transaction->currency ?? 'ETB',
                            'transaction_id' => $txRef,
                            'error_code' => 'product_request_not_found',
                            'auth' => [
                                'user' => auth()->user() ? [
                                    'id' => auth()->user()->id,
                                    'name' => auth()->user()->name,
                                    'email' => auth()->user()->email,
                                ] : null,
                            ],
                        ];
                        
                        // COMPREHENSIVE LOGGING: Log what we're sending to frontend
                        \Log::error('=== RENDERING PAYMENT FAILED PAGE - DATA BEING SENT TO FRONTEND ===', [
                            'component' => 'payment/payment-failed',
                            'render_data' => $renderData,
                            'render_data_json' => json_encode($renderData, JSON_PRETTY_PRINT),
                            'render_data_keys' => array_keys($renderData),
                            'render_data_types' => array_map('gettype', $renderData),
                            'product_request_id' => $productRequestId,
                            'user_id' => auth()->id(),
                            'tx_ref' => $txRef,
                            'transaction_amount' => $transaction->amount ?? 0,
                            'transaction_currency' => $transaction->currency ?? 'ETB',
                            'transaction_id' => $transaction->id,
                            'transaction_gateway_status' => $transaction->gateway_status,
                            'transaction_admin_status' => $transaction->admin_status,
                        ]);
                        
                        // Log what the frontend component expects
                        \Log::info('=== FRONTEND COMPONENT EXPECTED PROPS ===', [
                            'expected_props' => [
                                'order_id' => 'string | null',
                                'order_number' => 'string | null',
                                'error' => 'string',
                                'error_code' => 'string | undefined',
                                'amount' => 'number | string',
                                'currency' => 'string',
                                'retry_url' => 'string | undefined',
                                'auth' => 'object | undefined',
                                'transaction_id' => 'string | undefined',
                            ],
                        ]);
                        
                        return Inertia::render('payment/payment-failed', $renderData);
                    }
                } elseif ($gatewayStatus === 'failed') {
                    // Payment failed - show product request failure page
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    if ($productRequest && $productRequest->user_id === auth()->id()) {
                        $failurePage = $isAdvancePayment 
                            ? 'product-requests/advance-payment-failure'
                            : 'product-requests/final-payment-failure';
                        
                        return Inertia::render($failurePage, [
                            'productRequest' => [
                                'id' => $productRequest->id,
                                'product_name' => $productRequest->product_name,
                                'advance_amount' => $productRequest->advance_amount,
                                'final_amount' => $productRequest->final_amount,
                                'currency' => $productRequest->currency,
                            ],
                            'error_message' => 'Payment was not successful. Please try again.',
                            'payment_method' => 'chapa',
                            'retry_url' => $isAdvancePayment 
                                ? route('payment.show', ['order_id' => 'ADV-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->advance_amount, 'payment_type' => 'product_request_advance', 'product_request_id' => $productRequest->id])
                                : route('payment.show', ['order_id' => 'FINAL-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->final_amount, 'payment_type' => 'product_request_final', 'product_request_id' => $productRequest->id]),
                        ]);
                    }
                } else {
                    // Payment pending
                    return Inertia::render('payment/payment-pending', [
                        'tx_ref' => $txRef,
                        'product_request_id' => $productRequestId,
                        'payment_type' => $isAdvancePayment ? 'advance' : 'final',
                    ]);
                }
            }
            
            // If we still don't have an order, verify payment status with Chapa first
            // Product request payments are already handled above
            if (!$order) {
                \Log::warning('No order found and not a product request payment, verifying payment with Chapa', [
                    'tx_ref' => $txRef,
                    'transaction_order_id' => $transaction->order_id,
                    'transaction_gateway_status' => $transaction->gateway_status,
                ]);
                
                // Verify payment status with Chapa API before showing error
                $verifiedStatus = $this->verifyWithChapa($txRef);
                if ($verifiedStatus === 'paid') {
                    // Payment was successful, update transaction
                    $transaction->gateway_status = 'paid';
                    $transaction->status = 'completed';
                    $transaction->save();
                    
                    // Refresh transaction and try again with OrderLookupService
                    // This will use the updated gateway_status and try amount/time matching
                    $transaction->refresh();
                    $order = $orderLookupService->getOrderForPayment($transaction);
                    
                    if ($order) {
                        \Log::info('Order found after Chapa verification using OrderLookupService', [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'transaction_order_id_normalized' => $transaction->order_id,
                        ]);
                    }
                }
                
                // If still no order found but payment was successful, show generic success
                if (!$order) {
                    \Log::error('Order not found even after Chapa verification, but payment was successful', [
                        'tx_ref' => $txRef,
                        'transaction_order_id' => $transaction->order_id,
                        'verified_status' => $verifiedStatus,
                        'customer_email' => $transaction->customer_email,
                        'user_id' => $transaction->user_id,
                        'amount' => $transaction->amount,
                    ]);
                    
                    // If payment was verified as successful, show a generic success page
                    // This handles edge cases where order might have been deleted or not properly linked
                    return Inertia::render('payment/payment-success', [
                        'order_id' => null,
                        'amount' => $transaction->amount ?? 0,
                        'currency' => $transaction->currency ?? 'ETB',
                        'payment_method' => 'Chapa',
                        'transaction_id' => $transaction->tx_ref,
                        'customer_name' => $transaction->customer_name ?? 'Customer',
                        'customer_email' => $transaction->customer_email ?? '',
                        'order_items' => [],
                        'pending_payment_approval' => false,
                        'is_advance_payment' => false,
                        'product_request_id' => null,
                        'payment_type' => 'regular',
                        'warning_message' => 'Payment was successful, but order details could not be retrieved. Please contact support with your transaction reference: ' . $txRef,
                        'show_contact_support' => true,
                    ]);
                }
            }
            
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
            
            // If gateway_status is null or empty, try to verify with Chapa API
            if (empty($gatewayStatus)) {
                \Log::info('Gateway status is empty, verifying with Chapa API', [
                    'tx_ref' => $txRef,
                    'transaction_id' => $transaction->id,
                ]);
                $verifiedStatus = $this->verifyWithChapa($txRef);
                if ($verifiedStatus !== 'pending') {
                    $gatewayStatus = $verifiedStatus;
                    // Update transaction with verified status
                    $transaction->gateway_status = $gatewayStatus;
                    $transaction->save();
                } else {
                    // If verification returns pending, default to failed for safety
                    $gatewayStatus = 'failed';
                    \Log::warning('Payment verification returned pending, defaulting to failed', [
                        'tx_ref' => $txRef,
                    ]);
                }
            }
            
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
                // Check if this is a product request payment
                $isAdvancePayment = str_starts_with($transaction->tx_ref, 'ADV-');
                $isFinalPayment = str_starts_with($transaction->tx_ref, 'FINAL-');
                $productRequestId = $transaction->product_request_id ?? null;
                
                // If we have product_request_id on transaction, use it
                if (!$productRequestId && ($isAdvancePayment || $isFinalPayment)) {
                    // Extract product request ID from transaction reference
                    $parts = explode('-', $transaction->tx_ref);
                    if (count($parts) >= 2) {
                        $productRequestId = $parts[1];
                    }
                }
                
                // Redirect to product request specific success pages
                if ($productRequestId && $isAdvancePayment) {
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    if ($productRequest && $productRequest->user_id === auth()->id()) {
                        // Refresh product request to get latest status
                        $productRequest->refresh();
                        // Use Chapa success page for online payments
                        return Inertia::render('product-requests/advance-payment-success-chapa', [
                            'productRequest' => [
                                'id' => $productRequest->id,
                                'product_name' => $productRequest->product_name,
                                'advance_amount' => $productRequest->advance_amount,
                                'final_amount' => $productRequest->final_amount,
                                'currency' => $productRequest->currency,
                                'payment_reference' => $productRequest->payment_reference,
                                'advance_payment_status' => $productRequest->advance_payment_status,
                                'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                            ],
                            'transaction_id' => $transaction->tx_ref,
                            'amount' => $transaction->amount,
                            'message' => $productRequest->advance_payment_status === 'processing' 
                                ? 'Your advance payment was successful! The payment is now pending admin approval.'
                                : 'Your advance payment was successful! We will now start procuring your product.',
                        ]);
                    }
                } elseif ($productRequestId && $isFinalPayment) {
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    if ($productRequest && $productRequest->user_id === auth()->id()) {
                        // Refresh product request to get latest status
                        $productRequest->refresh();
                        // Use Chapa success page for online payments
                        return Inertia::render('product-requests/final-payment-success-chapa', [
                            'productRequest' => [
                                'id' => $productRequest->id,
                                'product_name' => $productRequest->product_name,
                                'final_amount' => $productRequest->final_amount,
                                'currency' => $productRequest->currency,
                                'payment_reference' => $productRequest->payment_reference,
                                'final_payment_status' => $productRequest->final_payment_status,
                                'order_id' => $productRequest->order_id,
                                'workflow_status' => $productRequest->getWorkflowStatus(), // Include workflow status
                            ],
                            'transaction_id' => $transaction->tx_ref,
                            'amount' => $transaction->amount,
                            'message' => $productRequest->final_payment_status === 'processing'
                                ? 'Your final payment was successful! The payment is now pending admin approval.'
                                : 'Your final payment was successful! Your order is now complete.',
                        ]);
                    }
                }
                
                // Regular order payment success page
                // Load order with user relationship
                $order->load('user:id,name,email');
                $orderItems = $this->getOrderItemsForDisplay($order->id);
                
                return Inertia::render('payment/payment-success', [
                    'order_id' => $order->id, // Use numeric ID for route model binding
                    'order_number' => $order->order_number, // Also pass order_number for display
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'payment_method' => 'Chapa',
                    'transaction_id' => $transaction->tx_ref,
                    'customer_name' => $order->user->name ?? 'Customer',
                    'customer_email' => $order->user->email ?? '',
                    'order_items' => $orderItems,
                    'pending_payment_approval' => $transaction->admin_status === 'pending',
                    'is_advance_payment' => false,
                    'product_request_id' => null,
                    'payment_type' => 'regular',
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
                
                // Check if this is a product request payment failure
                $isAdvancePayment = str_starts_with($transaction->tx_ref, 'ADV-');
                $isFinalPayment = str_starts_with($transaction->tx_ref, 'FINAL-');
                $productRequestId = $transaction->product_request_id ?? null;
                
                if (!$productRequestId && ($isAdvancePayment || $isFinalPayment)) {
                    $parts = explode('-', $transaction->tx_ref);
                    if (count($parts) >= 2) {
                        $productRequestId = $parts[1];
                    }
                }
                
                if ($productRequestId) {
                    $productRequest = \App\Models\ProductRequest::find($productRequestId);
                    if ($productRequest && $productRequest->user_id === auth()->id()) {
                        $failurePage = $isAdvancePayment 
                            ? 'product-requests/advance-payment-failure'
                            : 'product-requests/final-payment-failure';
                        
                        return Inertia::render($failurePage, [
                            'productRequest' => [
                                'id' => $productRequest->id,
                                'product_name' => $productRequest->product_name,
                                'advance_amount' => $productRequest->advance_amount,
                                'final_amount' => $productRequest->final_amount,
                                'currency' => $productRequest->currency,
                            ],
                            'error_message' => 'Payment was not successful. Please try again.',
                            'payment_method' => 'chapa',
                            'retry_url' => $isAdvancePayment 
                                ? route('payment.show', ['order_id' => 'ADV-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->advance_amount, 'payment_type' => 'product_request_advance', 'product_request_id' => $productRequest->id])
                                : route('payment.show', ['order_id' => 'FINAL-' . $productRequest->id . '-' . time(), 'amount' => $productRequest->final_amount, 'payment_type' => 'product_request_final', 'product_request_id' => $productRequest->id]),
                        ]);
                    }
                }
                
                // Regular order payment failure page
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
                        'image' => ImageUrlService::formatImageUrl($item->image),
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get order items: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Retry a rejected payment
     */
    public function retryPayment(Request $request, PaymentTransaction $payment)
    {
        try {
            // Validate that payment can be retried
            if (!$payment->isAdminRejected()) {
                return back()->with('error', 'Only rejected payments can be retried.');
            }

            // Check if user owns this payment
            if (auth()->check() && $payment->customer_email !== auth()->user()->email) {
                return back()->with('error', 'You can only retry your own payments.');
            }

            // Reset payment status for retry
            // Note: admin_status is an ENUM and cannot be null, so we reset it to 'unseen'
            // IMPORTANT: Also reset gateway_status to prevent showing incorrect "paid" status
            $payment->update([
                'admin_status' => 'unseen',
                'gateway_status' => 'pending', // Reset gateway status for retry
                'status' => 'pending', // Reset transaction status
                'admin_notes' => null,
                'rejection_reason_code' => null,
                'admin_id' => null,
                'admin_action_at' => null,
            ]);

            // For product request payments, reset the payment status
            if ($payment->product_request_id) {
                $productRequest = \App\Models\ProductRequest::find($payment->product_request_id);
                if ($productRequest) {
                    // Determine if this is advance or final payment based on tx_ref
                    $txRef = $payment->tx_ref;
                    if (str_starts_with($txRef, 'ADV-')) {
                        // Reset advance payment status
                        $productRequest->update([
                            'advance_payment_status' => 'pending',
                        ]);
                        \Log::info('Reset advance payment status for retry', [
                            'product_request_id' => $productRequest->id,
                            'payment_id' => $payment->id,
                        ]);
                    } elseif (str_starts_with($txRef, 'FINAL-')) {
                        // Reset final payment status
                        $productRequest->update([
                            'final_payment_status' => 'pending',
                        ]);
                        \Log::info('Reset final payment status for retry', [
                            'product_request_id' => $productRequest->id,
                            'payment_id' => $payment->id,
                        ]);
                    }
                }
            }

            // For regular orders, reset order status if it was cancelled
            // Note: Order status enum is ['processing', 'shipped', 'delivered', 'cancelled']
            // So we reset to 'processing' instead of 'pending'
            if ($payment->order_id) {
                $order = Order::find($payment->order_id);
                if ($order && $order->status === 'cancelled') {
                    $order->update([
                        'status' => 'processing',
                    ]);
                }
            }

            \Log::info('Payment retry initiated', [
                'payment_id' => $payment->id,
                'user_email' => auth()->user()->email ?? $payment->customer_email,
            ]);

            // Redirect to appropriate payment page
            if ($payment->product_request_id) {
                $productRequest = \App\Models\ProductRequest::find($payment->product_request_id);
                if ($productRequest) {
                    $txRef = $payment->tx_ref;
                    if (str_starts_with($txRef, 'ADV-')) {
                        return redirect()->route('product-requests.advance-payment.show', $payment->product_request_id)
                            ->with('success', 'Payment reset. You can now retry the payment.');
                    } elseif (str_starts_with($txRef, 'FINAL-')) {
                        return redirect()->route('product-requests.final-payment.show', $payment->product_request_id)
                            ->with('success', 'Payment reset. You can now retry the payment.');
                    }
                }
                // Fallback to product request show page
                return redirect()->route('user.product-requests.show', $payment->product_request_id)
                    ->with('success', 'Payment reset. You can now retry the payment.');
            } else {
                // Regular order payment - redirect to payment page with order details (shows both Chapa and Offline options)
                $order = Order::with('items.product')->find($payment->order_id);
                if ($order) {
                    // Prepare cart items from order items for the payment page
                    $cartItems = $order->items->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'name' => $item->product->name ?? 'Product',
                            'price' => (float) $item->price,
                            'quantity' => $item->quantity,
                            'total' => (float) $item->total,
                        ];
                    })->toArray();

                    return redirect()->route('payment.show', [
                        'order_id' => $order->order_number,
                        'amount' => $order->total_amount,
                        'currency' => $order->currency,
                        'cart_items' => json_encode($cartItems),
                        'show_method_selection' => true, // Show payment method selection page
                        'retry' => true, // Indicate this is a retry payment
                    ])->with('success', 'Payment reset. You can now retry the payment.');
                }
                // Fallback to checkout if order not found
                return redirect()->route('checkout')
                    ->with('error', 'Order not found. Please add items to cart and try again.');
            }
        } catch (\Exception $e) {
            \Log::error('Payment retry failed: ' . $e->getMessage(), [
                'payment_id' => $payment->id ?? null,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Failed to retry payment. Please try again.');
        }
    }
}