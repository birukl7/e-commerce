<?php

namespace App\Jobs;

use App\Mail\OrderStatusUpdate;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusUpdateEmail extends BaseMailJob
{
    public function __construct(
        public Order $order,
        public string $status,
        public string $message = ''
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->status,
            'has_message' => $this->message !== '',
            'user_email' => $this->order->user->email ?? null,
        ]);

        try {
            $mailable = new OrderStatusUpdate($this->order, $this->status, $this->message);
            \Log::info('[SendOrderStatusUpdateEmail] Mailable created, sending email', [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $this->status,
                'recipient_email' => $this->order->user->email,
                'subject' => $mailable->subject ?? 'N/A',
                'has_message' => $this->message !== '',
            ]);
            
            Mail::to($this->order->user->email)
                ->send($mailable);
            
            \Log::info('[SendOrderStatusUpdateEmail] Email sent successfully', [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $this->status,
                'recipient_email' => $this->order->user->email,
            ]);
            
            $this->logJobComplete([
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'status' => $this->status,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'order_id' => $this->order->id,
                'order_number' => $this->order->order_number ?? null,
                'status' => $this->status,
            ]);
        }
    }
}
