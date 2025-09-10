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
        return $payment->isAdminApproved() && ($payment->isGatewayPaid() || $payment->hasProofUploaded());
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
                // First try to get order via relationship
                $order = $payment->order;
                
                // If not found, try to find by order ID directly (numeric id)
                if (!$order && $payment->order_id) {
                    $order = Order::find($payment->order_id);
                    Log::info('Looked up order by ID', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'found' => $order ? 'yes' : 'no'
                    ]);
                }

                // If still not found and order_id looks like an order number string, try by order_number
                if (!$order && is_string($payment->order_id)) {
                    $order = Order::where('order_number', $payment->order_id)->first();
                    Log::info('Looked up order by order_number', [
                        'payment_id' => $payment->id,
                        'order_number' => $payment->order_id,
                        'found' => $order ? 'yes' : 'no'
                    ]);
                    // If found, normalize payment to store numeric order_id for future lookups
                    if ($order && $payment->order_id !== $order->id) {
                        $payment->order_id = $order->id;
                        $payment->save();
                        Log::info('Normalized payment.order_id to numeric ID', [
                            'payment_id' => $payment->id,
                            'normalized_order_id' => $payment->order_id
                        ]);
                    }
                }

                // If still not found, try to find by order_number in gateway_payload
                if (!$order && !empty($payment->gateway_payload['order_number'])) {
                    $order = Order::where('order_number', $payment->gateway_payload['order_number'])->first();
                    
                    if ($order) {
                        // Update the payment with the correct order_id
                        $payment->order_id = $order->id;
                        $payment->save();
                        Log::info('Updated payment with correct order_id from gateway payload', [
                            'payment_id' => $payment->id,
                            'order_id' => $order->id,
                            'order_number' => $order->order_number
                        ]);
                    }
                }

                if (!$order) {
                    Log::error('Order not found for payment', [
                        'payment_id' => $payment->id,
                        'order_id' => $payment->order_id,
                        'gateway_payload' => $payment->gateway_payload ?? [],
                        'payment_method' => $payment->payment_method,
                        'created_at' => $payment->created_at,
                        'updated_at' => $payment->updated_at
                    ]);
                    
                    // Dump the payment model to see all its attributes
                    Log::error('Payment model dump', [
                        'payment_attributes' => $payment->getAttributes(),
                        'relations' => $payment->getRelations()
                    ]);
                    
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

            // If gateway shows paid, check if we can finalize
            if ($gatewayStatus === 'paid') {
                $this->handleGatewayPaid($payment);
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

                // Reload the order to get the latest status
                $order = $payment->order;
                
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
        ?string $notes = null
    ): bool {
        if (!$payment->canBeRejected()) {
            return false;
        }

        $payment->reject($admin, $notes);

        Log::info('Payment rejected by admin', [
            'payment_id' => $payment->id,
            'admin_id' => $admin->id
        ]);

        // Notify user of payment rejection
        if ($payment->order) {
            $this->notificationService->sendOrderStatusUpdate(
                $payment->order, 
                'payment_failed', 
                'Your payment was rejected. Reason: ' . ($notes ?? 'Please contact support for more information.')
            );
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
            return 'awaiting_admin_approval';
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
        // Implement inventory reduction logic
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
        if (!$payment->order) {
            return;
        }

        $cancellationReason = 'Payment rejected: ' . ($payment->admin_notes ?? 'No reason provided');
        
        $payment->order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $cancellationReason
        ]);
        
        $this->notificationService->sendOrderStatusUpdate(
            $payment->order,
            'cancelled',
            'Your order has been cancelled. Reason: ' . $cancellationReason
        );
    }
}
