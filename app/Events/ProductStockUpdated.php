<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductStockUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $product;
    public $updateType;
    public $quantity;

    /**
     * Create a new event instance.
     *
     * @param Product $product
     * @param string $updateType Type of update: 'decreased', 'increased', 'out_of_stock', 'low_stock'
     * @param int $quantity The quantity involved in the update
     */
    public function __construct(Product $product, string $updateType, int $quantity = 0)
    {
        $this->product = $product;
        $this->updateType = $updateType;
        $this->quantity = $quantity;
    }
}
