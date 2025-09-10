<?php

namespace App\Jobs;

use App\Mail\PaymentConfirmation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPaymentConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $payment;
    protected $user;
    protected $order;

    public function __construct($payment, $user, $order)
    {
        $this->payment = $payment;
        $this->user = $user;
        $this->order = $order;
    }

    public function handle()
    {
        try {
            Mail::to($this->user->email)
                ->send(new PaymentConfirmation($this->order, $this->payment));
        } catch (\Exception $e) {
            \Log::error('Failed to send payment confirmation email: ' . $e->getMessage());
            throw $e; // Re-throw to mark job as failed
        }
    }
}
