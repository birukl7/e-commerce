<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;
    public $transaction;

    public function __construct(Order $order, PaymentTransaction $transaction)
    {
        $this->order = $order;
        $this->user = $order->user;
        $this->transaction = $transaction;
    }

    public function build()
    {
        return $this->subject('Payment Confirmation - Order #' . $this->order->id)
                    ->view('emails.payments.confirmation')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user,
                        'transaction' => $this->transaction
                    ]);
    }
}
