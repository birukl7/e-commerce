<?php

namespace App\Jobs;

use App\Mail\OrderConfirmation;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail extends BaseMailJob
{
    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $this->logJobStart([
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'user_email' => $this->order->user->email ?? null,
        ]);

        try {
            Mail::to($this->order->user->email)
                ->send(new OrderConfirmation($this->order));
            
            $this->logJobComplete([
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number ?? null,
            ]);
        }
    }
}
