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
        //
        $brands = [
            ["name" => "Kalvin Klein", "slug" => "kclien1234", "description" => "clothes brand", "logo" => "logos/kalvin", "is_active" => true],
            ["name" => "Apple", "slug" => "apple1234", "description" => "phone brand", "logo" => "logos/kalvin", "is_active" => true],
            ["name" => "Lenovo", "slug" => "lenovo1234", "description" => "laptop brand", "logo" => "logos/kalvin", "is_active" => true],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }

    }
}
