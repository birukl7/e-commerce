<?php

namespace App\Jobs;

use App\Mail\PaymentConfirmation;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendPaymentConfirmationEmail extends BaseMailJob
{
    public function __construct(
        public PaymentTransaction $payment,
        public User $user,
        public Order $order
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'payment_id' => $this->payment->id,
            'tx_ref' => $this->payment->tx_ref ?? null,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? null,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new PaymentConfirmation($this->order, $this->payment));
            
            $this->logJobComplete([
                'payment_id' => $this->payment->id,
                'tx_ref' => $this->payment->tx_ref ?? null,
                'order_id' => $this->order->id,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'payment_id' => $this->payment->id ?? null,
                'tx_ref' => $this->payment->tx_ref ?? null,
                'order_id' => $this->order->id ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}
