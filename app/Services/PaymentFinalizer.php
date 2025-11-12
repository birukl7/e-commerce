<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;

class PaymentFinalizer
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Check if payment is eligible for order finalization
     */
    public function canFinalizeOrder(PaymentTransaction $payment): bool
    {
        // For product request payments, only need admin approval
        // Gateway status can be 'paid', 'pending', or 'processing' for product requests
        if ($payment->product_request_id) {
            $allowedGatewayStatuses = ['paid', 'pending', 'processing', 'proof_uploaded'];
            return $payment->isAdminApproved() && in_array($payment->gateway_status, $allowedGatewayStatuses);
        }
        
        // For regular orders:
        // 1. If admin approved, we trust their judgment (especially for retried payments)
        // 2. For offline payments, gateway_status should be 'proof_uploaded'
        // 3. For Chapa payments, gateway_status should be 'paid', but if admin approves
        //    a retried payment with 'pending' status, we allow it (admin has verified payment)
        if ($payment->isAdminApproved()) {
            // Admin approval is sufficient for:
            // - Offline payments with proof uploaded
            // - Chapa payments that are paid
            // - Retried payments where admin manually verified (gateway_status may be 'pending')
            if ($payment->hasProofUploaded() || $payment->isGatewayPaid()) {
                return true;
            }
            
            // For retried payments: if admin approves a payment with 'pending' gateway_status,
            // it means admin has manually verified the payment (e.g., checked bank records, verified proof, etc.)
            // Allow finalization in this case regardless of payment method
            // This handles cases where:
            // - Chapa payment was retried and admin verified payment manually
            // - Offline payment proof was uploaded but gateway_status wasn't updated properly
            if ($payment->gateway_status === 'pending') {
                Log::info('Admin approved payment with pending gateway status - allowing finalization', [
                    'payment_id' => $payment->id,
                    'gateway_status' => $payment->gateway_status,
                    'admin_status' => $payment->admin_status,
                    'payment_method' => $payment->payment_method,
                ]);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Finalize order after both gateway and admin approval
     */
    public function finalizeOrder(PaymentTransaction $payment): bool
    {
        if (!$this->canFinalizeOrder($payment)) {
            Log::warning('Attempted to finalize order with incomplete payment approval', [
                'payment_id' => $payment->id,
                'gateway_status' => $payment->gateway_status,
                'admin_status' => $payment->admin_status,
                'order_id' => $payment->order_id,
                'gateway_payload' => $payment->gateway_payload ?? []
            ]);
            return false;
        }

        return DB::transaction(function () use ($payment) {
            try {
                // Use OrderLookupService for consistent order lookup and normalization
                $orderLookupService = app(\App\Services\OrderLookupService::class);
                $order = $orderLookupService->getOrderForPayment($payment);

                // Handle product request payments
                if ($payment->product_request_id) {
                    $productRequest = \App\Models\ProductRequest::find($payment->product_request_id);
                    
                    if (!$productRequest) {
                        Log::error('Product request not found for payment', [
                            'payment_id' => $payment->id,
                            'product_request_id' => $payment->product_request_id,
                            'gateway_payload' => $payment->gateway_payload ?? []
                        ]);
                        return false;
                    }
                    
                    // Determine payment type from gateway payload or tx_ref
                    $paymentType = $payment->gateway_payload['payment_type'] ?? null;
                    if (!$paymentType) {
                        // Try to determine from tx_ref pattern
                        if (str_starts_with($payment->tx_ref, 'ADV-')) {
                            $paymentType = 'advance';
                        } elseif (str_starts_with($payment->tx_ref, 'FINAL-')) {
                            $paymentType = 'final';
                        }
                    }
                    
                    if ($paymentType === 'advance' || $paymentType === 'product_request_advance') {
                        // Prevent finalization if request is terminated
                        if ($productRequest->isTerminated()) {
                            Log::warning('Attempted to finalize advance payment for terminated request', [
                                'product_request_id' => $productRequest->id,
                                'status' => $productRequest->status,
                                'lost_interest_at' => $productRequest->lost_interest_at,
                                'payment_id' => $payment->id,
                            ]);
                            return false;
                        }

                        // Mark advance payment as paid (returns false if already paid)
                        // Use the actual payment method from the transaction (chapa, offline, etc.)
                        $paymentMethod = $payment->payment_method ?? 'chapa';
                        $result = $productRequest->markAdvancePaid(
                            $paymentMethod,
                            $payment->tx_ref,
                            $payment->gateway_payload ?? []
                        );
                        
                        // Only send notification if payment was newly marked as paid
                        if ($result) {
                            // Send notification to user
                            $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                                $productRequest,
                                'Your advance payment has been approved. We will now start getting the product for you.',
                                'Advance Payment Approved',
                                route('user.product-requests.show', $productRequest->id)
                            ));
                            
                            Log::info('Product request advance payment finalized', [
                                'product_request_id' => $productRequest->id,
                                'payment_id' => $payment->id
                            ]);
                        } else {
                            Log::info('Product request advance payment already marked as paid', [
                                'product_request_id' => $productRequest->id,
                                'payment_id' => $payment->id
                            ]);
                        }
                        
                        return true;
                        
                    } elseif ($paymentType === 'final' || $paymentType === 'product_request_final') {
                        // Prevent finalization if request is terminated
                        if ($productRequest->isTerminated()) {
                            Log::warning('Attempted to finalize final payment for terminated request', [
                                'product_request_id' => $productRequest->id,
                                'status' => $productRequest->status,
                                'lost_interest_at' => $productRequest->lost_interest_at,
                                'payment_id' => $payment->id,
                            ]);
                            return false;
                        }

                        try {
                            // Mark final payment as paid (returns false if already paid, throws if advance not paid)
                            // Use the actual payment method from the transaction (chapa, offline, etc.)
                            $paymentMethod = $payment->payment_method ?? 'chapa';
                            $result = $productRequest->markFinalPaid(
                                $paymentMethod,
                                $payment->tx_ref,
                                $payment->gateway_payload ?? []
                            );
                            
                            // Create order if it doesn't exist and payment was newly marked
                            if ($result && !$productRequest->order_id) {
                                $order = $productRequest->createOrder(markPaid: true);
                                
                                // Update payment transaction with order_id
                                $payment->update(['order_id' => $order->id]);
                            } else {
                                $productRequest->refresh();
                                $order = $productRequest->order;
                                if ($order) {
                                    $order->update([
                                        'payment_status' => 'paid',
                                        'status' => 'processing',
                                    ]);
                                }
                            }
                            
                            // Only send notification if payment was newly marked as paid
                            if ($result) {
                                // Send notification to user
                                $productRequest->user->notify(new \App\Notifications\ProductRequestStatusUpdated(
                                    $productRequest,
                                    'Your final payment has been approved. Your order is now complete!',
                                    'Final Payment Approved',
                                    $order ? route('user.orders.show', $order->id) : route('user.product-requests.show', $productRequest->id)
                                ));
                                
                                Log::info('Product request final payment finalized', [
                                    'product_request_id' => $productRequest->id,
                                    'order_id' => $order->id ?? null,
                                    'payment_id' => $payment->id
                                ]);
                            } else {
                                Log::info('Product request final payment already marked as paid', [
                                    'product_request_id' => $productRequest->id,
                                    'payment_id' => $payment->id
                                ]);
                            }
                            
                            return true;
                        } catch (\Exception $e) {
                            Log::error('Failed to process final payment', [
                                'product_request_id' => $productRequest->id,
                                'payment_id' => $payment->id,
                                'error' => $e->getMessage()
                            ]);
                            return false;
                        }
                    }
                    
                    Log::warning('Unknown product request payment type', [
                        'payment_id' => $payment->id,
                        'product_request_id' => $productRequest->id,
                        'payment_type' => $paymentType
                    ]);
                    return false;
                }

                if (!$order) {
                    // For regular payments (not product requests), orders should exist
                    // If order not found, it might be because order_id wasn't set properly
                    // OrderLookupService should have found it by amount/time, but if it didn't,
                    // we can't proceed without an order
                    Log::error('Order not found for payment', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'gateway_payload' => $payment->gateway_payload ?? [],
                        'payment_method' => $payment->payment_method,
                        'product_request_id' => $payment->product_request_id,
                        'created_at' => $payment->created_at,
                        'updated_at' => $payment->updated_at
                    ]);
                    
                    // For regular payments, we need an order - can't finalize without it
                    // For product request payments, order will be created above
                    if (!$payment->product_request_id) {
                        Log::error('Cannot finalize regular payment without order', [
                            'payment_id' => $payment->id,
                            'customer_email' => $payment->customer_email,
                            'amount' => $payment->amount,
                        ]);
                        return false;
                    }
                    
                    // If we get here, it's a product request payment that should have created an order
                    // but didn't - this is an error state
                    return false;
                }

                // Update order status to processing/confirmed
                $order->update([
                    'status' => 'processing',
                    'payment_status' => 'paid',
                ]);

                // Update inventory
                $this->processInventoryChanges($order);
                
                // Send payment confirmation and order confirmation emails
                $this->notificationService->sendPaymentConfirmation($order, $payment);
                $this->notificationService->sendOrderConfirmation($order);
                
                // Notify user of status change
                $this->notificationService->sendOrderStatusUpdate(
                    $order, 
                    'processing', 
                    'Your payment has been confirmed and your order is being processed.'
                );

                Log::info('Order finalized successfully', [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id
                ]);

                return true;
            } catch (\Exception $e) {
                Log::error('Error finalizing order', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
                return false;
            }
        });
    }

    /**
     * Update gateway status from webhook/API response
     */
    public function updateGatewayStatus(
        string $txRef, 
        string $gatewayStatus, 
        ?array $gatewayPayload = null
    ): ?PaymentTransaction {
        $payment = PaymentTransaction::where('tx_ref', $txRef)->first();
        
        if (!$payment) {
            Log::warning('Payment not found for tx_ref', ['tx_ref' => $txRef]);
            return null;
        }

        // Idempotent update - only update if status actually changed
        if ($payment->gateway_status !== $gatewayStatus) {
            $payment->update([
                'gateway_status' => $gatewayStatus,
                'gateway_payload' => $gatewayPayload,
            ]);

            Log::info('Gateway status updated', [
                'payment_id' => $payment->id,
                'old_status' => $payment->getOriginal('gateway_status'),
                'new_status' => $gatewayStatus
            ]);

            // If gateway shows paid, notify admins and send payment confirmation email to user
            if ($gatewayStatus === 'paid') {
                $this->handleGatewayPaid($payment);

                try {
                    // Use OrderLookupService for consistent order lookup
                    $orderLookupService = app(\App\Services\OrderLookupService::class);
                    $order = $orderLookupService->getOrderForPayment($payment);

                    if ($order) {
                        Log::info('Sending payment confirmation email after gateway paid', [
                            'payment_id' => $payment->id,
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'payment_method' => $payment->payment_method,
                        ]);
                        $this->notificationService->sendPaymentConfirmation($order, $payment);
                    } else {
                        Log::warning('Order not resolved for payment confirmation email after gateway paid', [
                            'payment_id' => $payment->id,
                            'order_ref' => $payment->order_id,
                            'gateway_payload_keys' => array_keys($payment->gateway_payload ?? [])
                        ]);
                    }
                } catch (\Throwable $e) {
                    Log::error('Failed to send payment confirmation email after gateway paid', [
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return $payment;
    }

    /**
     * Handle proof upload for offline payments
     */
    public function handleProofUpload(PaymentTransaction $payment): void
    {
        $payment->update([
            'gateway_status' => 'proof_uploaded'
        ]);

        Log::info('Payment proof uploaded', ['payment_id' => $payment->id]);
        
        // Notify admins of pending review
        $this->notifyAdminsOfPendingReview($payment);
    }

    /**
     * Handle admin approval
     */
    public function handleAdminApproval(
        PaymentTransaction $payment, 
        User $admin, 
        ?string $notes = null
    ): bool {
        if (!$payment->canBeApproved()) {
            Log::warning('Payment cannot be approved', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'admin_status' => $payment->admin_status
            ]);
            return false;
        }

        // Start transaction to ensure data consistency
        return DB::transaction(function () use ($payment, $admin, $notes) {
            try {
                // Approve the payment
                $payment->approve($admin, $notes);

                Log::info('Payment approved by admin', [
                    'payment_id' => $payment->id,
                    'admin_id' => $admin->id,
                    'order_id' => $payment->order_id
                ]);

                // Finalize the order first to ensure status is updated
                $orderFinalized = $this->finalizeOrder($payment);
                
                if (!$orderFinalized) {
                    Log::error('Failed to finalize order after payment approval', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id
                    ]);
                    return false;
                }

                // Reload the order to get the latest status using OrderLookupService
                $order = $orderLookupService->getOrderForPayment($payment);
                
                if ($order) {
                    // Emails are already sent inside finalizeOrder(). Avoid duplicates here.
                    Log::info('Order finalized after admin approval; emails dispatched by finalizeOrder()', [
                        'order_id' => $order->id,
                        'payment_id' => $payment->id
                    ]);
                } else {
                    Log::error('Order not found after finalization', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id
                    ]);
                }

                return true;
            } catch (\Exception $e) {
                Log::error('Error in handleAdminApproval: ' . $e->getMessage(), [
                    'payment_id' => $payment->id,
                    'exception' => $e
                ]);
                return false;
            }
        });
    }

    /**
     * Handle admin rejection
     */
    public function handleAdminRejection(
        PaymentTransaction $payment, 
        User $admin, 
        ?string $notes = null,
        ?string $rejectionReasonCode = null
    ): bool {
        if (!$payment->canBeRejected()) {
            return false;
        }

        $payment->reject($admin, $notes, $rejectionReasonCode);

        // Get rejection reason text for notification
        $rejectionReasonText = 'Please contact support for more information.';
        if ($rejectionReasonCode) {
            $reason = \App\Models\PaymentRejectionReason::where('reason_code', $rejectionReasonCode)->first();
            if ($reason) {
                $rejectionReasonText = $reason->reason_text;
                if ($notes) {
                    $rejectionReasonText .= ': ' . $notes;
                }
            }
        } elseif ($notes) {
            $rejectionReasonText = $notes;
        }

        Log::info('Payment rejected by admin', [
            'payment_id' => $payment->id,
            'admin_id' => $admin->id,
            'rejection_reason_code' => $rejectionReasonCode,
            'notes' => $notes
        ]);

        // Notify user of payment rejection
        // Use OrderLookupService to get order (handles both numeric ID and order_number string)
        $orderLookupService = app(\App\Services\OrderLookupService::class);
        $order = $orderLookupService->getOrderForPayment($payment);
        
        if ($order) {
            $message = 'Your payment was rejected. Reason: ' . $rejectionReasonText . 
                      ' You can retry the payment from your order details page.';
            $this->notificationService->sendOrderStatusUpdate(
                $order, 
                'payment_failed', 
                $message
            );
        }

        // For product request payments, send notification to the user
        if ($payment->product_request_id) {
            $productRequest = $payment->productRequest;
            if ($productRequest && $productRequest->user) {
                // Determine retry URL based on payment type
                $txRef = $payment->tx_ref;
                if (str_starts_with($txRef, 'ADV-')) {
                    $actionText = 'Retry Advance Payment';
                    $actionUrl = route('product-requests.advance-payment.show', $productRequest->id);
                    $message = 'Your advance payment was rejected. Reason: ' . $rejectionReasonText . 
                              ' You can retry the payment from the product request page.';
                } elseif (str_starts_with($txRef, 'FINAL-')) {
                    $actionText = 'Retry Final Payment';
                    $actionUrl = route('product-requests.final-payment.show', $productRequest->id);
                    $message = 'Your final payment was rejected. Reason: ' . $rejectionReasonText . 
                              ' You can retry the payment from the product request page.';
                } else {
                    $actionText = 'View Product Request';
                    $actionUrl = route('user.product-requests.show', $productRequest->id);
                    $message = 'Your payment was rejected. Reason: ' . $rejectionReasonText . 
                              ' You can retry the payment from the product request page.';
                }
                
                // Send notification via the product request notification system
                $productRequest->user->notify(
                    new \App\Notifications\ProductRequestStatusUpdated(
                        $productRequest,
                        $message,
                        'Payment Rejected',
                        $actionUrl,
                        $actionText
                    )
                );
            }
        }

        // Handle order cancellation if needed
        $this->handleOrderCancellation($payment);

        return true;
    }

    /**
     * Get order status based on payment state
     */
    public function getOrderStatusForPayment(PaymentTransaction $payment): string
    {
        if ($payment->isFullyCompleted()) {
            return 'processing';
        }

        if ($payment->isAwaitingAdminApproval()) {
            return 'pending_payment_approval';
        }

        if ($payment->isAdminRejected()) {
            return 'payment_rejected';
        }

        if ($payment->isGatewayFailed()) {
            return 'payment_failed';
        }

        return 'pending_payment';
    }

    /**
     * Handle gateway paid notification
     */
    private function handleGatewayPaid(PaymentTransaction $payment): void
    {
        if ($payment->admin_status === null || $payment->admin_status === '') {
            $payment->update(['admin_status' => 'unseen']);
            
            Log::info('Payment gateway paid, awaiting admin approval', [
                'payment_id' => $payment->id,
                'tx_ref' => $payment->tx_ref
            ]);
        }
        
        $this->notifyAdminsOfPendingReview($payment);
    }

    /**
     * Process inventory changes for confirmed order
     */
    private function processInventoryChanges(Order $order): void
    {
        try {
            // Only decrease inventory when payment is paid
            if ($order->payment_status !== 'paid') {
                \Log::info('Skipping inventory decrease: payment not paid', [
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                ]);
                return;
            }

            $stockService = app(\App\Services\StockService::class);
            $stockService->decreaseStockForOrder($order);
        } catch (\Throwable $e) {
            \Log::error('Failed processing inventory changes', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send order confirmation
     * @deprecated Use NotificationService::sendOrderConfirmation() instead
     */
    protected function sendOrderConfirmation(Order $order, PaymentTransaction $payment): void
    {
        $this->notificationService->sendOrderConfirmation($order);
    }

    /**
     * Notify admins of pending payment review
     */
    protected function notifyAdminsOfPendingReview(PaymentTransaction $payment): void
    {
        $admins = User::role('admin')->where('is_active', true)->get();
        
        foreach ($admins as $admin) {
            $this->notificationService->sendAccountActivity(
                $admin,
                'payment_review_required',
                [
                    'payment_id' => $payment->id,
                    'order_id' => $payment->order_id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'review_url' => route('admin.payments.review', $payment->id)
                ]
            );
        }
    }

    /**
     * Handle order cancellation for rejected payments
     */
    protected function handleOrderCancellation(PaymentTransaction $payment): void
    {
        // Use OrderLookupService to get order (handles both numeric ID and order_number string)
        $orderLookupService = app(\App\Services\OrderLookupService::class);
        $order = $orderLookupService->getOrderForPayment($payment);
        
        if (!$order) {
            return;
        }

        $cancellationReason = 'Payment rejected: ' . ($payment->admin_notes ?? 'No reason provided');
        
        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $cancellationReason
        ]);
        
        $this->notificationService->sendOrderStatusUpdate(
            $order,
            'cancelled',
            'Your order has been cancelled. Reason: ' . $cancellationReason
        );
    }
}
