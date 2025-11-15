<?php

namespace App\Jobs;

use App\Mail\AdvancePaymentApproved;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendAdvancePaymentApprovedEmail extends BaseMailJob
{
    public function __construct(
        public PaymentTransaction $payment,
        public User $user,
        public ProductRequest $productRequest
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'payment_id' => $this->payment->id,
            'tx_ref' => $this->payment->tx_ref ?? null,
            'product_request_id' => $this->productRequest->id,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new AdvancePaymentApproved($this->productRequest, $this->payment));
            
            $this->logJobComplete([
                'payment_id' => $this->payment->id,
                'tx_ref' => $this->payment->tx_ref ?? null,
                'product_request_id' => $this->productRequest->id,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'payment_id' => $this->payment->id ?? null,
                'tx_ref' => $this->payment->tx_ref ?? null,
                'product_request_id' => $this->productRequest->id ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}


