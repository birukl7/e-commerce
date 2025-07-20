<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Brand;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run():  void
    {
        $brands = [
            [
                "name" => "Calvin Klein", 
                "slug" => "calvin-klein", 
                "description" => "Renowned clothing and fashion brand", 
                "logo" => "calvin_klein_logo.jpg", 
                "is_active" => true
            ],
            [
                "name" => "Under Armour", 
                "slug" => "under-armour", 
                "description" => "Sports and athletic wear brand", 
                "logo" => "under_armour_logo.jpg", 
                "is_active" => true
            ],
            [
                "name" => "Apple", 
                "slug" => "apple", 
                "description" => "Technology and electronics brand", 
                "logo" => "apple_logo.jpg", 
                "is_active" => true
            ],
            [
                "name" => "Lenovo", 
                "slug" => "lenovo", 
                "description" => "Computer and technology brand", 
                "logo" => "lenovo_logo.jpg", 
                "is_active" => true
            ],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
