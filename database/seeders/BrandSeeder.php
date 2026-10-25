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
    public function run(): void
    {
        $brands = [
            [
                "name" => "Apple", 
                "slug" => "apple", 
                "description" => "Premium technology, laptops, workstations, and smart devices", 
                "logo" => "image/apple_logo.jpg", 
                "is_active" => true
            ],
            [
                "name" => "Lenovo", 
                "slug" => "lenovo", 
                "description" => "Leading computer hardware, ThinkPad ultrabooks, and Legion gaming PCs", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "TP-Link", 
                "slug" => "tp-link", 
                "description" => "Global provider of high-speed Wi-Fi 6 routers, mesh systems, and networking products", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Netgear", 
                "slug" => "netgear", 
                "description" => "High-performance gaming routers, mesh Wi-Fi networks, and business networking", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Dell", 
                "slug" => "dell", 
                "description" => "Enterprise desktop computers, business workstations, and OptiPlex towers", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "HP", 
                "slug" => "hp", 
                "description" => "Spectre convertible laptops, all-in-one PCs, and precision computing systems", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "ASUS", 
                "slug" => "asus", 
                "description" => "ROG gaming laptops, custom PC rigs, motherboards, and graphics cards", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Anker", 
                "slug" => "anker", 
                "description" => "Innovative charging technology, power banks, and electronic device accessories", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Tibeb Heritage Arts", 
                "slug" => "tibeb-heritage-arts", 
                "description" => "Authentic handmade Ethiopian string art drawings, cross canvases, and traditional thread crafts", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Habesha Crafts Guild", 
                "slug" => "habesha-crafts-guild", 
                "description" => "Traditional woven Habesha Sefed straw plates, cultural wall art, and heritage textiles", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Jebena Pottery Studio", 
                "slug" => "jebena-pottery-studio", 
                "description" => "Authentic black clay Jebena pots, Ethiopian coffee ceremony accessories, and pottery", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
            [
                "name" => "Entoto Artisan Workshop", 
                "slug" => "entoto-artisan-workshop", 
                "description" => "Hand-carved wooden incense burners, organic straw Sefed crafts, and Ethiopian artifacts", 
                "logo" => "/image/placeholder.png", 
                "is_active" => true
            ],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                $brand
            );
        }
    }
}
