<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public PaymentTransaction $transaction
    ) {}

    public function build()
    {
        return $this->subject('Payment Approved - Order #' . $this->order->id)
            ->view('emails.payments.approved')
            ->with([
                'order' => $this->order,
                'user' => $this->order->user,
                'transaction' => $this->transaction,
            ]);
    }
}


