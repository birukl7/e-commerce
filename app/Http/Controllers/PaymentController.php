<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\OfflinePaymentMethod;

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

    public function showPaymentPage(Request $request)
    {
        $orderId = $request->get('order_id', 'ORDER-' . Str::random(10));
        $amount = $request->get('amount', 0);
        $currency = $request->get('currency', 'ETB');
        
        // Get customer info from auth or session
        $user = auth()->check() ? auth()->user() : null;
        $customerEmail = $user ? $user->email : '';
        $customerName = $user ? $user->name : '';
        // $customerPhone = $user ? $user->phone : '';

        // Get active offline payment methods - Force test data for now
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

        // TODO: Replace with database query once migrations are run
        // try {
        //     $offlinePaymentMethods = OfflinePaymentMethod::active()->ordered()->get();
        //     if ($offlinePaymentMethods->isEmpty()) {
        //         $offlinePaymentMethods = $testData; // Use test data if DB is empty
        //     }
        // } catch (\Exception $e) {
        //     $offlinePaymentMethods = $testData; // Use test data if table doesn't exist
        // }

        return Inertia::render('payment/payment-process', [
            'order_id' => $orderId,
            'total_amount' => $amount,
            'currency' => $currency,
            'customer_email' => $customerEmail,
            'customer_name' => $customerName,
            // 'customer_phone' => $customerPhone,
            'offlinePaymentMethods' => $offlinePaymentMethods,
        ]);
    }

    public function processPayment(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:telebirr,cbe,paypal',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            // 'customer_phone' => 'required|string',
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
                    
                    return Inertia::render('payment/payment-success', [
                        'order_id' => $data['meta']['order_id'] ?? 'N/A',
                        'transaction_id' => $data['id'] ?? $txRef,
                        'amount' => floatval($data['amount'] ?? 0),
                        'currency' => $data['currency'] ?? 'ETB',
                        'payment_method' => $data['payment_type'] ?? $data['meta']['payment_method'] ?? 'unknown',
                        'customer_name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                        'customer_email' => $data['email'] ?? '',
                        'order_items' => [], // Add order items if available
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
            'customer_phone' => $data['customer_phone'],
            'payment_method' => $data['payment_method'],
            'status' => $data['status'],
            'checkout_url' => $data['checkout_url'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // private function updateTransactionStatus($txRef, $status, $chapaData = null)
    // {
    //     DB::table('payment_transactions')
    //         ->where('tx_ref', $txRef)
    //         ->update([
    //             'status' => $status,
    //             'chapa_data' => json_encode($chapaData),
    //             'updated_at' => now(),
    //         ]);
    // }
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

    // ... rest of existing methods ...
}
