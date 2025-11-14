<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;
    public $transaction;

    public function __construct(Order $order, PaymentTransaction $transaction)
    {
        $this->order = $order->load('user');
        $this->user = $this->order->user;
        $this->transaction = $transaction;
    }

    public function build()
    {
        $subject = trans('emails.payment_confirmation', ['id' => $this->order->id]);
        
        \Log::debug('[PaymentConfirmation] Building mailable', [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? null,
            'payment_id' => $this->transaction->id ?? null,
            'tx_ref' => $this->transaction->tx_ref ?? null,
            'user_email' => $this->user->email ?? null,
            'payment_method' => $this->transaction->payment_method ?? null,
            'subject' => $subject,
        ]);
        
        return $this->subject($subject)
                    ->view('emails.payments.confirmation')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user,
                        'transaction' => $this->transaction
                    ]);
    }
}
