<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ShipmentCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order, public ?string $trackingNumber = null)
    {
        // Eager load user relationship
        $this->order->load('user');
    }

    public function build()
    {
        return $this->subject(trans('emails.shipment_created', ['id' => $this->order->id]))
            ->view('emails.orders.shipment-created')
            ->with([
                'order' => $this->order,
                'user' => $this->order->user,
                'trackingNumber' => $this->trackingNumber,
            ]);
    }
}


