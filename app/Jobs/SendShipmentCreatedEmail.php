<?php

namespace App\Jobs;

use App\Mail\ShipmentCreated as ShipmentCreatedMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendShipmentCreatedEmail extends BaseMailJob
{
    public function __construct(
        public Order $order,
        public User $user,
        public ?string $trackingNumber = null
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'tracking_number' => $this->trackingNumber,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new ShipmentCreatedMail($this->order, $this->trackingNumber));
            
            $this->logJobComplete([
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'tracking_number' => $this->trackingNumber,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'order_id' => $this->order->id ?? null,
                'order_number' => $this->order->order_number ?? null,
                'tracking_number' => $this->trackingNumber,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}


