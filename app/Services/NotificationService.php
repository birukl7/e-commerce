<?php

namespace App\Services;

use App\Jobs\SendAccountActivityEmail;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendPaymentConfirmationEmail;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send order confirmation email.
     *
     * @param Order $order
     * @return void
     */
    public function sendOrderConfirmation(Order $order): void
    {
        Log::info('[NotificationService] Dispatching SendOrderConfirmationEmail', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'user_email' => $order->user->email ?? null,
        ]);
        
        SendOrderConfirmationEmail::dispatch($order)
            ->onQueue('emails');
    }

    /**
     * Send order status update email.
     *
     * @param Order $order
     * @param string $status
     * @param string $message
     * @return void
     */
    public function sendOrderStatusUpdate(Order $order, string $status, string $message = ''): void
    {
        Log::info('[NotificationService] Dispatching SendOrderStatusUpdateEmail', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $status,
            'has_message' => $message !== '',
        ]);
        
        SendOrderStatusUpdateEmail::dispatch($order, $status, $message)
            ->onQueue('emails');
    }

    /**
     * Send payment confirmation email.
     *
     * @param Order $order
     * @param PaymentTransaction $transaction
     * @return void
     */
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
            ->onQueue('emails');
    }

    /**
     * Send account activity notification email.
     *
     * @param User $user
     * @param string $activityType
     * @param array $data
     * @return void
     */
    public function sendAccountActivity(User $user, string $activityType, array $data = []): void
    {
        Log::info('[NotificationService] Dispatching SendAccountActivityEmail', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'activity_type' => $activityType,
        ]);
        
        SendAccountActivityEmail::dispatch($user, $activityType, $data)
            ->onQueue('emails');
    }
}
