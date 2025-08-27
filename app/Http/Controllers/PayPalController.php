<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use App\Services\PaymentFinalizer;
use App\Models\PaymentTransaction;
use Illuminate\Support\Str;

class PayPalController extends Controller
{
    public function __construct(
        private PaymentFinalizer $paymentFinalizer
    ) {}

    public function index()
    {
        return Inertia::render('paypal/payment', [
            'errors' => session('errors') ? session('errors')->toArray() : null,
            'success' => session('success'),
        ]);
    }

    public function payment(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'amount' => 'sometimes|numeric|min:1|max:10000',
                'order_id' => 'sometimes|string',
                'customer_email' => 'sometimes|email',
                'customer_name' => 'sometimes|string',
            ]);

            $amount = $request->input('amount', '100.00');
            $orderId = $request->input('order_id');
            $customerEmail = $request->input('customer_email', auth()->user()?->email);
            $customerName = $request->input('customer_name', auth()->user()?->name);

            // Create payment transaction record first
            $txRef = 'paypal_' . Str::random(16) . '_' . time();
            
            $payment = PaymentTransaction::create([
                'tx_ref' => $txRef,
                'order_id' => $orderId,
                'amount' => $amount,
                'currency' => 'USD', // PayPal typically uses USD
                'customer_email' => $customerEmail,
                'customer_name' => $customerName,
                'payment_method' => 'paypal',
                'gateway_status' => 'pending',
                'admin_status' => 'unseen',
            ]);

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            
            $paypalToken = $provider->getAccessToken();
            
            if (!$paypalToken) {
                // Update payment as failed
                $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', [
                    'error' => 'Unable to connect to PayPal'
                ]);

                return response()->json([
                    'success' => false,
                    'errors' => [
                        'paypal' => 'Unable to connect to PayPal. Please try again later.'
                    ]
                ], 422);
            }

            $response = $provider->createOrder([
                "intent" => "CAPTURE",
                "application_context" => [
                    "return_url" => route('paypal.payment.success', ['tx_ref' => $txRef]),
                    "cancel_url" => route('paypal.payment.cancel', ['tx_ref' => $txRef]),
                    "brand_name" => config('app.name'),
                    "user_action" => "PAY_NOW"
                ],
                "purchase_units" => [
                    0 => [
                        "amount" => [
                            "currency_code" => "USD",
                            "value" => number_format((float)$amount, 2, '.', '')
                        ],
                        "description" => "Payment for services - Order #" . $orderId,
                        "custom_id" => $txRef, // Include our transaction reference
                    ]
                ]
            ]);

            if (isset($response['id']) && $response['id'] != null) {
                // Update payment record with PayPal order ID
                $payment->update([
                    'gateway_payload' => $response,
                    'checkout_url' => null, // Will be set from approval link
                ]);

                // Find the approval URL
                foreach ($response['links'] as $links) {
                    if ($links['rel'] == 'approve') {
                        // Update checkout URL
                        $payment->update(['checkout_url' => $links['href']]);

                        // For AJAX requests, return JSON with redirect URL
                        if ($request->expectsJson()) {
                            return response()->json([
                                'success' => true,
                                'redirect_url' => $links['href'],
                                'order_id' => $response['id'],
                                'tx_ref' => $txRef
                            ]);
                        }
                        
                        // For regular requests, redirect
                        return redirect()->away($links['href']);
                    }
                }

                // No approval link found - mark as failed
                $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', [
                    'error' => 'PayPal approval link not found',
                    'response' => $response
                ]);

                $errorMessage = 'PayPal approval link not found. Please try again.';
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['paypal' => $errorMessage]
                    ], 422);
                }

                return back()->with('errors', ['paypal' => $errorMessage]);

            } else {
                // PayPal API error - update payment as failed
                $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', $response);

                $errorMessage = $response['message'] ?? 'PayPal payment initialization failed.';
                
                Log::error('PayPal createOrder failed', [
                    'response' => $response,
                    'amount' => $amount,
                    'tx_ref' => $txRef
                ]);

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['paypal' => $errorMessage]
                    ], 422);
                }

                return back()->with('errors', ['paypal' => $errorMessage]);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            // Log the exception
            Log::error('PayPal payment error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = 'An unexpected error occurred. Please try again.';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => ['system' => $errorMessage]
                ], 500);
            }

            return back()->with('errors', ['system' => $errorMessage]);
        }
    }

    public function paymentCancel(Request $request)
    {
        $txRef = $request->get('tx_ref');
        
        if ($txRef) {
            // Mark payment as failed due to cancellation
            $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', [
                'cancelled_by' => 'user',
                'cancelled_at' => now()->toISOString()
            ]);
        }

        $errorMessage = 'You have canceled the transaction.';

        return redirect()
            ->route('paypal')
            ->with('errors', ['payment' => $errorMessage]);
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $token = $request->input('token');
            $txRef = $request->get('tx_ref');
            
            if (!$token) {
                return redirect()
                    ->route('paypal')
                    ->with('errors', ['payment' => 'Invalid payment token.']);
            }

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            $provider->getAccessToken();
            
            $response = $provider->capturePaymentOrder($token);

            if (isset($response['status']) && $response['status'] == 'COMPLETED') {
                // Extract payment details
                $paymentDetails = [
                    'transaction_id' => $response['id'] ?? null,
                    'amount' => $response['purchase_units'][0]['payments']['captures'][0]['amount']['value'] ?? null,
                    'currency' => $response['purchase_units'][0]['payments']['captures'][0]['amount']['currency_code'] ?? 'USD',
                    'payer_email' => $response['payer']['email_address'] ?? null,
                    'payer_name' => ($response['payer']['name']['given_name'] ?? '') . ' ' . ($response['payer']['name']['surname'] ?? ''),
                    'status' => $response['status'],
                    'paypal_response' => $response
                ];

                // Update gateway status to paid
                if ($txRef) {
                    $payment = $this->paymentFinalizer->updateGatewayStatus($txRef, 'paid', $paymentDetails);
                    
                    if ($payment) {
                        Log::info('PayPal payment completed', [
                            'payment_id' => $payment->id,
                            'tx_ref' => $txRef,
                            'details' => $paymentDetails
                        ]);

                        $successMessage = sprintf(
                            'Payment completed successfully! Transaction: %s, Amount: $%s %s. Awaiting admin approval.',
                            $payment->tx_ref,
                            $paymentDetails['amount'],
                            $paymentDetails['currency']
                        );

                        return redirect()
                            ->route('paypal')
                            ->with('success', $successMessage);
                    }
                }

                // Fallback if no tx_ref found
                Log::info('PayPal payment completed (no tx_ref)', $paymentDetails);

                $successMessage = sprintf(
                    'Transaction completed successfully! Payment ID: %s, Amount: $%s %s',
                    $paymentDetails['transaction_id'],
                    $paymentDetails['amount'],
                    $paymentDetails['currency']
                );

                return redirect()
                    ->route('paypal')
                    ->with('success', $successMessage);

            } else {
                // Payment not completed
                $errorMessage = 'Payment was not completed. Status: ' . ($response['status'] ?? 'Unknown');
                
                if ($txRef) {
                    $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', $response);
                }
                
                Log::warning('PayPal payment not completed', [
                    'token' => $token,
                    'tx_ref' => $txRef,
                    'response' => $response
                ]);

                return redirect()
                    ->route('paypal')
                    ->with('errors', ['payment' => $errorMessage]);
            }

        } catch (\Exception $e) {
            if ($txRef) {
                $this->paymentFinalizer->updateGatewayStatus($txRef, 'failed', [
                    'error' => $e->getMessage(),
                    'token' => $request->input('token')
                ]);
            }

            Log::error('PayPal payment success handler error', [
                'message' => $e->getMessage(),
                'token' => $request->input('token'),
                'tx_ref' => $txRef,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()
                ->route('paypal')
                ->with('errors', ['system' => 'An error occurred while processing your payment. Please contact support.']);
        }
    }

    /**
     * Get payment status (for AJAX polling if needed)
     */
    public function getPaymentStatus(Request $request)
    {
        try {
            $txRef = $request->input('tx_ref');
            $orderId = $request->input('order_id');
            
            if (!$txRef && !$orderId) {
                return response()->json([
                    'success' => false,
                    'errors' => ['identifier' => 'Transaction reference or Order ID is required']
                ], 422);
            }

            // Get our payment record first
            $payment = null;
            if ($txRef) {
                $payment = PaymentTransaction::where('tx_ref', $txRef)->first();
            }

            // Also check PayPal status if order_id provided
            $paypalStatus = null;
            if ($orderId) {
                $provider = new PayPalClient;
                $provider->setApiCredentials(config('paypal'));
                $provider->getAccessToken();
                
                $paypalStatus = $provider->showOrderDetails($orderId);
            }

            return response()->json([
                'success' => true,
                'payment' => $payment ? [
                    'tx_ref' => $payment->tx_ref,
                    'gateway_status' => $payment->gateway_status,
                    'admin_status' => $payment->admin_status,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'is_fully_completed' => $payment->gateway_status === 'paid' && $payment->admin_status === 'approved'
                ] : null,
                'paypal_status' => $paypalStatus['status'] ?? null,
                'paypal_details' => $paypalStatus
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal get payment status error', [
                'message' => $e->getMessage(),
                'tx_ref' => $request->input('tx_ref'),
                'order_id' => $request->input('order_id')
            ]);

            return response()->json([
                'success' => false,
                'errors' => ['system' => 'Unable to fetch payment status']
            ], 500);
        }
    }
}