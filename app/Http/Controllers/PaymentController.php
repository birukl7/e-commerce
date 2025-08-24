<?php
// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Str;
// use Inertia\Inertia;
// use App\Models\OfflinePaymentMethod;
// use App\Models\OfflinePaymentSubmission;
// use Illuminate\Support\Facades\Storage;

// class PaymentController extends Controller
// {
//     private $chapaSecretKey;
//     private $chapaPublicKey;
//     private $chapaBaseUrl;

//     public function __construct()
//     {
//         $this->chapaSecretKey = config('services.chapa.secret_key');
//         $this->chapaPublicKey = config('services.chapa.public_key');
//         $this->chapaBaseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
//     }
//     public function selectMethod(Request $request)
//     {
//         $orderId = $request->get('order_id');
//         $amount = $request->get('amount');
//         $currency = $request->get('currency','ETB');

//         return Inertia::render('payment/select-method', [
//             'order_id' => $orderId,
//             'amount' => $amount,
//             'currency' => $currency,
//         ]);
//     }

//     public function submitOffline(Request $request)
//     {
//         $request->validate([
//             'order_id' => 'required|string',
//             'amount' => 'required|numeric|min:1',
//             'currency' => 'required|string',
//             'offline_payment_method_id' => 'required|integer|exists:offline_payment_methods,id',
//             'payment_reference' => 'nullable|string|max:255',
//             'payment_notes' => 'nullable|string|max:5000',
//             'payment_screenshot' => 'required|image|max:5120', // 5MB
//         ]);

//         $path = $request->file('payment_screenshot')->store('offline-payments', 'public');

//         $submission = OfflinePaymentSubmission::create([
//             'user_id' => auth()->id(),
//             'order_id' => $request->order_id,
//             'offline_payment_method_id' => $request->offline_payment_method_id,
//             'amount' => $request->amount,
//             'currency' => $request->currency,
//             'payment_reference' => $request->payment_reference,
//             'notes' => $request->payment_notes,
//             'screenshot_path' => $path,
//             'status' => 'pending',
//             'submitted_at' => now(),
//         ]);

//         // Optionally create a pending payment transaction record in payment_transactions table
//         DB::table('payment_transactions')->insert([
//             'tx_ref' => 'OFFLINE-' . Str::random(8) . '-' . time(),
//             'order_id' => $request->order_id,
//             'amount' => $request->amount,
//             'currency' => $request->currency,
//             'customer_email' => auth()->user()->email,
//             'customer_name' => auth()->user()->name,
//             'payment_method' => 'offline',
//             'status' => 'pending',
//             'checkout_url' => null,
//             'created_at' => now(),
//             'updated_at' => now(),
//         ]);

//         //return redirect()->route('payment.offline.success');
//         return redirect()->route('payment/offline-submission-success', [
//             'submission_ref' => $submissionRef,
//             'order_id' => $validated['order_id'],
//             'amount' => $validated['amount'],
//             'currency' => $validated['currency'],
//             'payment_method' => $submission->paymentMethod->name,
//         ]);
//     }


//     public function showPaymentPage(Request $request)
//     {
//         $orderId = $request->get('order_id', 'ORDER-' . Str::random(10));
//         $amount = $request->get('amount', 0);
//         $currency = $request->get('currency', 'ETB');
        
//         // Get customer info from auth or session
//         $user = auth()->check() ? auth()->user() : null;
//         $customerEmail = $user ? $user->email : '';
//         $customerName = $user ? $user->name : '';
//         // $customerPhone = $user ? $user->phone : '';

