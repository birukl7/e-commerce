<?php

namespace App\Listeners;

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Jobs\SendPaymentConfirmationEmail;
use App\Jobs\SendPaymentApprovedEmail;
use App\Jobs\SendAdvancePaymentConfirmationEmail;
use App\Jobs\SendAdvancePaymentApprovedEmail;
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
                dispatch(new SendPaymentConfirmationEmail($payment, $user, $order));
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
                dispatch(new SendAdvancePaymentConfirmationEmail($payment, $user, $productRequest));
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
                dispatch(new SendPaymentApprovedEmail($payment, $user, $order));
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
                dispatch(new SendAdvancePaymentApprovedEmail($payment, $user, $productRequest));
            }
            return;
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


