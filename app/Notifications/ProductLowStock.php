<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductLowStock extends Notification implements ShouldQueue
{
    use Queueable;

    public $product;
    public $currentStock;
    public $threshold;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
        $this->currentStock = $product->stock_quantity;
        $this->threshold = $product->low_stock_threshold;
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
            ->subject('⚠️ Low Stock Alert: ' . $this->product->name)
            ->line('The following product is running low on stock:')
            ->line('')
            ->line('**Product:** ' . $this->product->name)
            ->line('**SKU:** ' . $this->product->sku)
            ->line('**Current Stock:** ' . $this->currentStock . ' (Threshold: ' . $this->threshold . ')')
            ->action('Update Stock', $url)
            ->line('Please consider restocking this product soon to avoid running out of inventory.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Product "' . $this->product->name . '" is running low on stock (Current: ' . $this->currentStock . ', Threshold: ' . $this->threshold . ').',
            'url' => route('admin.products.edit', $this->product->id),
            'product_id' => $this->product->id,
            'current_stock' => $this->currentStock,
            'threshold' => $this->threshold,
            'type' => 'product_low_stock'
        ];
    }
    
    /**
     * Get the notification's database type.
     */
    public function databaseType(object $notifiable): string
    {
        return 'product-low-stock';
    }
}
