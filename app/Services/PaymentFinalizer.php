<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentFinalizer
{
    /**
     * Check if payment is eligible for order finalization
     */
    public function canFinalizeOrder(PaymentTransaction $payment): bool
    {
        return $payment->isGatewayPaid() && $payment->isAdminApproved();
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
                'admin_status' => $payment->admin_status
            ]);
            return false;
        }

        return DB::transaction(function () use ($payment) {
            try {
                $order = $payment->order;
                if (!$order) {
                    Log::error('Order not found for payment', ['payment_id' => $payment->id]);
                    return false;
                }

                // Update order status to processing/confirmed
                $order->update([
                    'status' => 'processing', // or 'confirmed' depending on your order flow
                    'payment_status' => 'completed',
                ]);

                // Update inventory, send confirmation emails, etc.
                $this->processInventoryChanges($order);
                $this->sendOrderConfirmation($order, $payment);

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
            return false;
        }

        $payment->approve($admin, $notes);

        Log::info('Payment approved by admin', [
            'payment_id' => $payment->id,
            'admin_id' => $admin->id
        ]);

        // Try to finalize if gateway is also ready
        if ($payment->isGatewayPaid()) {
            $this->finalizeOrder($payment);
        }

        return true;
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
            return 'processing'; // Ready for fulfillment
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
        // Send notification that payment is received but needs admin approval
        // Queue job to notify customer and admins
        
        // If auto-approval is enabled for certain payment methods, could approve automatically
        // For now, all payments require manual admin approval
    }

    /**
     * Process inventory changes for confirmed order
     */
    private function processInventoryChanges(Order $order): void
    {
        // Implement inventory reduction logic
        // This would typically involve reducing stock quantities for ordered items
    }

    /**
     * Send order confirmation
     */
    private function sendOrderConfirmation(Order $order, PaymentTransaction $payment): void
    {
        // Queue job to send confirmation email to customer
        // Could also trigger other notifications (SMS, push notifications, etc.)
    }

    /**
     * Notify admins of pending payment review
     */
    private function notifyAdminsOfPendingReview(PaymentTransaction $payment): void
    {
        // Queue job to notify admins of payment needing review
    }

    /**
     * Handle order cancellation for rejected payments
     */
    private function handleOrderCancellation(PaymentTransaction $payment): void
    {
        $order = $payment->order;
        if ($order) {
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'rejected',
            ]);
        }
    }
}