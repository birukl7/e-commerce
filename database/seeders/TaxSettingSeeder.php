<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaxSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the standard tax class
        $standardClass = \App\Models\TaxClass::where('slug', 'standard')->first();
        $reducedClass = \App\Models\TaxClass::where('slug', 'reduced')->first();
        $zeroClass = \App\Models\TaxClass::where('slug', 'zero')->first();
        $exemptClass = \App\Models\TaxClass::where('slug', 'exempt')->first();

        $taxRates = [
            // Standard VAT rates
            [
                'name' => 'Standard VAT',
                'type' => 'percentage',
                'rate' => 15.0,
                'description' => 'Standard VAT rate for Ethiopia',
                'is_active' => true,
                'country' => 'ET',
                'tax_class_id' => $standardClass->id,
                'shipping_taxable' => true,
                'compound' => false,
                'priority' => 1,
            ],
            
            // Reduced rate for essential goods
            [
                'name' => 'Reduced Rate',
                'type' => 'percentage',
                'rate' => 5.0,
                'description' => 'Reduced rate for essential goods',
                'is_active' => true,
                'country' => 'ET',
                'tax_class_id' => $reducedClass->id,
                'shipping_taxable' => false,
                'compound' => false,
                'priority' => 2,
            ],
            
            // Zero rate for basic food items
            [
                'name' => 'Zero Rate',
                'type' => 'percentage',
                'rate' => 0.0,
                'description' => 'Zero rate for basic food items',
                'is_active' => true,
                'country' => 'ET',
                'tax_class_id' => $zeroClass->id,
                'shipping_taxable' => false,
                'compound' => false,
                'priority' => 3,
            ],
            
            // Exempt for specific items
            [
                'name' => 'Exempt',
                'type' => 'percentage',
                'rate' => 0.0,
                'description' => 'Tax exempt items',
                'is_active' => true,
                'country' => 'ET',
                'tax_class_id' => $exemptClass->id,
                'shipping_taxable' => false,
                'compound' => false,
                'priority' => 4,
            ],
        ];

        foreach ($taxRates as $rate) {
            \App\Models\TaxSetting::updateOrCreate(
                ['name' => $rate['name'], 'country' => $rate['country']],
                $rate
            );
        }
    }
}
