<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Deactivate old legacy categories if any exist
        Category::whereNotIn('slug', [
            'electronics',
            'handcraft-goods',
            'laptops',
            'computers-pcs',
            'wifi-routers',
            'electronic-devices',
            'string-drawings',
            'habesha-sefed',
            'jebena-pots',
            'cultural-crafts',
        ])->update(['is_active' => false]);

        $mainCategories = [
            [
                "name" => "Electronics & Computers", 
                "slug" => "electronics", 
                "description" => "Computers, laptops, networking equipment, routers, and electronic devices", 
                "parent_id" => null, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Hand Craft Goods", 
                "slug" => "handcraft-goods", 
                "description" => "Authentic Ethiopian handmade crafts, cultural string drawings, Habesha Sefed, and Jebena pots", 
                "parent_id" => null, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
        ];

        $createdMain = [];
        foreach ($mainCategories as $catData) {
            $createdMain[$catData['slug']] = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
        }

        $subCategories = [
            // Electronics subcategories
            [
                "name" => "Laptops & Notebooks", 
                "slug" => "laptops", 
                "description" => "Portable laptops, high-performance ultrabooks, and workstations", 
                "parent_slug" => "electronics",
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Computers & Desktop PCs", 
                "slug" => "computers-pcs", 
                "description" => "Desktop computers, custom PC builds, towers, and all-in-one workstations", 
                "parent_slug" => "electronics",
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "WiFi Routers & Networking", 
                "slug" => "wifi-routers", 
                "description" => "High-speed Wi-Fi 6 routers, mesh systems, and networking devices", 
                "parent_slug" => "electronics",
                "sort_order" => 3, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Electronic Devices & Accessories", 
                "slug" => "electronic-devices", 
                "description" => "Gadgets, smart devices, power banks, and electronics accessories", 
                "parent_slug" => "electronics",
                "sort_order" => 4, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            // Hand Craft Goods subcategories
            [
                "name" => "String Drawings & Art", 
                "slug" => "string-drawings", 
                "description" => "Handmade string art, geometric canvas patterns, and cultural string drawings", 
                "parent_slug" => "handcraft-goods",
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Habesha Sefed", 
                "slug" => "habesha-sefed", 
                "description" => "Traditional woven Habesha Sefed baskets, plates, and ornamental wall hangings", 
                "parent_slug" => "handcraft-goods",
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Jebena Pots & Pottery", 
                "slug" => "jebena-pots", 
                "description" => "Authentic handcrafted clay Jebena coffee pots, pottery sets, and ceremonial pieces", 
                "parent_slug" => "handcraft-goods",
                "sort_order" => 3, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
            [
                "name" => "Cultural Crafts & Decor", 
                "slug" => "cultural-crafts", 
                "description" => "Hand-carved wooden crafts, traditional Ethiopian cultural art, and home accents", 
                "parent_slug" => "handcraft-goods",
                "sort_order" => 4, 
                "is_active" => true, 
                "image" => "/image/placeholder.png"
            ],
        ];

        foreach ($subCategories as $subCatData) {
            $parentSlug = $subCatData['parent_slug'];
            unset($subCatData['parent_slug']);
            $parent = $createdMain[$parentSlug] ?? Category::where('slug', $parentSlug)->first();
            $subCatData['parent_id'] = $parent?->id;

            Category::updateOrCreate(
                ['slug' => $subCatData['slug']],
                $subCatData
            );
        }
    }
}
