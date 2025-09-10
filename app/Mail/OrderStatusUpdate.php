<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;
    public $status;
    public $updateMessage;

    /**
     * Create a new message instance.
     *
     * @param Order $order The order instance
     * @param mixed $status The status (string, object, or array with 'name' key)
     * @param string $updateMessage Optional update message
     */
    public function __construct(Order $order, $status, string $updateMessage = '')
    {
        $this->order = $order->load('user');
        $this->user = $order->user;
        
        // Handle different status formats
        if (is_string($status)) {
            $this->status = $status;
        } elseif (is_object($status) && method_exists($status, '__toString')) {
            $this->status = (string)$status;
        } elseif (is_object($status) && property_exists($status, 'name')) {
            $this->status = $status->name;
        } elseif (is_array($status) && isset($status['name'])) {
            $this->status = $status['name'];
        } else {
            $this->status = 'processed';
        }
        
        $this->updateMessage = $updateMessage;
    }

    public function build()
    {
        $subject = "Order #{$this->order->order_number} - Status Updated to " . ucfirst($this->status);
        
        return $this->subject($subject)
                    ->view('emails.orders.status-update')
                    ->with([
                        'order' => $this->order,
                        'user' => $this->user,
                        'status' => $this->status,
                        'updateMessage' => $this->updateMessage
                    ]);
    }
}
