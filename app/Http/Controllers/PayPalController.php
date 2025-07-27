<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PayPalController extends Controller
{
    public function index()
    {
        return Inertia::render('PayPal', [
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
            ]);

            $amount = $request->input('amount', '100.00');

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            
            $paypalToken = $provider->getAccessToken();
            
            if (!$paypalToken) {
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
                    "return_url" => route('paypal.payment.success'),
                    "cancel_url" => route('paypal.payment.cancel'),
                    "brand_name" => config('app.name'),
                    "user_action" => "PAY_NOW"
                ],
                "purchase_units" => [
                    0 => [
                        "amount" => [
                            "currency_code" => "USD",
                            "value" => number_format((float)$amount, 2, '.', '')
                        ],
                        "description" => "Payment for services"
                    ]
                ]
            ]);

            if (isset($response['id']) && $response['id'] != null) {
                // Find the approval URL
                foreach ($response['links'] as $links) {
                    if ($links['rel'] == 'approve') {
                        // For AJAX requests, return JSON with redirect URL
                        if ($request->expectsJson()) {
                            return response()->json([
                                'success' => true,
                                'redirect_url' => $links['href'],
                                'order_id' => $response['id']
                            ]);
                        }
                        
                        // For regular requests, redirect
                        return redirect()->away($links['href']);
                    }
                }

                // No approval link found
                $errorMessage = 'PayPal approval link not found. Please try again.';
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'paypal' => $errorMessage
                        ]
                    ], 422);
                }

                return back()->with('errors', ['paypal' => $errorMessage]);

            } else {
                // PayPal API error
                $errorMessage = $response['message'] ?? 'PayPal payment initialization failed.';
                
                // Log the full response for debugging
                Log::error('PayPal createOrder failed', [
                    'response' => $response,
                    'amount' => $amount
                ]);

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'paypal' => $errorMessage
                        ]
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
                    'errors' => [
                        'system' => $errorMessage
                    ]
                ], 500);
            }

            return back()->with('errors', ['system' => $errorMessage]);
        }
    }

    public function paymentCancel(Request $request)
    {
        $errorMessage = 'You have canceled the transaction.';

        return redirect()
            ->route('paypal')
            ->with('errors', ['payment' => $errorMessage]);
    }

    public function paymentSuccess(Request $request)
    {
        try {
            $token = $request->input('token');
            
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
                    'status' => $response['status']
                ];

                // Log successful payment
                Log::info('PayPal payment completed', $paymentDetails);

                // Here you can save the payment details to your database
                // $this->savePaymentRecord($paymentDetails);

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
                
                Log::warning('PayPal payment not completed', [
                    'token' => $token,
                    'response' => $response
                ]);

                return redirect()
                    ->route('paypal')
                    ->with('errors', ['payment' => $errorMessage]);
            }

        } catch (\Exception $e) {
            Log::error('PayPal payment success handler error', [
                'message' => $e->getMessage(),
                'token' => $request->input('token'),
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
            $orderId = $request->input('order_id');
            
            if (!$orderId) {
                return response()->json([
                    'success' => false,
                    'errors' => ['order_id' => 'Order ID is required']
                ], 422);
            }

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            $provider->getAccessToken();
            
            $response = $provider->showOrderDetails($orderId);

            return response()->json([
                'success' => true,
                'status' => $response['status'] ?? 'UNKNOWN',
                'order_details' => $response
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal get payment status error', [
                'message' => $e->getMessage(),
                'order_id' => $request->input('order_id')
            ]);

            return response()->json([
                'success' => false,
                'errors' => ['system' => 'Unable to fetch payment status']
            ], 500);
        }
    }

    /**
     * Save payment record to database (implement as needed)
     */
    private function savePaymentRecord(array $paymentDetails)
    {
        // Implement your payment record saving logic here
        // Example:
        // Payment::create([
        //     'transaction_id' => $paymentDetails['transaction_id'],
        //     'amount' => $paymentDetails['amount'],
        //     'currency' => $paymentDetails['currency'],
        //     'payer_email' => $paymentDetails['payer_email'],
        //     'payer_name' => $paymentDetails['payer_name'],
        //     'status' => $paymentDetails['status'],
        //     'user_id' => auth()->id(),
        // ]);
    }
}