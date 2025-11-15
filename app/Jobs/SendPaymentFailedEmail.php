<?php

namespace App\Jobs;

use App\Mail\PaymentFailed as PaymentFailedMail;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendPaymentFailedEmail extends BaseMailJob
{
    public function __construct(
        public PaymentTransaction $payment,
        public User $user
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'payment_id' => $this->payment->id,
            'tx_ref' => $this->payment->tx_ref ?? null,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new PaymentFailedMail($this->payment));
            
            $this->logJobComplete([
                'payment_id' => $this->payment->id,
                'tx_ref' => $this->payment->tx_ref ?? null,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'payment_id' => $this->payment->id ?? null,
                'tx_ref' => $this->payment->tx_ref ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}


