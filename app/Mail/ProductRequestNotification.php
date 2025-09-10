<?php

namespace App\Mail;

use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductRequestNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $productRequest;
    public $user;
    public $type;
    public $admin;

    /**
     * Create a new message instance.
     *
     * @param ProductRequest $productRequest
     * @param User $user
     * @param string $type
     * @param User|null $admin
     */
    public function __construct(ProductRequest $productRequest, User $user, string $type, ?User $admin = null)
    {
        $this->productRequest = $productRequest;
        $this->user = $user;
        $this->type = $type;
        $this->admin = $admin;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $subject = match($this->type) {
            'submitted' => 'Product Request Submitted - ' . $this->productRequest->title,
            'status_updated' => 'Product Request ' . ucfirst($this->productRequest->status) . ' - ' . $this->productRequest->title,
            default => 'Product Request Update - ' . $this->productRequest->title,
        };

        return $this->subject($subject)
                    ->view('emails.products.request-notification')
                    ->with([
                        'type' => $this->type,
                        'productRequest' => $this->productRequest,
                        'admin' => $this->admin,
                    ]);
    }
}
