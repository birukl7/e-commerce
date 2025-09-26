<?php

namespace App\Observers;

use App\Models\Product;
use App\Notifications\ProductLowStock;
use App\Notifications\ProductOutOfStock;
use Illuminate\Support\Facades\Notification;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        // Update stock status when product is created
        $this->updateStockStatus($product);
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        // Check if stock quantity was changed
        if ($product->isDirty('stock_quantity')) {
            $this->updateStockStatus($product);
            $this->checkStockLevels($product);
        }
    }

    /**
     * Update the product's stock status based on quantity
     */
    protected function updateStockStatus(Product $product): void
    {
        if (!$product->manage_stock) {
            $product->stock_status = 'in_stock';
            return;
        }

        if ($product->stock_quantity <= 0) {
            $product->stock_status = 'out_of_stock';
        } elseif ($product->stock_quantity <= $product->low_stock_threshold) {
            $product->stock_status = 'low_stock';
        } else {
            $product->stock_status = 'in_stock';
        }

        // Save without triggering events to prevent infinite loops
        if ($product->isDirty('stock_status')) {
            $product->saveQuietly();
        }
    }

    /**
     * Check stock levels and send notifications if needed
     */
    protected function checkStockLevels(Product $product): void
    {
        if (!$product->manage_stock) {
            return;
        }

        // Get the original stock quantity before the update
        $originalQuantity = $product->getOriginal('stock_quantity');
        $currentQuantity = $product->stock_quantity;

        // Check if product just went out of stock
        if ($currentQuantity <= 0 && $originalQuantity > 0) {
            // Notify admin that product is out of stock
            $admin = \App\Models\AdminUser::where('is_admin', true)->first();
            if ($admin) {
                $admin->notify(new ProductOutOfStock($product));
            }
        }
        // Check if product is low on stock
        elseif ($currentQuantity <= $product->low_stock_threshold && $originalQuantity > $product->low_stock_threshold) {
            // Notify admin that product is low on stock
            $admin = \App\Models\AdminUser::where('is_admin', true)->first();
            if ($admin) {
                $admin->notify(new ProductLowStock($product));
            }
        }
    }
}
