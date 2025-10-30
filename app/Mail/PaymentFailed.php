<?php

namespace App\Mail;

use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentFailed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PaymentTransaction $transaction)
    {
    }

    public function build()
    {
        return $this->subject(trans('emails.payment_failed'))
            ->view('emails.payments.failed')
            ->with([
                'transaction' => $this->transaction,
            ]);
    }
}


