<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class StockService
{
    /**
     * Decrease stock for all items in an order
     */
    public function decreaseStockForOrder(Order $order): bool
    {
        try {
            DB::beginTransaction();

            foreach ($order->items as $item) {
                $this->decreaseStock($item->product, $item->quantity);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to decrease stock for order: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Decrease stock for a single product
     */
    public function decreaseStock(Product $product, int $quantity = 1): bool
    {
        if (!$product->manage_stock) {
            return true;
        }

        if ($product->stock_quantity < $quantity) {
            throw new \RuntimeException("Insufficient stock for product: {$product->name}");
        }

        $product->decrement('stock_quantity', $quantity);

        // Update stock status and trigger notifications via observer logic
        $product->refresh();
        if ($product->stock_quantity <= 0) {
            // Ensure status reflects out of stock
            $product->stock_status = 'out_of_stock';
            $product->saveQuietly();
        }
        return true;
    }

    /**
     * Increase stock for a single product
     */
    public function increaseStock(Product $product, int $quantity = 1): bool
    {
        if (!$product->manage_stock) {
            return true;
        }

        $product->increment('stock_quantity', $quantity);
        return true;
    }

    /**
     * Restore stock for all items in an order
     * (Useful for order cancellations or returns)
     */
    public function restoreStockForOrder(Order $order): bool
    {
        try {
            DB::beginTransaction();

            foreach ($order->items as $item) {
                $this->increaseStock($item->product, $item->quantity);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to restore stock for order: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if there's enough stock for an order item
     */
    public function checkStock(Product $product, int $quantity = 1): bool
    {
        if (!$product->manage_stock) {
            return true;
        }

        return $product->stock_quantity >= $quantity;
    }

    /**
     * Check if there's enough stock for all items in the cart
     */
    public function checkStockForCartItems(array $cartItems): array
    {
        $outOfStockItems = [];
        
        foreach ($cartItems as $item) {
            $product = Product::find($item['product_id']);
            
            if (!$product) {
                $outOfStockItems[] = [
                    'product_id' => $item['product_id'],
                    'name' => $item['name'] ?? 'Unknown Product',
                    'reason' => 'Product not found'
                ];
                continue;
            }
            
            if ($product->manage_stock && $product->stock_quantity < $item['quantity']) {
                $outOfStockItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'available_quantity' => $product->stock_quantity,
                    'reason' => 'Insufficient stock'
                ];
            }
        }
        
        return $outOfStockItems;
    }
}
