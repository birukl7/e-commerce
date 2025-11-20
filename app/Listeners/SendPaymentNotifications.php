<?php

namespace App\Listeners;

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Jobs\SendPaymentConfirmationEmail;
use App\Jobs\SendPaymentApprovedEmail;
use App\Jobs\SendAdvancePaymentConfirmationEmail;
use App\Jobs\SendAdvancePaymentApprovedEmail;
use App\Jobs\SendPaymentFailedEmail;
use App\Models\NotificationOutbox;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPaymentNotifications implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;
    
    public $queue = 'default';
    
    public function handle($event): void
    {
        try {
            $payment = $event->payment;
            $context = $event->context ?? 'checkout';

            Log::info('[SendPaymentNotifications] Listener triggered', [
                'event_type' => get_class($event),
                'payment_id' => $payment->id ?? null,
                'tx_ref' => $payment->tx_ref ?? null,
                'context' => $context,
            ]);

            $key = $this->makeKey($event);

            if (!$this->reserveOutboxKey($key, $event)) {
                Log::info('[SendPaymentNotifications] Duplicate/outbox key exists; skipping', ['key' => $key]);
                return; // Already processed
            }

            if ($event instanceof PaymentCompleted) {
                Log::info('[SendPaymentNotifications] PaymentCompleted received (no customer email sent). Awaiting admin approval.', [
                    'context' => $context,
                    'tx_ref' => $payment->tx_ref ?? null,
                ]);
                // Intentionally do not send customer emails on gateway completion.
                // Final completion and customer notification happen on admin approval.
                return;
            }

            if ($event instanceof PaymentApproved) {
                Log::info('[SendPaymentNotifications] Handling PaymentApproved', [
                    'context' => $context,
                    'tx_ref' => $payment->tx_ref ?? null,
                ]);
                $this->onPaymentApproved($payment, $context);
                return;
            }

            if ($event instanceof PaymentFailed) {
                // Check idempotency for PaymentFailed
                $failedKey = $this->makeKeyForFailed($event);
                if (!$this->reserveOutboxKey($failedKey, $event)) {
                    Log::info('[SendPaymentNotifications] Duplicate/outbox key exists for PaymentFailed; skipping', ['key' => $failedKey]);
                    return; // Already processed
                }
                
                Log::info('[SendPaymentNotifications] Handling PaymentFailed', [
                    'context' => $context,
                    'tx_ref' => $payment->tx_ref ?? null,
                ]);
                $this->onPaymentFailed($payment, $context);
                return;
            }
            
            Log::warning('[SendPaymentNotifications] Unhandled event type', [
                'event_type' => get_class($event),
            ]);
        } catch (\Throwable $e) {
            Log::error('[SendPaymentNotifications] Error processing event', [
                'event_type' => get_class($event),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw to mark job as failed
        }
    }

    private function onPaymentCompleted($payment, string $context): void
    {
        if ($context === 'checkout') {
            $order = $payment->order ?? null;
            $user = $order?->user ?? null;
            if ($order && $user) {
                Log::info('[SendPaymentNotifications] Dispatching SendPaymentConfirmationEmail', [
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'user_email' => $user->email ?? null,
                ]);
                SendPaymentConfirmationEmail::dispatch($payment, $user, $order)
                    ->onQueue('emails');
            } else {
                Log::warning('[SendPaymentNotifications] Missing order or user for PaymentCompleted', [
                    'payment_id' => $payment->id,
                    'has_order' => !is_null($order),
                    'has_user' => !is_null($user),
                ]);
            }
            return;
        }

        if ($context === 'advance') {
            $productRequest = $payment->productRequest ?? null;
            $user = $productRequest?->user ?? null;
            if ($productRequest && $user) {
                Log::info('[SendPaymentNotifications] Dispatching SendAdvancePaymentConfirmationEmail', [
                    'payment_id' => $payment->id,
                    'product_request_id' => $productRequest->id,
                    'user_email' => $user->email ?? null,
                ]);
                SendAdvancePaymentConfirmationEmail::dispatch($payment, $user, $productRequest)
                    ->onQueue('emails');
            } else {
                Log::warning('[SendPaymentNotifications] Missing productRequest or user for PaymentCompleted', [
                    'payment_id' => $payment->id,
                    'has_product_request' => !is_null($productRequest),
                    'has_user' => !is_null($user),
                ]);
            }
            return;
        }
    }

    private function onPaymentApproved($payment, string $context): void
    {
        if ($context === 'checkout') {
            $order = $payment->order ?? null;
            $user = $order?->user ?? null;
            if ($order && $user) {
                Log::info('[SendPaymentNotifications] Dispatching SendPaymentApprovedEmail', [
                    'payment_id' => $payment->id,
                    'order_id' => $order->id,
                    'user_email' => $user->email ?? null,
                ]);
                SendPaymentApprovedEmail::dispatch($payment, $user, $order)
                    ->onQueue('emails');
            } else {
                Log::warning('[SendPaymentNotifications] Missing order or user for PaymentApproved', [
                    'payment_id' => $payment->id,
                    'has_order' => !is_null($order),
                    'has_user' => !is_null($user),
                ]);
            }
            return;
        }

        if ($context === 'advance') {
            $productRequest = $payment->productRequest ?? null;
            $user = $productRequest?->user ?? null;
            if ($productRequest && $user) {
                Log::info('[SendPaymentNotifications] Dispatching SendAdvancePaymentApprovedEmail', [
                    'payment_id' => $payment->id,
                    'product_request_id' => $productRequest->id,
                    'user_email' => $user->email ?? null,
                ]);
                SendAdvancePaymentApprovedEmail::dispatch($payment, $user, $productRequest)
                    ->onQueue('emails');
            } else {
                Log::warning('[SendPaymentNotifications] Missing productRequest or user for PaymentApproved', [
                    'payment_id' => $payment->id,
                    'has_product_request' => !is_null($productRequest),
                    'has_user' => !is_null($user),
                ]);
            }
            return;
        }
    }

    private function onPaymentFailed($payment, string $context): void
    {
        $user = null;
        if ($context === 'checkout') {
            $user = $payment->order?->user ?? null;
        } elseif ($context === 'advance') {
            $user = $payment->productRequest?->user ?? null;
        }

        if ($user) {
            Log::info('[SendPaymentNotifications] Dispatching SendPaymentFailedEmail', [
                'payment_id' => $payment->id,
                'user_email' => $user->email ?? null,
                'context' => $context,
            ]);
            SendPaymentFailedEmail::dispatch($payment, $user)
                ->onQueue('emails');
        } else {
            Log::warning('[SendPaymentNotifications] Missing user for PaymentFailed', [
                'payment_id' => $payment->id,
                'context' => $context,
            ]);
        }
    }

    private function makeKey($event): string
    {
        $type = $event instanceof PaymentCompleted ? 'completed' : 'approved';
        $payment = $event->payment;
        $ctx = $event->context ?? 'checkout';
        $txRef = $payment->tx_ref ?? 'unknown';
        return "payment:{$txRef}:{$type}:{$ctx}";
    }

    private function makeKeyForFailed($event): string
    {
        $payment = $event->payment;
        $ctx = $event->context ?? 'checkout';
        $txRef = $payment->tx_ref ?? 'unknown';
        return "payment:{$txRef}:failed:{$ctx}";
    }

    private function reserveOutboxKey(string $key, $event): bool
    {
        try {
            NotificationOutbox::create([
                'key' => $key,
                'event_type' => get_class($event),
                'model_type' => get_class($event->payment),
                'model_id' => $event->payment->id,
                'recipient' => $event->payment->customer_email ?? null,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::debug('[SendPaymentNotifications] Outbox key reservation failed (likely duplicate)', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            // Unique constraint violation means already processed
            return false;
        }
    }
}


