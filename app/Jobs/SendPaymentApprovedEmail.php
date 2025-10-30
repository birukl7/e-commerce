<?php

namespace App\Jobs;

use App\Mail\PaymentApproved;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPaymentApprovedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $payment,
        public $user,
        public $order
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)->send(new PaymentApproved($this->order, $this->payment));
    }
}


