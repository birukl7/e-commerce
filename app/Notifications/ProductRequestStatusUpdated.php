<?php

namespace App\Notifications;

use App\Models\ProductRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductRequestStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public $productRequest;
    public $message;
    public $subject;
    public $actionUrl;
    public $actionText;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        ProductRequest $productRequest,
        string $message,
        string $subject = 'Product Request Update',
        ?string $actionUrl = null,
        ?string $actionText = 'View Details'
    ) {
        $this->productRequest = $productRequest;
        $this->message = $message;
        $this->subject = $subject;
        $this->actionUrl = $actionUrl ?? route('user.product-requests.show', $productRequest->id);
        $this->actionText = $actionText;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject($this->subject)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($this->message);

        if ($this->productRequest->requiresPayment()) {
            $mailMessage->line(sprintf(
                'Amount to Pay: %s %s',
                number_format($this->productRequest->amount, 2),
                $this->productRequest->currency
            ));
        }

        // For rejected requests, show rejection reason prominently
        if ($this->productRequest->status === 'rejected' && $this->productRequest->rejection_reason) {
            $rejectionReasons = [
                'product_not_available' => 'Product Not Available',
                'specifications_not_matching' => 'Specifications Not Matching',
                'out_of_stock' => 'Out of Stock',
                'discontinued' => 'Product Discontinued',
                'other' => 'Other Reason',
            ];
            
            $mailMessage->line('Rejection Reason: ' . ($rejectionReasons[$this->productRequest->rejection_reason] ?? 'Other'));
        }
        
        if ($this->productRequest->admin_response) {
            $mailMessage->line('Admin Note: ' . $this->productRequest->admin_response);
        }

        $mailMessage->action($this->actionText, $this->actionUrl)
            ->line('Thank you for using our application!');

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     * NOTE: This is used for mail notifications. For database notifications, use toDatabase().
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_request_id' => $this->productRequest->id,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'action_text' => $this->actionText,
            'amount' => $this->productRequest->amount,
            'currency' => $this->productRequest->currency,
            'status' => $this->productRequest->status,
        ];
    }
    
    /**
     * Get the database representation of the notification.
     * This is used to populate the title and message columns separately.
     * CRITICAL: This method MUST return 'title' and 'message' keys for the database channel.
     */
    public function toDatabase(object $notifiable): array
    {
        // Ensure subject is never null/empty
        $title = $this->subject ?? 'Product Request Update';
        $message = $this->message ?? 'Your product request status has been updated.';
        
        return [
            'title' => $title,
            'message' => $message,
            'data' => [
                'product_request_id' => $this->productRequest->id,
                'action_url' => $this->actionUrl,
                'action_text' => $this->actionText,
                'amount' => $this->productRequest->amount ? number_format($this->productRequest->amount, 2) : null,
                'currency' => $this->productRequest->currency,
                'status' => $this->productRequest->status,
            ],
        ];
    }
}