//         // Get active offline payment methods - Force test data for now
//         $offlinePaymentMethods = collect([
//             (object) [
//                 'id' => 1,
//                 'name' => 'Commercial Bank of Ethiopia',
//                 'type' => 'bank',
//                 'description' => 'Transfer money to our CBE bank account and upload the receipt',
//                 'instructions' => 'Please transfer the exact amount to our CBE account and upload a clear screenshot of your payment confirmation.',
//                 'details' => [
//                     'account_name' => 'ShopHub E-commerce',
//                     'account_number' => '1000123456789',
//                     'bank_name' => 'Commercial Bank of Ethiopia',
//                     'branch' => 'Main Branch'
//                 ],
//                 'logo' => null,
//                 'is_active' => true,
//                 'sort_order' => 1,
//             ],
//             (object) [
//                 'id' => 2,
//                 'name' => 'Telebirr Mobile Money',
//                 'type' => 'mobile',
//                 'description' => 'Send payment via Telebirr mobile money and upload the confirmation SMS screenshot',
//                 'instructions' => 'Send the exact amount to our Telebirr number and upload a screenshot of the success message.',
//                 'details' => [
//                     'phone_number' => '+251911234567',
//                     'account_name' => 'ShopHub Store',
//                     'service' => 'Telebirr'
//                 ],
//                 'logo' => null,
//                 'is_active' => true,
//                 'sort_order' => 2,
//             ],
//         ]);

//         // TODO: Replace with database query once migrations are run
//         // try {
//         //     $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
//         //     if ($offlinePaymentMethods->isEmpty()) {
//         //         $offlinePaymentMethods = $testData; // Use test data if DB is empty
//         //     }
//         // } catch (\Exception $e) {
//         //     $offlinePaymentMethods = $testData; // Use test data if table doesn't exist
//         // }

//         return Inertia::render('payment/payment-process', [
//             'order_id' => $orderId,
//             'total_amount' => $amount,
//             'currency' => $currency,
//             'customer_email' => $customerEmail,
//             'customer_name' => $customerName,
//             // 'customer_phone' => $customerPhone,
//             'offlinePaymentMethods' => $offlinePaymentMethods,
//         ]);
//     }

//     public function processPayment(Request $request)
//     {
//         $request->validate([
//             'payment_method' => 'required|in:telebirr,cbe,paypal',
//             'customer_name' => 'required|string|max:255',
//             'customer_email' => 'required|email',
//             // 'customer_phone' => 'required|string',
//             'order_id' => 'required|string',
//             'amount' => 'required|numeric|min:1',
//             'currency' => 'required|string|in:ETB,USD',
//         ]);

//         try {
//             // Generate transaction reference
//             $txRef = 'TX-' . Str::random(10) . '-' . time();
//             $description = 'Payment for Order: ' . $request->order_id;
            
//             // Prepare Chapa payment data
//             $paymentData = [
//                 'amount' => $request->amount,
//                 'currency' => $request->currency,
//                 'email' => $request->customer_email,
//                 'first_name' => explode(' ', $request->customer_name)[0],
//                 'last_name' => explode(' ', $request->customer_name . ' ')[1] ?? '',
//                 'phone_number' => $request->customer_phone,
//                 'tx_ref' => $txRef,
//                 'callback_url' => route('payment.callback'),
//                 'return_url' => route('payment.return', ['tx_ref' => $txRef]), 
//                 'customization' => [
//                     'title' => 'ShopHub Payment',
//                     'description' => preg_replace('/[^a-zA-Z0-9\s\._-]/', '', $description), 
//                     'logo' => asset('images/logo.png'),
//                 ],
//                 'meta' => [
//                     'order_id' => $request->order_id,
//                     'payment_method' => $request->payment_method,
//                 ],
//             ];

//             // Make request to Chapa API
//             $response = Http::withHeaders([
//                 'Authorization' => 'Bearer ' . $this->chapaSecretKey,
//                 'Content-Type' => 'application/json',
//             ])->post($this->chapaBaseUrl . '/transaction/initialize', $paymentData);

//             if ($response->successful()) {
//                 $responseData = $response->json();
                
//                 if ($responseData['status'] === 'success') {
//                     // Store transaction details in database
//                     $this->storeTransaction([
//                         'tx_ref' => $txRef,
//                         'order_id' => $request->order_id,
//                         'amount' => $request->amount,
//                         'currency' => $request->currency,
//                         'customer_email' => $request->customer_email,
//                         'customer_name' => $request->customer_name,
//                         'customer_phone' => $request->customer_phone,
//                         'payment_method' => $request->payment_method,
//                         'status' => 'pending',
//                         'checkout_url' => $responseData['data']['checkout_url'],
//                     ]);

