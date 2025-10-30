<?php

namespace App\Jobs;

use App\Mail\PaymentFailed as PaymentFailedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPaymentFailedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public $payment, public $user) {}

    public function handle(): void
    {
        Mail::to($this->user->email)->send(new PaymentFailedMail($this->payment));
    }
}


