<?php

namespace App\Jobs;

use App\Mail\OrderStatusUpdate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusUpdateEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;
    protected $status;
    protected $message;
    public $tries = 5;
    public $backoff = [5, 10, 20, 30];

    public function __construct($order, $status, $message = '')
    {
        $this->order = $order;
        $this->status = $status;
        $this->message = $message;
    }

    public function handle()
    {
        \Log::info('[SendOrderStatusUpdateEmail] Handling job', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->status,
            'has_message' => $this->message !== '',
            'user_email' => $this->order->user->email ?? null,
        ]);
        try {
            Mail::to($this->order->user->email)
                ->send(new OrderStatusUpdate($this->order, $this->status, $this->message));
        } catch (\Throwable $e) {
            \Log::error('[SendOrderStatusUpdateEmail] Send failed', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
