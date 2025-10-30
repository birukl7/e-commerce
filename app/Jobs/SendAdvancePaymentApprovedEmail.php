<?php

namespace App\Jobs;

use App\Mail\AdvancePaymentApproved;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAdvancePaymentApprovedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public $payment,
        public $user,
        public $productRequest
    ) {}

    public function handle(): void
    {
        Mail::to($this->user->email)->send(new AdvancePaymentApproved($this->productRequest, $this->payment));
    }
}