//                     return Inertia::location($responseData['data']['checkout_url']);
//                 }
//             }
//             Log::error('Chapa payment initialization failed', [
//                 'response' => $response->json(),
//                 'status' => $response->status(),
//             ]);

//             return back()->withErrors([
//                 'payment' => 'Failed to initialize payment. Please try again.'
//             ]);

//         } catch (\Exception $e) {
//             Log::error('Payment processing error: ' . $e->getMessage());
            
//             return back()->withErrors([
//                 'payment' => 'An error occurred while processing your payment. Please try again.'
//             ]);
//         }
//     }

//     public function paymentReturn(string $txRef)
//     {
//         try {
//             $response = Http::withHeaders([
//                 'Authorization' => 'Bearer ' . $this->chapaSecretKey,
//             ])->get($this->chapaBaseUrl . '/transaction/verify/' . $txRef);

//             Log::info('Chapa verification response for ' . $txRef, [
//                 'status' => $response->status(),
//                 'body' => $response->json(),
//             ]);

//             if ($response->successful()) {
//                 $data = $response->json()['data'];
                
//                 if ($data['status'] === 'success') {
//                     // Update transaction status
//                     $this->updateTransactionStatus($txRef, 'completed', $data);
                    
//                     return Inertia::render('payment/payment-success', [
//                         'order_id' => $data['meta']['order_id'] ?? 'N/A',
//                         'transaction_id' => $data['id'] ?? $txRef,
//                         'amount' => floatval($data['amount'] ?? 0),
//                         'currency' => $data['currency'] ?? 'ETB',
//                         'payment_method' => $data['payment_type'] ?? $data['meta']['payment_method'] ?? 'unknown',
//                         'customer_name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
//                         'customer_email' => $data['email'] ?? '',
//                         'order_items' => [], // Add order items if available
//                     ]);
//                 }
//             }
            
//             // Handle failed payment
//             $data = $response->json();
//             $this->updateTransactionStatus($txRef, 'failed', $data);
            
//             return Inertia::render('payment/payment-failed', [
//                 'order_id' => $data['data']['meta']['order_id'] ?? null,
//                 'error_message' => $data['message'] ?? 'Payment failed',
//                 'error_code' => $data['status'] ?? 'unknown_error',
//                 'amount' => null,
//                 'currency' => 'ETB',
//                 'retry_url' => null, // Add retry URL if you want to allow retries
//             ]);
            
//         } catch (\Exception $e) {
//             Log::error('Payment return error: ' . $e->getMessage());
            
//             return Inertia::render('payment/payment-failed', [
//                 'order_id' => null,
//                 'error_message' => 'An error occurred while verifying the payment.',
//                 'error_code' => 'verification_error',
//                 'amount' => null,
//                 'currency' => 'ETB',
//                 'retry_url' => null,
//             ]);
//         }
//     }

//     private function storeTransaction($data)
//     {
//         DB::table('payment_transactions')->insert([
//             'tx_ref' => $data['tx_ref'],
//             'order_id' => $data['order_id'],
//             'amount' => $data['amount'],
//             'currency' => $data['currency'],
//             'customer_email' => $data['customer_email'],
//             'customer_name' => $data['customer_name'],
//             'customer_phone' => $data['customer_phone'],
//             'payment_method' => $data['payment_method'],
//             'status' => $data['status'],
//             'checkout_url' => $data['checkout_url'],
//             'created_at' => now(),
//             'updated_at' => now(),
//         ]);
//     }

//     // private function updateTransactionStatus($txRef, $status, $chapaData = null)
//     // {
//     //     DB::table('payment_transactions')
//     //         ->where('tx_ref', $txRef)
//     //         ->update([
//     //             'status' => $status,
//     //             'chapa_data' => json_encode($chapaData),
//     //             'updated_at' => now(),
//     //         ]);
//     // }
//     private function updateTransactionStatus($txRef, $status, $chapaData = null)
//     {
//         try {
//             DB::table('payment_transactions')
//                 ->where('tx_ref', $txRef)
//                 ->update([
//                     'status' => $status,
//                     'chapa_data' => $chapaData ? json_encode($chapaData) : null,
//                     'updated_at' => now(),
//                 ]);
//         } catch (\Exception $e) {
//             Log::error('Failed to update transaction status: ' . $e->getMessage());
//         }
//     }

