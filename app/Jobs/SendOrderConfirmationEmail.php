<?php

namespace App\Jobs;

use App\Mail\OrderConfirmation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;
    public $tries = 5;
    public $backoff = [5, 10, 20, 30];

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function handle()
    {
        \Log::info('[SendOrderConfirmationEmail] Handling job', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'user_email' => $this->order->user->email ?? null,
        ]);
        try {
            Mail::to($this->order->user->email)
                ->send(new OrderConfirmation($this->order));
        } catch (\Throwable $e) {
            \Log::error('[SendOrderConfirmationEmail] Send failed', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
