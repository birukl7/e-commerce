<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $mainCategories = [
            [
                "name" => "Clothes", 
                "slug" => "clothes", 
                "description" => "Clothing and Apparel", 
                "parent_id" => null, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "clothes.jpg"
            ],
            [
                "name" => "Electronics", 
                "slug" => "electronics", 
                "description" => "Electronic Devices and Accessories", 
                "parent_id" => null, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "electronics.jpg"
            ],
        ];

        $subCategories = [
            [
                "name" => "Shoes", 
                "slug" => "shoes", 
                "description" => "Footwear for all occasions", 
                "parent_id" => 1, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "shoes.jpg"
            ],
            [
                "name" => "Shirts", 
                "slug" => "shirts", 
                "description" => "Various styles of shirts", 
                "parent_id" => 1, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "shirt.jpg"
            ],
            [
                "name" => "Trousers", 
                "slug" => "trousers", 
                "description" => "Female Trousers", 
                "parent_id" => 1, 
                "sort_order" => 3, 
                "is_active" => true, 
                "image" => "female_trousers.jpg"
            ],
            [
                "name" => "Laptops", 
                "slug" => "laptops", 
                "description" => "Portable computers", 
                "parent_id" => 2, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "laptop.jpg"
            ],
            [
                "name" => "Smartphones", 
                "slug" => "smartphones", 
                "description" => "Mobile phones and smart devices", 
                "parent_id" => 2, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "smartphone.jpg"
            ]
        ];

        foreach ($mainCategories as $category) {
            Category::create($category);
        }

        foreach($subCategories as $category) {
            Category::create($category);
        }
    }
}
