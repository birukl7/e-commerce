<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductOutOfStock extends Notification implements ShouldQueue
{
    use Queueable;

    public $product;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
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
        $url = route('admin.products.edit', $this->product->id);
        
        return (new MailMessage)
            ->subject('🚨 Product Out of Stock: ' . $this->product->name)
            ->line('The following product is now out of stock:')
            ->line('')
            ->line('**Product:** ' . $this->product->name)
            ->line('**SKU:** ' . $this->product->sku)
            ->line('**Current Stock:** ' . $this->product->stock_quantity)
            ->action('Update Stock', $url)
            ->line('Please update the stock or mark it as backordered as soon as possible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Product "' . $this->product->name . '" is out of stock (SKU: ' . $this->product->sku . ').',
            'url' => route('admin.products.edit', $this->product->id),
            'product_id' => $this->product->id,
            'type' => 'product_out_of_stock'
        ];
    }
    
    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'product-out-of-stock';
    }
}
