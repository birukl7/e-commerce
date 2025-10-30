<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdvanceOrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function build()
    {
        return $this->subject(trans('emails.advance_order_confirmation', ['id' => $this->order->id]))
            ->view('emails.orders.advance-confirmation')
            ->with([
                'order' => $this->order,
                'user' => $this->order->user,
            ]);
    }
}


