<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaxClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = [
            [
                'name' => 'Standard',
                'slug' => 'standard',
                'description' => 'Standard tax rate for most products',
                'is_active' => true,
                'is_default' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Reduced',
                'slug' => 'reduced',
                'description' => 'Reduced tax rate for essential goods',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Zero',
                'slug' => 'zero',
                'description' => 'Zero-rated items',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Exempt',
                'slug' => 'exempt',
                'description' => 'Tax-exempt items',
                'is_active' => true,
                'is_default' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($classes as $class) {
            \App\Models\TaxClass::updateOrCreate(
                ['slug' => $class['slug']],
                $class
            );
        }
    }
}
