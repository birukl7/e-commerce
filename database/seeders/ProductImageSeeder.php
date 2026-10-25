<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductImage;
use App\Models\Product;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $placeholderPath = '/image/placeholder.png';

        $skus = [
            // WiFi Routers & Networking
            'ROUTER-TPL-001',
            'ROUTER-NET-002',
            'ROUTER-TPL-003',
            'ROUTER-HWA-004',

            // Computers & Desktop PCs
            'PC-DELL-001',
            'PC-GAM-002',
            'PC-HP-003',
            'PC-APL-004',

            // Laptops & Notebooks
            'LAP-APL-001',
            'LAP-LNV-002',
            'LAP-ASUS-003',
            'LAP-HP-004',
            'GLL5-011',

            // Electronic Devices & Accessories
            'DEV-ANK-001',
            'DEV-APL-002',

            // String Drawings & Art
            'CRAFT-STR-001',
            'CRAFT-STR-002',
            'CRAFT-STR-003',
            'CRAFT-STR-004',

            // Habesha Sefed
            'CRAFT-SFD-001',
            'CRAFT-SFD-002',
            'CRAFT-SFD-003',
            'CRAFT-SFD-004',

            // Jebena Pots & Pottery
            'CRAFT-JBN-001',
            'CRAFT-JBN-002',
            'CRAFT-JBN-003',
            'CRAFT-JBN-004',

            // Cultural Crafts & Decor
            'CRAFT-DCR-001',
            'CRAFT-DCR-002',
        ];

        foreach ($skus as $sku) {
            $product = Product::where('sku', $sku)->first();
            if ($product) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'sort_order' => 1],
                    [
                        'image_path' => $placeholderPath,
                        'is_primary' => true,
                    ]
                );

                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'sort_order' => 2],
                    [
                        'image_path' => $placeholderPath,
                        'is_primary' => false,
                    ]
                );
            }
        }

        // Ensure all active published products have placeholder images if missing
        $publishedProducts = Product::where('status', 'published')->get();
        foreach ($publishedProducts as $product) {
            if ($product->images()->count() === 0) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $placeholderPath,
                    'sort_order' => 1,
                    'is_primary' => true,
                ]);
            }
        }
    }
}