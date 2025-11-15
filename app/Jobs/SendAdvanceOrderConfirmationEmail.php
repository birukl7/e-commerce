<?php

namespace App\Jobs;

use App\Mail\AdvanceOrderConfirmation;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendAdvanceOrderConfirmationEmail extends BaseMailJob
{
    public function __construct(
        public Order $order,
        public User $user
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new AdvanceOrderConfirmation($this->order));
            
            $this->logJobComplete([
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'order_id' => $this->order->id ?? null,
                'order_number' => $this->order->order_number ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}


