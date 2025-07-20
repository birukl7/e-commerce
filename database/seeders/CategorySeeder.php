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
            // id = 0
            [
                "name" => "clothes", 
                "slug" => "clothes", 
                "description" => "Clothes", 
                "parent_id" => null, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "img/categories/clothes.jpg"
            ],
            // id = 1
            [
                "name" => "electronics", 
                "slug" => "electronics", 
                "description" => "Electronics", 
                "parent_id" => null, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "img/categories/electronics.jpg"
            ],
        ];

        $subCategories = [
            // id = 2
            [
                "name" => "shoes", 
                "slug" => "shoes", 
                "description" => "Shoes", 
                "parent_id" => 1, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "img/categories/shoes.jpg"
            ],
            // id = 3
            [
                "name" => "dresses", 
                "slug" => "dresses", 
                "description" => "Dresses", 
                "parent_id" => 1, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "img/categories/dresses.jpg"
            ],
            // id = 4
            [
                "name" => "shirts", 
                "slug" => "shirts", 
                "description" => "Shirts", 
                "parent_id" => 1, 
                "sort_order" => 3, 
                "is_active" => true, 
                "image" => "img/categories/shirts.jpg"
            ],
            // id = 5
            [
                "name" => "laptops", 
                "slug" => "laptops", 
                "description" => "Laptops", 
                "parent_id" => 2, 
                "sort_order" => 1, 
                "is_active" => true, 
                "image" => "img/categories/laptops.jpg"
            ],
            // id = 6
            [
                "name" => "powerbanks", 
                "slug" => "powerbanks", 
                "description" => "Power Banks", 
                "parent_id" => 2, 
                "sort_order" => 2, 
                "is_active" => true, 
                "image" => "img/categories/powerbanks.jpg"
            ],
            // id = 7
            [
                "name" => "smartphones", 
                "slug" => "smartphones", 
                "description" => "Smart Phones", 
                "parent_id" => 2, 
                "sort_order" => 3, 
                "is_active" => true, 
                "image" => "img/categories/smartphones.jpg"
            ],
        ];

        foreach ($mainCategories as $category) {
            Category::create($category);
        }

        foreach($subCategories as $category) {
            Category::create($category);
        }
    }
}
