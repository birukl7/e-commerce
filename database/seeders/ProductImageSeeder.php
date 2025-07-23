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
        // Define image mappings for each product based on SKU
        $productImages = [
            'DMJ-001' => [ // Men's Slim Fit Denim Jeans
                ['image_path' => '/mens-demin-slim-fit.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/jeans.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'WSHWJ-002' => [ // Women's High-Waisted Skinny Jeans
                ['image_path' => '/womens-high-waisted-skinny-jeans.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/female_trousers.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'PRS-UA-003' => [ // Performance Running Shoes
                ['image_path' => '/performance-running-shoes.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/shoes.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'TFTT-UA-004' => [ // Tech-Fit Training T-Shirt
                ['image_path' => '/techfit-training-tshirt.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/shirt.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'MBP14-005' => [ // MacBook Pro 14-inch
                ['image_path' => '/macbook-pro-14.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/laptop.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'IP15PM-006' => [ // iPhone 15 Pro Max
                ['image_path' => '/iphone-15-promax.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/smartphone.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'LTX1C-007' => [ // Lenovo ThinkPad X1 Carbon
                ['image_path' => '/thinkpad-x1-carbon.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/laptop.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'LIF5-008' => [ // Lenovo IdeaPad Flex 5
                ['image_path' => '/ideapad-flex-5.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/laptop.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'CWT-009' => [ // Classic White T-Shirt
                ['image_path' => '/classic-white-tshirt.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/white_shirt.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'CS-010' => [ // Casual Sneakers
                ['image_path' => '/casual-sneakers.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/shoes.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'GLL5-011' => [ // Gaming Laptop Legion 5
                ['image_path' => '/lenovo-legion-5.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/laptop.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
            'IPSE3-012' => [ // iPhone SE (3rd Gen)
                ['image_path' => '/iphone-se-3rd.jpg', 'is_primary' => true, 'sort_order' => 1],
                ['image_path' => '/smartphone.jpg', 'is_primary' => false, 'sort_order' => 2],
            ],
        ];

        foreach ($productImages as $sku => $images) {
            // Find the product by SKU
            $product = Product::where('sku', $sku)->first();
            
            if ($product) {
                foreach ($images as $imageData) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageData['image_path'],
                        //'alt_text' => $product->name . ' - Image',
                        'sort_order' => $imageData['sort_order'],
                        'is_primary' => $imageData['is_primary'],
                    ]);
                }
            }
        }
    }
}