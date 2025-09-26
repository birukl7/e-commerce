<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class RestockProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Only touch the products table; avoid creating new rows in other tables
            Product::query()->chunkById(200, function ($products) {
                foreach ($products as $product) {
                    $targetStock = $this->determineTargetStock((int) $product->stock_quantity);
                    $lowStockThreshold = $this->determineLowStockThreshold($targetStock);

                    $product->manage_stock = true;
                    $product->low_stock_threshold = $lowStockThreshold;
                    $product->stock_quantity = $targetStock;
                    // Let model events/observers compute stock_status consistently
                    $product->save();
                }
            });
        });
    }

    private function determineTargetStock(int $current): int
    {
        // If zero or negative, restock generously; otherwise, bump to a healthy minimum
        if ($current <= 0) {
            return random_int(50, 200);
        }
        // Ensure at least a healthy floor without overshooting too much
        return max($current, 40);
    }

    private function determineLowStockThreshold(int $targetStock): int
    {
        // 10–20% of target stock, bounded 5–25
        $threshold = (int) round($targetStock * 0.15);
        return max(5, min($threshold, 25));
    }
}