//     private function getTransaction($txRef)
//     {
//         return DB::table('payment_transactions')
//             ->where('tx_ref', $txRef)
//             ->first();
//     }

//     // ... rest of existing methods ...
// }

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\OfflinePaymentMethod;
use App\Models\OfflinePaymentSubmission;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    private $chapaSecretKey;
    private $chapaPublicKey;
    private $chapaBaseUrl;

    public function __construct()
    {
        $this->chapaSecretKey = config('services.chapa.secret_key');
        $this->chapaPublicKey = config('services.chapa.public_key');
        $this->chapaBaseUrl = config('services.chapa.base_url', 'https://api.chapa.co/v1');
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
        
        // Get customer info from auth
        $user = auth()->check() ? auth()->user() : null;
        $customerEmail = $user ? $user->email : '';
        $customerName = $user ? $user->name : '';

        // Get offline payment methods for offline payments
        $offlinePaymentMethods = collect();
        if ($paymentMethod === 'offline') {
            // Use test data for now - replace with database query once migrations are run
            $offlinePaymentMethods = collect([
                (object) [
                    'id' => 1,
                    'name' => 'Commercial Bank of Ethiopia',
                    'type' => 'bank',
                    'description' => 'Transfer money to our CBE bank account and upload the receipt',
                    'instructions' => 'Please transfer the exact amount to our CBE account and upload a clear screenshot of your payment confirmation.',
                    'details' => [
                        'account_name' => 'ShopHub E-commerce',
                        'account_number' => '1000123456789',
                        'bank_name' => 'Commercial Bank of Ethiopia',
                        'branch' => 'Main Branch'
                    ],
                    'logo' => null,
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                (object) [
                    'id' => 2,
                    'name' => 'Telebirr Mobile Money',
                    'type' => 'mobile',
                    'description' => 'Send payment via Telebirr mobile money and upload the confirmation SMS screenshot',
                    'instructions' => 'Send the exact amount to our Telebirr number and upload a screenshot of the success message.',
                    'details' => [
                        'phone_number' => '+251911234567',
                        'account_name' => 'ShopHub Store',
                        'service' => 'Telebirr'
                    ],
                    'logo' => null,
                    'is_active' => true,
                    'sort_order' => 2,
                ],
            ]);
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
                        'payment_method' => $request->payment_method,
                        'status' => 'pending',
                        'checkout_url' => $responseData['data']['checkout_url'],
                    ]);

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
                    // Update transaction status
                    $this->updateTransactionStatus($txRef, 'completed', $data);
                    
                    // Get order items if order exists
                    $orderItems = [];
                    $orderId = $data['meta']['order_id'] ?? null;
                    if ($orderId) {
                        $orderItems = DB::table('order_items as oi')
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
                    }
                    
                    return Inertia::render('payment/payment-success', [
                        'order_id' => $orderId ?? 'N/A',
                        'transaction_id' => $data['id'] ?? $txRef,
                        'amount' => floatval($data['amount'] ?? 0),
                        'currency' => $data['currency'] ?? 'ETB',
                        'payment_method' => $data['payment_type'] ?? $data['meta']['payment_method'] ?? 'unknown',
                        'customer_name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                        'customer_email' => $data['email'] ?? '',
                        'order_items' => $orderItems,
                    ]);
                }
            }
            
            // Handle failed payment
            $data = $response->json();
            $this->updateTransactionStatus($txRef, 'failed', $data);
            
            return Inertia::render('payment/payment-failed', [
                'order_id' => $data['data']['meta']['order_id'] ?? null,
                'error_message' => $data['message'] ?? 'Payment failed',
                'error_code' => $data['status'] ?? 'unknown_error',
                'amount' => null,
                'currency' => 'ETB',
                'retry_url' => null, // Add retry URL if you want to allow retries
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

    private function getTransaction($txRef)
    {
        return DB::table('payment_transactions')
            ->where('tx_ref', $txRef)
            ->first();
    }
}