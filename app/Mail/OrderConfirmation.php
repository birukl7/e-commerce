<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;

    public function __construct(Order $order)
    {
        $this->order = $order->load('user');
        $this->user = $this->order->user;
        
        // Ensure user exists
        if (!$this->user) {
            throw new \RuntimeException("Order #{$this->order->id} has no associated user");
        }
    }

    public function build()
    {
        $subject = trans('emails.order_confirmation', ['id' => $this->order->id]);
        
        \Log::debug('[OrderConfirmation] Building mailable', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? null,
            'user_email' => $this->user->email ?? null,
            'subject' => $subject,
        ]);
        
        return $this->subject($subject)
                    ->view('emails.orders.confirmation')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user
                    ]);
    }
}
