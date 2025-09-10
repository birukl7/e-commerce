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
        $this->order = $order;
        $this->user = $order->user;
    }

    public function build()
    {
        return $this->subject('Order Confirmation - #' . $this->order->order_number)
                    ->view('emails.orders.confirmation')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user
                    ]);
    }
}
