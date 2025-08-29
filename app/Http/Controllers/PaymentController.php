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
        // Resolve PaymentFinalizer via the container to avoid breaking existing route bindings
        $this->paymentFinalizer = app(PaymentFinalizer::class);
    }

    public function selectMethod(Request $request)
    {
        // Generate order ID if not provided
        $orderId = $request->get('order_id', 'ORDER-' . Str::random(10) . '-' . time());
        $amount = $request->get('amount', 0);
        $currency = $request->get('currency', 'ETB');

        // Validate required data
        if (!$amount || $amount <= 0) {
            return redirect()->route('checkout')->with('error', 'Invalid amount specified');
        }

        // Create order when user proceeds to payment
        $this->createOrderFromCart($orderId, $amount, $currency);

        return Inertia::render('admin/payment/select-method', [
            'order_id' => $orderId,
            'amount' => floatval($amount),
            'currency' => $currency,
        ]);
    }

    public function showPaymentPage(Request $request)
    {
        // Get payment data from request
        $orderId = $request->get('order_id');
        $amount = $request->get('amount', 0);
        $currency = $request->get('currency', 'ETB');
        $paymentMethod = $request->get('payment_method'); // 'offline' or null for regular

        // Validate required data
        if (!$orderId || !$amount || $amount <= 0) {
            return redirect()->route('checkout')->with('error', 'Missing payment information');
        }

        // Create order if it doesn't exist
        $existingOrder = Order::where('order_number', $orderId)->first();
        if (!$existingOrder) {
            $this->createOrderFromCart($orderId, $amount, $currency);
        }
        
        // Get customer info from auth
        $user = auth()->check() ? auth()->user() : null;
        $customerEmail = $user ? $user->email : '';
        $customerName = $user ? $user->name : '';

        // Get offline payment methods for offline payments
        $offlinePaymentMethods = collect();
        if ($paymentMethod === 'offline') {
            $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
        }

        return Inertia::render('payment/payment-process', [
            'order_id' => $orderId,
            'total_amount' => floatval($amount),
            'currency' => $currency,
            'customer_email' => $customerEmail,
            'customer_name' => $customerName,
            'payment_method_type' => $paymentMethod, // 'offline' or null
            'offlinePaymentMethods' => $offlinePaymentMethods,
        ]);
    }

    public function submitOffline(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string',
            'offline_payment_method_id' => 'required|integer',
            'payment_reference' => 'nullable|string|max:255',
            'payment_notes' => 'nullable|string|max:5000',
            'payment_screenshot' => 'required|image|max:5120', // 5MB
        ]);

        try {
            // Store the uploaded screenshot
            $path = $request->file('payment_screenshot')->store('offline-payments', 'public');

            // Generate unique submission reference
            $submissionRef = 'OFFLINE-' . Str::random(8) . '-' . time();

            // Get user info
            $user = auth()->user();

            // Create offline payment submission
            $submission = OfflinePaymentSubmission::create([
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
            ]);

            // Create corresponding payment transaction record
            DB::table('payment_transactions')->insert([
                'tx_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'customer_email' => $user->email,
                'customer_name' => $user->name,
                'payment_method' => 'offline',
                'status' => 'pending',
                'checkout_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update order payment status to pending (remains pending until admin verifies)
            $this->updateOrderPaymentStatus($validated['order_id'], 'pending', 'offline');

            // Get payment method name for display
            $paymentMethodName = 'Offline Payment';
            if ($validated['offline_payment_method_id'] == 1) {
                $paymentMethodName = 'Commercial Bank of Ethiopia';
            } elseif ($validated['offline_payment_method_id'] == 2) {
                $paymentMethodName = 'Telebirr Mobile Money';
            }

            return redirect()->route('payment.offline.success', [
                'submission_ref' => $submissionRef,
                'order_id' => $validated['order_id'],
                'amount' => $validated['amount'],
                'currency' => $validated['currency'],
                'payment_method' => $paymentMethodName,
            ]);
        } catch (\Exception $e) {
            Log::error('Offline payment submission error: ' . $e->getMessage());
            
            return back()->withErrors([
                'payment' => 'An error occurred while submitting your payment. Please try again.'
            ])->withInput();
        }
    }

    public function offlineSubmissionSuccess(Request $request)
    {
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
    }

    public function processPayment(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:telebirr,cbe,paypal',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string',
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:ETB,USD',
        ]);

        try {
            // Generate transaction reference
            $txRef = 'TX-' . Str::random(10) . '-' . time();
            $description = 'Payment for Order: ' . $request->order_id;
            
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

            // Make request to Chapa API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->chapaSecretKey,
                'Content-Type' => 'application/json',
            ])->post($this->chapaBaseUrl . '/transaction/initialize', $paymentData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if ($responseData['status'] === 'success') {
                    // Store transaction details in database
                    $this->storeTransaction([
                        'tx_ref' => $txRef,
                        'order_id' => $request->order_id,
                        'amount' => $request->amount,
                        'currency' => $request->currency,
                        'customer_email' => $request->customer_email,
                        'customer_name' => $request->customer_name,
                        'customer_phone' => $request->customer_phone,
                        'payment_method' => 'chapa', // Always use 'chapa' for Chapa payments
                        'status' => 'pending',
                        'checkout_url' => $responseData['data']['checkout_url'],
                    ]);

                    // Update order payment status to pending and set payment method
                    $this->updateOrderPaymentStatus($request->order_id, 'pending', $request->payment_method);

                    return Inertia::location($responseData['data']['checkout_url']);
                }
            }
            
            Log::error('Chapa payment initialization failed', [
                'response' => $response->json(),
                'status' => $response->status(),
            ]);

            return back()->withErrors([
                'payment' => 'Failed to initialize payment. Please try again.'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment processing error: ' . $e->getMessage());
            
            return back()->withErrors([
                'payment' => 'An error occurred while processing your payment. Please try again.'
            ]);
        }
    }

    public function paymentReturn(string $txRef)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->chapaSecretKey,
            ])->get($this->chapaBaseUrl . '/transaction/verify/' . $txRef);

            Log::info('Chapa verification response for ' . $txRef, [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            if ($response->successful()) {
                $data = $response->json()['data'];
                
                if ($data['status'] === 'success') {
                    // Mark gateway as paid but require admin approval before finalization
                    $this->paymentFinalizer->updateGatewayStatus($txRef, 'paid', $data);

                    // Prepare success page props
                    $orderId = $data['meta']['order_id'] ?? null;
                    if ($orderId) {
                        // Do NOT mark order as paid here; admin approval is required.
                        $orderItems = $this->getOrderItemsForDisplay($orderId);
                    }

                    return Inertia::render('payment/payment-success', [
                        'order_id' => $orderId ?? 'N/A',
                        'transaction_id' => $data['id'] ?? $txRef,
                        'amount' => floatval($data['amount'] ?? 0),
                        'currency' => $data['currency'] ?? 'ETB',
                        'payment_method' => $data['payment_type'] ?? $data['meta']['payment_method'] ?? 'unknown',
                        'customer_name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                        'customer_email' => $data['email'] ?? '',
                        'order_items' => $orderItems ?? [],
                        'awaiting_admin_approval' => true,
                    ]);
                }
            }
            
            // Handle failed payment
            $data = $response->json();
            $orderId = $data['data']['meta']['order_id'] ?? null;
            $this->updateOrderPaymentStatus($orderId, 'failed', null);
            $this->updateTransactionStatus($txRef, 'failed', $data);
            
            return Inertia::render('payment/payment-failed', [
                'order_id' => $orderId,
                'error_message' => $data['message'] ?? 'Payment failed',
                'error_code' => $data['status'] ?? 'unknown_error',
                'amount' => null,
                'currency' => 'ETB',
                'retry_url' => null,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Payment return error: ' . $e->getMessage());
            
            return Inertia::render('payment/payment-failed', [
                'order_id' => null,
                'error_message' => 'An error occurred while verifying the payment.',
                'error_code' => 'verification_error',
                'amount' => null,
                'currency' => 'ETB',
                'retry_url' => null,
            ]);
        }
    }

    // FIXED: Improved order creation method
    private function createOrderFromCart($orderId, $amount, $currency)
    {
        $user = auth()->user();
        if (!$user) {
            return null;
        }

        // Check if order already exists
        $existingOrder = Order::where('order_number', $orderId)->first();
        if ($existingOrder) {
            return $existingOrder;
        }

        try {
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

            return $order;
        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return null;
        }
    }

    // FIXED: Renamed and improved order update method
    private function updateOrderPaymentStatus($orderId, $paymentStatus, $paymentMethod = null)
    {
        try {
            $order = Order::where('order_number', $orderId)->first();
            if ($order) {
                $order->payment_status = $paymentStatus;
                if ($paymentMethod) {
                    $order->payment_method = $paymentMethod;
                }
                $order->save();

                Log::info("Order {$orderId} payment status updated to: {$paymentStatus}");
            } else {
                Log::warning("Order not found for update: {$orderId}");
            }
        } catch (\Exception $e) {
            Log::error('Failed to update order payment status: ' . $e->getMessage());
        }
    }

    // NEW: Helper method to get order items for display
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

    private function storeTransaction($data)
    {
        DB::table('payment_transactions')->insert([
            'tx_ref' => $data['tx_ref'],
            'order_id' => $data['order_id'],
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'customer_email' => $data['customer_email'],
            'customer_name' => $data['customer_name'],
            'customer_phone' => $data['customer_phone'] ?? null,
            'payment_method' => $data['payment_method'],
            'status' => $data['status'],
            'checkout_url' => $data['checkout_url'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function updateTransactionStatus($txRef, $status, $chapaData = null)
    {
        try {
            DB::table('payment_transactions')
                ->where('tx_ref', $txRef)
                ->update([
                    'status' => $status,
                    'chapa_data' => $chapaData ? json_encode($chapaData) : null,
                    'updated_at' => now(),
                ]);
        } catch (\Exception $e) {
            Log::error('Failed to update transaction status: ' . $e->getMessage());
        }
    }
}