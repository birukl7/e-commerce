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

class SendPaymentNotifications implements ShouldQueue
{
    public function handle($event): void
    {
        $payment = $event->payment;
        $context = $event->context ?? 'checkout';

        $key = $this->makeKey($event);

        if (!$this->reserveOutboxKey($key, $event)) {
            if (app()->environment('testing')) {
                \Log::info('[SendPaymentNotifications] Duplicate/outbox key exists; skipping', ['key' => $key]);
            }
            return; // Already processed
        }

        if ($event instanceof PaymentCompleted) {
            if (app()->environment('testing')) {
                \Log::info('[SendPaymentNotifications] PaymentCompleted received (no customer email sent). Awaiting admin approval.', ['context' => $context, 'tx_ref' => $payment->tx_ref]);
            }
            // Intentionally do not send customer emails on gateway completion.
            // Final completion and customer notification happen on admin approval.
            return;
        }

        if ($event instanceof PaymentApproved) {
            if (app()->environment('testing')) {
                \Log::info('[SendPaymentNotifications] Handling PaymentApproved', ['context' => $context, 'tx_ref' => $payment->tx_ref]);
            }
            $this->onPaymentApproved($payment, $context);
            return;
        }

        if ($event instanceof PaymentFailed) {
            // Check idempotency for PaymentFailed
            $failedKey = $this->makeKeyForFailed($event);
            if (!$this->reserveOutboxKey($failedKey, $event)) {
                if (app()->environment('testing')) {
                    \Log::info('[SendPaymentNotifications] Duplicate/outbox key exists for PaymentFailed; skipping', ['key' => $failedKey]);
                }
                return; // Already processed
            }
            
            if (app()->environment('testing')) {
                \Log::info('[SendPaymentNotifications] Handling PaymentFailed', ['context' => $context, 'tx_ref' => $payment->tx_ref]);
            }
            $this->onPaymentFailed($payment, $context);
            return;
        }
    }

    private function onPaymentCompleted($payment, string $context): void
    {
        if ($context === 'checkout') {
            $order = $payment->order;
            $user = $order?->user;
            if ($order && $user) {
                if (app()->environment('testing')) {
                    \Log::info('[SendPaymentNotifications] Dispatch SendPaymentConfirmationEmail');
                }
                SendPaymentConfirmationEmail::dispatch($payment, $user, $order)
                    ->onQueue('emails');
            }
            return;
        }

        if ($context === 'advance') {
            $productRequest = $payment->productRequest;
            $user = $productRequest?->user;
            if ($productRequest && $user) {
                if (app()->environment('testing')) {
                    \Log::info('[SendPaymentNotifications] Dispatch SendAdvancePaymentConfirmationEmail');
                }
                SendAdvancePaymentConfirmationEmail::dispatch($payment, $user, $productRequest)
                    ->onQueue('emails');
            }
            return;
        }
    }

    private function onPaymentApproved($payment, string $context): void
    {
        if ($context === 'checkout') {
            $order = $payment->order;
            $user = $order?->user;
            if ($order && $user) {
                if (app()->environment('testing')) {
                    \Log::info('[SendPaymentNotifications] Dispatch SendPaymentApprovedEmail');
                }
                SendPaymentApprovedEmail::dispatch($payment, $user, $order)
                    ->onQueue('emails');
            }
            return;
        }

        if ($context === 'advance') {
            $productRequest = $payment->productRequest;
            $user = $productRequest?->user;
            if ($productRequest && $user) {
                if (app()->environment('testing')) {
                    \Log::info('[SendPaymentNotifications] Dispatch SendAdvancePaymentApprovedEmail');
                }
                SendAdvancePaymentApprovedEmail::dispatch($payment, $user, $productRequest)
                    ->onQueue('emails');
            }
            return;
        }
    }

    private function onPaymentFailed($payment, string $context): void
    {
        $user = null;
        if ($context === 'checkout') {
            $user = $payment->order?->user;
        } elseif ($context === 'advance') {
            $user = $payment->productRequest?->user;
        }

        if ($user) {
            SendPaymentFailedEmail::dispatch($payment, $user)
                ->onQueue('emails');
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
            // Unique constraint violation means already processed
            return false;
        }
    }
}


