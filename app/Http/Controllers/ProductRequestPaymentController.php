<?php

namespace App\Http\Controllers;

use App\Models\ProductRequest;
use App\Services\ChapaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductRequestPaymentController extends Controller
{
    protected $chapaService;

    public function __construct(ChapaService $chapaService)
    {
        $this->chapaService = $chapaService;
    }

    /**
     * Show the payment form for a product request
     */
    public function show(ProductRequest $productRequest)
    {
        // Verify the request belongs to the authenticated user and requires payment
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$productRequest->requiresPayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'This request does not require payment or has already been paid.');
        }

        return Inertia::render('payment/ProductRequestPayment', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->title,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
                'description' => $productRequest->description,
            ],
            'paymentMethods' => [
                'chapa' => [
                    'name' => 'Chapa',
                    'description' => 'Pay securely using Chapa',
                    'fee' => 0, // Add any processing fee if applicable
                ],
                // Add other payment methods as needed
            ]
        ]);
    }

    /**
     * Process the payment for a product request
     */
    public function process(Request $request, ProductRequest $productRequest)
    {
        // Verify the request belongs to the authenticated user and requires payment
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$productRequest->requiresPayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'This request does not require payment or has already been paid.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:chapa', // Add other payment methods as needed
            'phone_number' => 'required|string|max:20',
        ]);

        try {
            // Generate a unique reference for the payment
            $txRef = 'PR-' . $productRequest->id . '-' . now()->timestamp;
            
            // Prepare payment data
            $paymentData = [
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
                'email' => Auth::user()->email,
                'first_name' => Auth::user()->first_name,
                'last_name' => Auth::user()->last_name,
                'phone_number' => $validated['phone_number'],
                'tx_ref' => $txRef,
                'callback_url' => route('product-requests.payment.callback', $productRequest->id),
                'return_url' => route('product-requests.payment.success', $productRequest->id),
                'customization' => [
                    'title' => 'Payment for Product Request #' . $productRequest->id,
                    'description' => $productRequest->title,
                ],
                'meta' => [
                    'product_request_id' => $productRequest->id,
                    'user_id' => Auth::id(),
                ],
            ];

            // Initialize payment with Chapa
            $paymentUrl = $this->chapaService->initializePayment($paymentData);

            // Update the product request with payment reference
            $productRequest->update([
                'payment_reference' => $txRef,
                'payment_status' => 'processing',
            ]);

            // Redirect to payment gateway
            return response()->json([
                'success' => true,
                'redirect_url' => $paymentUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle payment callback from Chapa
     */
    public function handleCallback(Request $request, ProductRequest $productRequest)
    {
        // Verify the callback is from Chapa
        if (!$this->chapaService->verifyWebhookSignature($request)) {
            Log::error('Invalid webhook signature', ['request' => $request->all()]);
            abort(400, 'Invalid signature');
        }

        $paymentData = $request->all();
        
        // Verify the payment
        $verification = $this->chapaService->verifyPayment($paymentData['tx_ref']);
        
        if ($verification['status'] === 'success') {
            // Update the product request as paid
            $productRequest->markAsPaid(
                'chapa',
                $paymentData['tx_ref'],
                $paymentData
            );

            // Send payment confirmation email
            $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                $productRequest,
                'Your payment for product request #' . $productRequest->id . ' has been received successfully.',
                'Payment Received',
                route('user.product-requests.show', $productRequest->id)
            ));

            return response()->json(['status' => 'success']);
        }

        // Log failed payment
        Log::error('Payment verification failed', [
            'product_request_id' => $productRequest->id,
            'payment_data' => $paymentData,
            'verification' => $verification,
        ]);

        return response()->json(['status' => 'failed'], 400);
    }

    /**
     * Show payment success page
     */
    public function success(ProductRequest $productRequest)
    {
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment/PaymentSuccess', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->title,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
                'payment_reference' => $productRequest->payment_reference,
            ],
            'message' => 'Your payment was successful!',
        ]);
    }

    /**
     * Show payment failure page
     */
    public function failure(ProductRequest $productRequest)
    {
        if ($productRequest->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment/PaymentFailure', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->title,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
            ],
            'message' => 'Your payment could not be processed. Please try again.',
            'retryUrl' => route('product-requests.payment.show', $productRequest->id),
        ]);
    }
}
