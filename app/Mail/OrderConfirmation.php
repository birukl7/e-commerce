<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;

    public function __construct(Order $order)
    {
        $this->order = $order->load('user');
        $this->user = $this->order->user;
    }

    public function build()
    {
        return $this->subject(trans('emails.order_confirmation', ['id' => $this->order->id]))
                    ->view('emails.orders.confirmation')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user
                    ]);
    }
}
