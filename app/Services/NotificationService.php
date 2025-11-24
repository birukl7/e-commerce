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
     * @param bool $sync If true, send immediately (synchronously). If false, queue it.
     * @return void
     */
    public function sendOrderConfirmation(Order $order, bool $sync = false): void
    {
        if ($sync) {
            // Send immediately for critical order confirmations
            Log::info('[NotificationService] Sending order confirmation email immediately (sync)', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_email' => $order->user->email ?? null,
            ]);
            
            try {
                $job = new SendOrderConfirmationEmail($order);
                $job->handle(); // Execute immediately
                Log::info('[NotificationService] Order confirmation email sent successfully (sync)', [
                    'order_id' => $order->id,
                    'user_email' => $order->user->email ?? null,
                ]);
            } catch (\Throwable $e) {
                Log::error('[NotificationService] Failed to send order confirmation email (sync)', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Fallback to queue if sync fails
                Log::info('[NotificationService] Falling back to queue for order confirmation email');
                SendOrderConfirmationEmail::dispatch($order)
                    ->onQueue('emails');
            }
        } else {
            // Queue for non-critical scenarios
            Log::info('[NotificationService] Dispatching SendOrderConfirmationEmail to queue', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_email' => $order->user->email ?? null,
            ]);
            
            SendOrderConfirmationEmail::dispatch($order)
                ->onQueue('emails');
        }
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
     * @param bool $sync If true, send immediately (synchronously). If false, queue it.
     * @return void
     */
    public function sendPaymentConfirmation(Order $order, PaymentTransaction $transaction, bool $sync = false): void
    {
        if ($sync) {
            // Send immediately for critical payment confirmations
            Log::info('[NotificationService] Sending payment confirmation email immediately (sync)', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_id' => $transaction->id ?? null,
                'tx_ref' => $transaction->tx_ref ?? null,
                'user_email' => $order->user->email ?? null,
            ]);
            
            try {
                $job = new SendPaymentConfirmationEmail($transaction, $order->user, $order);
                $job->handle(); // Execute immediately
                Log::info('[NotificationService] Payment confirmation email sent successfully (sync)', [
                    'order_id' => $order->id,
                    'user_email' => $order->user->email ?? null,
                ]);
            } catch (\Throwable $e) {
                Log::error('[NotificationService] Failed to send payment confirmation email (sync)', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Fallback to queue if sync fails
                Log::info('[NotificationService] Falling back to queue for payment confirmation email');
                SendPaymentConfirmationEmail::dispatch($transaction, $order->user, $order)
                    ->onQueue('emails');
            }
        } else {
            // Queue for non-critical scenarios
            Log::info('[NotificationService] Dispatching SendPaymentConfirmationEmail to queue', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_id' => $transaction->id ?? null,
                'tx_ref' => $transaction->tx_ref ?? null,
                'user_email' => $order->user->email ?? null,
            ]);
            
            SendPaymentConfirmationEmail::dispatch($transaction, $order->user, $order)
                ->onQueue('emails');
        }
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
