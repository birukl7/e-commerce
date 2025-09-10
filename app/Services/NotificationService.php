<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendPaymentConfirmationEmail;
use App\Jobs\SendEmailJob;
use App\Mail\AccountActivity;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function sendOrderConfirmation(Order $order): void
    {
        Log::info('[NotificationService] Dispatching SendOrderConfirmationEmail', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'user_email' => $order->user->email ?? null,
        ]);
        SendOrderConfirmationEmail::dispatch($order)
            ->delay(now()->addSeconds(2))
            ->onQueue('emails');
    }

    public function sendOrderStatusUpdate(Order $order, string $status, string $message = ''): void
    {
        Log::info('[NotificationService] Dispatching SendOrderStatusUpdateEmail', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $status,
            'has_message' => $message !== '',
        ]);
        SendOrderStatusUpdateEmail::dispatch($order, $status, $message)
            ->delay(now()->addSeconds(5))
            ->onQueue('emails');
    }

    public function sendPaymentConfirmation(Order $order, PaymentTransaction $transaction): void
    {
        Log::info('[NotificationService] Dispatching SendPaymentConfirmationEmail', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'payment_id' => $transaction->id ?? null,
            'tx_ref' => $transaction->tx_ref ?? null,
            'user_email' => $order->user->email ?? null,
        ]);
        SendPaymentConfirmationEmail::dispatch($transaction, $order->user, $order)
            ->delay(now()->addSeconds(1))
            ->onQueue('emails');
    }

    public function sendAccountActivity(User $user, string $activityType, array $data = []): void
    {
        $this->sendEmail($user->email, new AccountActivity($user, $activityType, $data));
    }

    protected function sendEmail(string $email, $mailable): void
    {
        try {
            SendEmailJob::dispatch($mailable, $email)
                ->onQueue('emails');
        } catch (\Exception $e) {
            Log::error('Failed to queue email: ' . $e->getMessage());
        }
    }
}
