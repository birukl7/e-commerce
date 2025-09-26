<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;

class CreateSampleProductsIfEmptySeeder extends Seeder
{
    public function run(): void
    {
        if (Product::query()->count() > 0) {
            Log::info('CreateSampleProductsIfEmptySeeder: products already exist, skipping.');
            return;
        }

        $category = Category::query()->where('is_active', true)->orderBy('id')->first();
        $brand = Brand::query()->where('is_active', true)->orderBy('id')->first();

        if (!$category || !$brand) {
            Log::warning('CreateSampleProductsIfEmptySeeder: No active category or brand found; cannot create products due to FKs.');
            return;
        }

        DB::transaction(function () use ($category, $brand) {
            $items = [
                ['name' => 'Demo T-Shirt', 'sku' => 'DEMO-TS-001', 'price' => 29.99, 'stock_quantity' => 120],
                ['name' => 'Demo Sneakers', 'sku' => 'DEMO-SNK-001', 'price' => 89.99, 'stock_quantity' => 60],
                ['name' => 'Demo Backpack', 'sku' => 'DEMO-BAG-001', 'price' => 59.99, 'stock_quantity' => 80],
                ['name' => 'Demo Headphones', 'sku' => 'DEMO-AUD-001', 'price' => 129.99, 'stock_quantity' => 40],
            ];

            foreach ($items as $i) {
                Product::updateOrCreate(
                    ['sku' => $i['sku']],
                    [
                        'name' => $i['name'],
                        'slug' => str( $i['name'] )->slug()->toString(),
                        'description' => 'Sample product for demo purposes.',
                        'price' => $i['price'],
                        'sale_price' => null,
                        'cost_price' => max(1, $i['price'] * 0.6),
                        'stock_quantity' => $i['stock_quantity'],
                        'manage_stock' => true,
                        'stock_status' => 'in_stock',
                        'category_id' => $category->id,
                        'brand_id' => $brand->id,
                        'featured' => false,
                        'status' => 'published',
                        'meta_title' => $i['name'],
                        'meta_description' => 'Sample product meta description.'
                    ]
                );
            }
        });
    }
}


