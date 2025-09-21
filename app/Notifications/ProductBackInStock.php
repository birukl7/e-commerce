<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductBackInStock extends Notification implements ShouldQueue
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
        $url = route('products.show', $this->product->slug);
        
        return (new MailMessage)
            ->subject('🎉 Good News! ' . $this->product->name . ' is Back in Stock')
            ->greeting('Hello!')
            ->line('Great news! The product you were waiting for is now back in stock:')
            ->line('')
            ->line('**Product:** ' . $this->product->name)
            ->line('**SKU:** ' . $this->product->sku)
            ->line('**Current Stock:** ' . $this->product->stock_quantity . ' units available')
            ->line('**Price:** ETB ' . number_format($this->product->current_price, 2))
            ->action('View Product', $url)
            ->line('Hurry up! Stock is limited and this product might sell out quickly.')
            ->line('Thank you for your patience!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Product "' . $this->product->name . '" is back in stock!',
            'url' => route('products.show', $this->product->slug),
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'stock_quantity' => $this->product->stock_quantity,
            'price' => $this->product->current_price,
            'type' => 'product_back_in_stock'
        ];
    }
    
    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'product-back-in-stock';
    }
}
