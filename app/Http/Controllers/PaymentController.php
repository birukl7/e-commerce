<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

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
        $user = auth()->user();
        $customerEmail = $user ? $user->email : '';
        $customerName = $user ? $user->name : '';
        $customerPhone = $user ? $user->phone : '';

        return Inertia::render('payment/payment-process', [
            'order_id' => $orderId,
            'total_amount' => $amount,
            'currency' => $currency,
            'customer_email' => $customerEmail,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
        ]);
    }

    public function processPayment(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:telebirr,cbe,paypal',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
            'order_id' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|in:ETB,USD',
        ]);

        try {
            // Generate transaction reference
            $txRef = 'TX-' . Str::random(10) . '-' . time();
            
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
                'return_url' => route('payment.success'),
                'customization' => [
                    'title' => 'ShopHub Payment',
                    'description' => 'Payment for Order: ' . $request->order_id,
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

            // If we reach here, something went wrong
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

    public function paymentCallback(Request $request)
    {
        $txRef = $request->get('tx_ref');
        
        if (!$txRef) {
            Log::error('Payment callback received without tx_ref');
            return response()->json(['status' => 'error'], 400);
        }

        try {
            // Verify transaction with Chapa
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->chapaSecretKey,
            ])->get($this->chapaBaseUrl . '/transaction/verify/' . $txRef);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'success' && $data['data']['status'] === 'success') {
                    // Update transaction status
                    $this->updateTransactionStatus($txRef, 'completed', $data['data']);
                    
                    return response()->json(['status' => 'success']);
                } else {
                    // Payment failed
                    $this->updateTransactionStatus($txRef, 'failed', $data['data']);
                    
                    return response()->json(['status' => 'failed']);
                }
            }

        } catch (\Exception $e) {
            Log::error('Payment callback error: ' . $e->getMessage());
        }

        return response()->json(['status' => 'error'], 500);
    }

    public function paymentSuccess(Request $request)
    {
        $txRef = $request->get('tx_ref');
        
        if (!$txRef) {
            return redirect()->route('payment.failed')->with('error', 'Invalid transaction reference');
        }

        // Get transaction details from database
        $transaction = $this->getTransaction($txRef);
        
        if (!$transaction) {
            return redirect()->route('payment.failed')->with('error', 'Transaction not found');
        }

        if ($transaction['status'] !== 'completed') {
            return redirect()->route('payment.failed')->with('error', 'Payment not completed');
        }

        return Inertia::render('payment/payment-success', [
            'order_id' => $transaction['order_id'],
            'transaction_id' => $txRef,
            'amount' => $transaction['amount'],
            'currency' => $transaction['currency'],
            'payment_method' => $transaction['payment_method'],
            'customer_name' => $transaction['customer_name'],
            'customer_email' => $transaction['customer_email'],
            'order_items' => $this->getOrderItems($transaction['order_id']),
        ]);
    }

    public function paymentFailed(Request $request)
    {
        $txRef = $request->get('tx_ref');
        $errorMessage = $request->get('error', 'Payment failed');
        $errorCode = $request->get('error_code');
        
        $transaction = null;
        if ($txRef) {
            $transaction = $this->getTransaction($txRef);
        }

        return Inertia::render('payment/payment-failed', [
            'order_id' => $transaction['order_id'] ?? null,
            'error_message' => $errorMessage,
            'error_code' => $errorCode,
            'amount' => $transaction['amount'] ?? null,
            'currency' => $transaction['currency'] ?? 'ETB',
            'retry_url' => $transaction ? route('payment.show', ['order_id' => $transaction['order_id'], 'amount' => $transaction['amount']]) : null,
        ]);
    }

    private function storeTransaction($data)
    {
        // Store transaction in database
        // You can use a Transaction model here
        // Transaction::create($data);
        
        // For now, store in session or cache
        session(['transaction_' . $data['tx_ref'] => $data]);
    }

    private function updateTransactionStatus($txRef, $status, $chapaData = null)
    {
        // Update transaction status in database
        // Transaction::where('tx_ref', $txRef)->update(['status' => $status, 'chapa_data' => $chapaData]);
        
        // For now, update in session
        $transaction = session('transaction_' . $txRef);
        if ($transaction) {
            $transaction['status'] = $status;
            $transaction['chapa_data'] = $chapaData;
            session(['transaction_' . $txRef => $transaction]);
        }
    }

    private function getTransaction($txRef)
    {
        // Get transaction from database
        // return Transaction::where('tx_ref', $txRef)->first();
        
        // For now, get from session
        return session('transaction_' . $txRef);
    }

    private function getOrderItems($orderId)
    {
        // Get order items from database
        // return OrderItem::where('order_id', $orderId)->get();
        
        // For now, return empty array
        return [];
    }
}
