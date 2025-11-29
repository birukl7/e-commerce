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
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$productRequest->requiresPayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'This request does not require payment or has already been paid.');
        }

        // Enforce acceptance before payment
        if (empty($productRequest->price_accepted_at)) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Please accept the set price to proceed to payment.');
        }

        // Create or reuse an order, then delegate to shared PaymentController flow
        if (!$productRequest->order_id) {
            $order = $productRequest->createOrder(markPaid: false);
        } else {
            $order = \App\Models\Order::find($productRequest->order_id);
            if (!$order) {
                $order = $productRequest->createOrder(markPaid: false);
            }
        }

        // Redirect to unified payment page with required params
        return redirect()->route('payment.show', [
            'order_id' => $order->order_number,
            'amount' => $productRequest->amount,
            'currency' => $productRequest->currency,
            'payment_type' => 'product_request',
            'product_request_id' => $productRequest->id,
        ]);
    }

    /**
     * Process the payment for a product request
     */
    public function process(Request $request, ProductRequest $productRequest)
    {
        // Verify the request belongs to the authenticated user and requires payment
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
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
                    'description' => $productRequest->product_name,
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

            // Create order (processing + paid)
            $order = $productRequest->createOrder(markPaid: true);

            // Send payment confirmation email
            $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                $productRequest,
                'Your payment for product request #' . $productRequest->id . ' has been received successfully.',
                'Payment Received',
                route('user.product-requests.show', $productRequest->id)
            ));

            // Redirect user to their order page for a better UX
            return redirect()->route('user.orders.show', $order->id)
                ->with('success', 'Payment successful. Your order has been created.');
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
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment/PaymentSuccess', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->product_name,
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
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment/PaymentFailure', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->product_name,
                'amount' => $productRequest->amount,
                'currency' => $productRequest->currency,
            ],
            'message' => 'Your payment could not be processed. Please try again.',
            'retryUrl' => route('product-requests.payment.show', $productRequest->id),
        ]);
    }

    /**
     * Show advance payment method selection
     */
    public function showAdvancePaymentMethod(ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Refresh to get latest payment status before checking
        $productRequest->refresh();

        if (!$productRequest->requiresAdvancePayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Advance payment is not required for this request.');
        }

        // Calculate tax for advance payment
        $taxService = app(\App\Services\TaxService::class);
        $advanceSubtotal = (float) $productRequest->advance_amount;
        $advanceTaxCalculation = $taxService->calculateTaxes($advanceSubtotal);
        $advanceTotalWithTax = $advanceTaxCalculation['total'];

        return Inertia::render('payment/advance-payment-method', [
            'order_id' => 'ADV-' . $productRequest->id . '-' . time(),
            'amount' => $advanceTotalWithTax, // Amount including tax
            'subtotal' => $advanceSubtotal,
            'tax_amount' => $advanceTaxCalculation['total_tax_amount'],
            'tax_breakdown' => $advanceTaxCalculation['taxes'],
            'currency' => $productRequest->currency,
            'product_name' => $productRequest->product_name,
            'description' => 'Advance Payment for: ' . $productRequest->product_name,
            'product_request_id' => $productRequest->id,
        ]);
    }

    /**
     * Process advance payment
     */
    public function processAdvancePayment(Request $request, ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Refresh to get latest payment status before checking
        $productRequest->refresh();

        if (!$productRequest->requiresAdvancePayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Advance payment is not required for this request.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:chapa',
            'phone_number' => 'required|string|max:20',
        ]);

        try {
            // Calculate tax for advance payment
            $taxService = app(\App\Services\TaxService::class);
            $advanceSubtotal = (float) $productRequest->advance_amount;
            $advanceTaxCalculation = $taxService->calculateTaxes($advanceSubtotal);
            $advanceTotalWithTax = $advanceTaxCalculation['total'];

            // Generate a unique reference for the advance payment
            $txRef = 'ADV-' . $productRequest->id . '-' . now()->timestamp;
            
            // Prepare payment data - use total amount including tax
            $paymentData = [
                'amount' => $advanceTotalWithTax,
                'currency' => $productRequest->currency,
                'email' => Auth::user()->email,
                'first_name' => Auth::user()->first_name,
                'last_name' => Auth::user()->last_name,
                'phone_number' => $validated['phone_number'],
                'tx_ref' => $txRef,
                'callback_url' => route('product-requests.advance-payment.callback', $productRequest->id),
                'return_url' => route('product-requests.advance-payment.success', $productRequest->id),
                'customization' => [
                    'title' => 'Advance Payment for Product Request #' . $productRequest->id,
                    'description' => $productRequest->product_name,
                ],
                'meta' => [
                    'product_request_id' => $productRequest->id,
                    'user_id' => Auth::id(),
                    'payment_type' => 'advance'
                ],
            ];

            // Initialize payment with Chapa
            $paymentUrl = $this->chapaService->initializePayment($paymentData);

            // Create PaymentTransaction record for tracking
            \App\Models\PaymentTransaction::create([
                'tx_ref' => $txRef,
                'order_id' => null, // No order yet for advance payment
                'product_request_id' => $productRequest->id,
                'amount' => $advanceTotalWithTax,
                'currency' => $productRequest->currency,
                'customer_email' => Auth::user()->email,
                'customer_name' => Auth::user()->name,
                'customer_phone' => Auth::user()->phone,
                'payment_method' => 'chapa',
                'gateway_status' => 'pending',
                'admin_status' => 'unseen',
                'gateway_payload' => [
                    'payment_type' => 'advance',
                    'subtotal' => $advanceSubtotal,
                    'tax_amount' => $advanceTaxCalculation['total_tax_amount'],
                    'taxes' => $advanceTaxCalculation['taxes'],
                ],
            ]);

            // Update the product request with payment reference
            $productRequest->update([
                'payment_reference' => $txRef,
                'advance_payment_status' => 'processing',
            ]);

            // Redirect to payment gateway
            return response()->json([
                'success' => true,
                'redirect_url' => $paymentUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process advance payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show final payment method selection page
     */
    public function showFinalPayment(ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        if (!$productRequest->requiresFinalPayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Final payment is not required for this request.');
        }

        // Calculate tax for final payment
        $taxService = app(\App\Services\TaxService::class);
        $finalSubtotal = (float) $productRequest->final_amount;
        $finalTaxCalculation = $taxService->calculateTaxes($finalSubtotal);
        $finalTotalWithTax = $finalTaxCalculation['total'];

        return Inertia::render('payment/final-payment-method', [
            'order_id' => 'FINAL-' . $productRequest->id . '-' . time(),
            'amount' => $finalTotalWithTax, // Amount including tax
            'subtotal' => $finalSubtotal,
            'tax_amount' => $finalTaxCalculation['total_tax_amount'],
            'tax_breakdown' => $finalTaxCalculation['taxes'],
            'currency' => $productRequest->currency,
            'product_name' => $productRequest->product_name,
            'description' => 'Final Payment for: ' . $productRequest->product_name,
            'product_request_id' => $productRequest->id,
        ]);
    }

    /**
     * Process final payment
     */
    public function processFinalPayment(Request $request, ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Refresh to ensure latest status
        $productRequest->refresh();

        // Prevent payment processing if request is terminated
        if ($productRequest->isTerminated()) {
            return redirect()->route('request.index')
                ->with('error', 'Cannot process payment: This request has been terminated.');
        }

        if (!$productRequest->requiresFinalPayment()) {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Final payment is not required for this request.');
        }

        // Validate that advance payment is paid first
        if ($productRequest->advance_payment_status !== 'paid') {
            return redirect()
                ->route('user.product-requests.show', $productRequest->id)
                ->with('error', 'Advance payment must be completed before processing final payment.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:chapa',
            'phone_number' => 'required|string|max:20',
        ]);

        try {
            // Calculate tax for final payment
            $taxService = app(\App\Services\TaxService::class);
            $finalSubtotal = (float) $productRequest->final_amount;
            $finalTaxCalculation = $taxService->calculateTaxes($finalSubtotal);
            $finalTotalWithTax = $finalTaxCalculation['total'];

            // Generate a unique reference for the final payment
            $txRef = 'FINAL-' . $productRequest->id . '-' . now()->timestamp;
            
            // Prepare payment data - use total amount including tax
            $paymentData = [
                'amount' => $finalTotalWithTax,
                'currency' => $productRequest->currency,
                'email' => Auth::user()->email,
                'first_name' => Auth::user()->first_name,
                'last_name' => Auth::user()->last_name,
                'phone_number' => $validated['phone_number'],
                'tx_ref' => $txRef,
                'callback_url' => route('product-requests.final-payment.callback', $productRequest->id),
                'return_url' => route('product-requests.final-payment.success', $productRequest->id),
                'customization' => [
                    'title' => 'Final Payment for Product Request #' . $productRequest->id,
                    'description' => $productRequest->product_name,
                ],
                'meta' => [
                    'product_request_id' => $productRequest->id,
                    'user_id' => Auth::id(),
                    'payment_type' => 'final'
                ],
            ];

            // Initialize payment with Chapa
            $paymentUrl = $this->chapaService->initializePayment($paymentData);

            // Create PaymentTransaction record for tracking
            \App\Models\PaymentTransaction::create([
                'tx_ref' => $txRef,
                'order_id' => null, // No order yet until payment is complete
                'product_request_id' => $productRequest->id,
                'amount' => $finalTotalWithTax,
                'currency' => $productRequest->currency,
                'customer_email' => Auth::user()->email,
                'customer_name' => Auth::user()->name,
                'customer_phone' => Auth::user()->phone,
                'payment_method' => 'chapa',
                'gateway_status' => 'pending',
                'admin_status' => 'unseen',
                'gateway_payload' => [
                    'payment_type' => 'final',
                    'subtotal' => $finalSubtotal,
                    'tax_amount' => $finalTaxCalculation['total_tax_amount'],
                    'taxes' => $finalTaxCalculation['taxes'],
                ],
            ]);

            // Update the product request with payment reference
            $productRequest->update([
                'payment_reference' => $txRef,
                'final_payment_status' => 'processing',
            ]);

            // Redirect to payment gateway
            return response()->json([
                'success' => true,
                'redirect_url' => $paymentUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process final payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle advance payment callback from Chapa
     */
    public function handleAdvancePaymentCallback(Request $request, ProductRequest $productRequest)
    {
        // Verify the callback is from Chapa
        if (!$this->chapaService->verifyWebhookSignature($request)) {
            Log::error('Invalid advance payment webhook signature', ['request' => $request->all()]);
            abort(400, 'Invalid signature');
        }

        $paymentData = $request->all();
        
        // Verify the payment - but webhook should have already handled this
        // This callback is mainly for confirming the return URL
        $verification = $this->chapaService->verifyPayment($paymentData['tx_ref']);
        
        // Reload product request to get latest status (webhook may have already updated it)
        $productRequest->refresh();
        
        if ($verification['status'] === 'success' || $productRequest->advance_payment_status === 'paid') {
            // Double-check payment is marked as paid (in case webhook hasn't processed yet)
            if ($productRequest->advance_payment_status !== 'paid') {
                $result = $productRequest->markAdvancePaid(
                    'chapa',
                    $paymentData['tx_ref'],
                    $paymentData
                );
                // Result may be false if already paid (race condition), which is fine
                $productRequest->refresh();
            }

            return response()->json(['status' => 'success'], 200);
        }

        // Log failed payment
        Log::error('Advance payment verification failed', [
            'product_request_id' => $productRequest->id,
            'payment_data' => $paymentData,
            'verification' => $verification,
        ]);

        return response()->json(['status' => 'failed'], 400);
    }

    /**
     * Show advance payment success page
     */
    public function advancePaymentSuccess(ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Refresh the product request to get latest payment status
        $productRequest->refresh();

        // Get the payment transaction to get transaction ID and amount
        $transaction = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->where('tx_ref', 'like', 'ADV-%')
            ->latest()
            ->first();

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
            'transaction_id' => $transaction?->tx_ref,
            'amount' => $transaction?->amount ?? $productRequest->advance_amount,
            'message' => $productRequest->advance_payment_status === 'processing' 
                ? 'Your advance payment was successful! The payment is now pending admin approval.'
                : 'Your advance payment was successful! We will now start procuring your product.',
        ]);
    }

    /**
     * Handle final payment callback from Chapa
     */
    public function handleFinalPaymentCallback(Request $request, ProductRequest $productRequest)
    {
        // Verify the callback is from Chapa
        if (!$this->chapaService->verifyWebhookSignature($request)) {
            Log::error('Invalid final payment webhook signature', ['request' => $request->all()]);
            abort(400, 'Invalid signature');
        }

        $paymentData = $request->all();
        
        // Verify the payment - but webhook should have already handled this
        // This callback is mainly for confirming the return URL
        $verification = $this->chapaService->verifyPayment($paymentData['tx_ref']);
        
        // Reload product request to get latest status (webhook may have already updated it)
        $productRequest->refresh();
        
        if ($verification['status'] === 'success' || $productRequest->final_payment_status === 'paid') {
            // Double-check payment is marked as paid (in case webhook hasn't processed yet)
            if ($productRequest->final_payment_status !== 'paid') {
                try {
                    $result = $productRequest->markFinalPaid(
                        'chapa',
                        $paymentData['tx_ref'],
                        $paymentData
                    );
                    
                    // Order should already exist from advance payment
                    // Only create if it doesn't exist (edge case - should not happen in normal flow)
                    if ($result && !$productRequest->order_id) {
                        \Log::warning('Order not found for final payment callback, creating new order', [
                            'product_request_id' => $productRequest->id,
                            'tx_ref' => $paymentData['tx_ref'] ?? null,
                        ]);
                        $productRequest->createOrder(markPaid: true);
                    }
                    $productRequest->refresh();
                } catch (\Exception $e) {
                    \Log::error('Failed to mark final payment as paid in callback', [
                        'product_request_id' => $productRequest->id,
                        'error' => $e->getMessage(),
                        'tx_ref' => $paymentData['tx_ref'] ?? null,
                    ]);
                }
            }

            return response()->json(['status' => 'success'], 200);
        }

        // Log failed payment
        Log::error('Final payment verification failed', [
            'product_request_id' => $productRequest->id,
            'payment_data' => $paymentData,
            'verification' => $verification,
        ]);

        return response()->json(['status' => 'failed'], 400);
    }

    /**
     * Show final payment success page
     */
    public function finalPaymentSuccess(ProductRequest $productRequest)
    {
        // Cast to int to handle potential type mismatch (string vs int)
        if ((int)$productRequest->user_id !== (int)Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Refresh the product request to get latest payment status
        $productRequest->refresh();

        // Get the payment transaction to get transaction ID and amount
        $transaction = \App\Models\PaymentTransaction::where('product_request_id', $productRequest->id)
            ->where('tx_ref', 'like', 'FINAL-%')
            ->latest()
            ->first();

        return Inertia::render('product-requests/final-payment-success-chapa', [
            'productRequest' => [
                'id' => $productRequest->id,
                'product_name' => $productRequest->product_name,
                'final_amount' => $productRequest->final_amount,
                'currency' => $productRequest->currency,
                'payment_reference' => $productRequest->payment_reference,
                'final_payment_status' => $productRequest->final_payment_status,
                'order_id' => $productRequest->order_id,
            ],
            'transaction_id' => $transaction?->tx_ref,
            'amount' => $transaction?->amount ?? $productRequest->final_amount,
            'message' => $productRequest->final_payment_status === 'processing'
                ? 'Your final payment was successful! The payment is now pending admin approval.'
                : 'Your final payment was successful! Your order is now complete.',
        ]);
    }
}
