<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product; // Don't forget to import the Product model

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                "name" => "Men's Slim Fit Denim Jeans",
                "slug" => "mens-slim-fit-denim-jeans",
                "description" => "Classic slim fit denim jeans for men, perfect for casual wear. Made from high-quality stretch denim for comfort.",
                "sku" => "DMJ-001",
                "price" => 120.40,
                "sale_price" => 99.99,
                "cost_price" => 70.00,
                "stock_quantity" => 50,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 3, // Assuming Trousers is category_id 3
                "brand_id" => 1, // Calvin Klein
                "featured" => true,
                "status" => "published",
                "meta_title" => "Men's Slim Fit Denim Jeans | Calvin Klein",
                "meta_description" => "Shop Calvin Klein men's slim fit denim jeans. Comfortable and stylish for everyday wear."
            ],
            [
                "name" => "Women's High-Waisted Skinny Jeans",
                "slug" => "womens-high-waisted-skinny-jeans",
                "description" => "Trendy high-waisted skinny jeans for women, offering a flattering fit and versatile style. Ideal for various outfits.",
                "sku" => "WSHWJ-002",
                "price" => 95.00,
                "sale_price" => null,
                "cost_price" => 60.00,
                "stock_quantity" => 75,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 3, // Assuming Trousers is category_id 3
                "brand_id" => 1, // Calvin Klein
                "featured" => false,
                "status" => "published",
                "meta_title" => "Women's High-Waisted Skinny Jeans | Calvin Klein",
                "meta_description" => "Discover Calvin Klein women's high-waisted skinny jeans for a sleek and comfortable look."
            ],
            [
                "name" => "Performance Running Shoes",
                "slug" => "performance-running-shoes",
                "description" => "Lightweight and responsive running shoes designed for optimal performance and comfort during long runs.",
                "sku" => "PRS-UA-003",
                "price" => 150.00,
                "sale_price" => 120.00,
                "cost_price" => 90.00,
                "stock_quantity" => 40,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 1, // Assuming Shoes is category_id 1
                "brand_id" => 2, // Under Armour
                "featured" => true,
                "status" => "published",
                "meta_title" => "Performance Running Shoes | Under Armour",
                "meta_description" => "Get your Under Armour performance running shoes for superior comfort and speed."
            ],
            [
                "name" => "Tech-Fit Training T-Shirt",
                "slug" => "tech-fit-training-tshirt",
                "description" => "Breathable and quick-drying training t-shirt, ideal for intense workouts. Features moisture-wicking technology.",
                "sku" => "TFTT-UA-004",
                "price" => 45.00,
                "sale_price" => null,
                "cost_price" => 25.00,
                "stock_quantity" => 100,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 2, // Assuming Shirts is category_id 2
                "brand_id" => 2, // Under Armour
                "featured" => false,
                "status" => "published",
                "meta_title" => "Tech-Fit Training T-Shirt | Under Armour",
                "meta_description" => "Stay dry and comfortable with Under Armour's Tech-Fit training t-shirt."
            ],
            [
                "name" => "MacBook Pro 14-inch",
                "slug" => "macbook-pro-14-inch",
                "description" => "Powerful 14-inch MacBook Pro with M3 chip, ideal for professional creative tasks and everyday use.",
                "sku" => "MBP14-005",
                "price" => 1999.00,
                "sale_price" => null,
                "cost_price" => 1500.00,
                "stock_quantity" => 20,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 4, // Assuming Laptops is category_id 4
                "brand_id" => 3, // Apple
                "featured" => true,
                "status" => "published",
                "meta_title" => "MacBook Pro 14-inch | Apple",
                "meta_description" => "Experience the power of the Apple MacBook Pro 14-inch for all your demanding tasks."
            ],
            [
                "name" => "iPhone 15 Pro Max",
                "slug" => "iphone-15-pro-max",
                "description" => "The latest iPhone 15 Pro Max with advanced camera system, A17 Bionic chip, and stunning display.",
                "sku" => "IP15PM-006",
                "price" => 1199.00,
                "sale_price" => null,
                "cost_price" => 900.00,
                "stock_quantity" => 30,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 5, // Assuming Smartphones is category_id 5
                "brand_id" => 3, // Apple
                "featured" => true,
                "status" => "published",
                "meta_title" => "iPhone 15 Pro Max | Apple",
                "meta_description" => "Discover the new iPhone 15 Pro Max from Apple, featuring cutting-edge technology."
            ],
            [
                "name" => "Lenovo ThinkPad X1 Carbon",
                "slug" => "lenovo-thinkpad-x1-carbon",
                "description" => "Ultra-light and durable business laptop, known for its performance and security features.",
                "sku" => "LTX1C-007",
                "price" => 1700.00,
                "sale_price" => 1550.00,
                "cost_price" => 1200.00,
                "stock_quantity" => 25,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 4, // Assuming Laptops is category_id 4
                "brand_id" => 4, // Lenovo
                "featured" => false,
                "status" => "published",
                "meta_title" => "Lenovo ThinkPad X1 Carbon | Business Laptop",
                "meta_description" => "The Lenovo ThinkPad X1 Carbon: a powerful and secure laptop for professionals."
            ],
            [
                "name" => "Lenovo IdeaPad Flex 5",
                "slug" => "lenovo-ideapad-flex-5",
                "description" => "Versatile 2-in-1 laptop with touchscreen and pen support, great for productivity and entertainment.",
                "sku" => "LIF5-008",
                "price" => 750.00,
                "sale_price" => null,
                "cost_price" => 550.00,
                "stock_quantity" => 35,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 4, // Assuming Laptops is category_id 4
                "brand_id" => 4, // Lenovo
                "featured" => false,
                "status" => "published",
                "meta_title" => "Lenovo IdeaPad Flex 5 | 2-in-1 Laptop",
                "meta_description" => "Explore the versatile Lenovo IdeaPad Flex 5, perfect for work and play."
            ],
            [
                "name" => "Classic White T-Shirt",
                "slug" => "classic-white-t-shirt",
                "description" => "A timeless classic, 100% cotton white t-shirt. Comfortable and versatile for any occasion.",
                "sku" => "CWT-009",
                "price" => 25.00,
                "sale_price" => null,
                "cost_price" => 10.00,
                "stock_quantity" => 200,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 2, // Assuming Shirts is category_id 2
                "brand_id" => 1, // Calvin Klein (can be any clothing brand, but using an existing one)
                "featured" => false,
                "status" => "published",
                "meta_title" => "Classic White T-Shirt | Calvin Klein",
                "meta_description" => "Shop the classic white t-shirt by Calvin Klein for everyday style."
            ],
            [
                "name" => "Casual Sneakers",
                "slug" => "casual-sneakers",
                "description" => "Comfortable and stylish casual sneakers, perfect for daily wear and light activities.",
                "sku" => "CS-010",
                "price" => 80.00,
                "sale_price" => 65.00,
                "cost_price" => 40.00,
                "stock_quantity" => 80,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 1, // Assuming Shoes is category_id 1
                "brand_id" => 2, // Under Armour (can be any shoe brand, but using an existing one)
                "featured" => false,
                "status" => "published",
                "meta_title" => "Casual Sneakers | Under Armour",
                "meta_description" => "Find comfortable casual sneakers from Under Armour for your daily needs."
            ],
            [
                "name" => "Gaming Laptop Legion 5",
                "slug" => "gaming-laptop-legion-5",
                "description" => "High-performance gaming laptop with dedicated GPU, fast processor, and vibrant display for an immersive gaming experience.",
                "sku" => "GLL5-011",
                "price" => 1400.00,
                "sale_price" => null,
                "cost_price" => 1000.00,
                "stock_quantity" => 15,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 4, // Assuming Laptops is category_id 4
                "brand_id" => 4, // Lenovo
                "featured" => true,
                "status" => "published",
                "meta_title" => "Lenovo Legion 5 Gaming Laptop",
                "meta_description" => "Unleash your gaming potential with the Lenovo Legion 5 gaming laptop."
            ],
            [
                "name" => "iPhone SE (3rd Gen)",
                "slug" => "iphone-se-3rd-gen",
                "description" => "Affordable iPhone with a powerful chip and great camera, offering a compact design.",
                "sku" => "IPSE3-012",
                "price" => 429.00,
                "sale_price" => null,
                "cost_price" => 300.00,
                "stock_quantity" => 40,
                "manage_stock" => true,
                "stock_status" => "in_stock",
                "category_id" => 5, // Assuming Smartphones is category_id 5
                "brand_id" => 3, // Apple
                "featured" => false,
                "status" => "published",
                "meta_title" => "iPhone SE (3rd Gen) | Apple",
                "meta_description" => "Experience powerful performance in a compact design with the Apple iPhone SE (3rd Gen)."
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}