<?php

namespace App\Mail;

use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdvancePaymentApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProductRequest $productRequest,
        public PaymentTransaction $transaction
    ) {}

    public function build()
    {
        return $this->subject('Advance Payment Approved - Request #' . $this->productRequest->id)
            ->view('emails.payments.advance-approved')
            ->with([
                'productRequest' => $this->productRequest,
                'user' => $this->productRequest->user,
                'transaction' => $this->transaction,
            ]);
    }
}


