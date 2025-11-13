<?php

namespace App\Mail;

use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdvancePaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProductRequest $productRequest,
        public PaymentTransaction $transaction
    ) {
        // Eager load user relationship
        $this->productRequest->load('user');
    }

    public function build()
    {
        return $this->subject('Advance Payment Received - Request #' . $this->productRequest->id)
            ->view('emails.payments.advance-confirmation')
            ->with([
                'productRequest' => $this->productRequest,
                'user' => $this->productRequest->user,
                'transaction' => $this->transaction,
            ]);
    }
}


