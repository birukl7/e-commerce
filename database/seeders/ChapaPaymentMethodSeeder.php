<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ChapaPaymentMethod;

class ChapaPaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            // Mobile Money Platforms
            [
                'name' => 'Telebirr',
                'code' => 'telebirr',
                'description' => 'Pay with your Telebirr mobile wallet',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'CBE Birr',
                'code' => 'cbe',
                'description' => 'Pay with Commercial Bank of Ethiopia mobile wallet',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'M-Pesa',
                'code' => 'mpesa',
                'description' => 'Pay with M-Pesa mobile money',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Awash Birr',
                'code' => 'awash',
                'description' => 'Pay with Awash Bank mobile wallet',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Ebirr',
                'code' => 'ebirr',
                'description' => 'Pay with Ebirr mobile wallet',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 5,
            ],
            
            // Ethiopian Bank Debit Cards
            [
                'name' => 'Bank of Abyssinia',
                'code' => 'boa',
                'description' => 'Pay with Bank of Abyssinia debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'name' => 'Awash International Bank',
                'code' => 'awash_bank',
                'description' => 'Pay with Awash International Bank debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 21,
            ],
            [
                'name' => 'Addis International Bank',
                'code' => 'addis_bank',
                'description' => 'Pay with Addis International Bank debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 22,
            ],
            [
                'name' => 'Hibret Bank',
                'code' => 'hibret',
                'description' => 'Pay with Hibret Bank debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 23,
            ],
            [
                'name' => 'Cooperative Bank of Oromia',
                'code' => 'cbo',
                'description' => 'Pay with Cooperative Bank of Oromia debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 24,
            ],
            [
                'name' => 'Berhan Bank',
                'code' => 'berhan',
                'description' => 'Pay with Berhan Bank debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 25,
            ],
            [
                'name' => 'Nib International Bank',
                'code' => 'nib',
                'description' => 'Pay with Nib International Bank debit card',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 26,
            ],
        ];

        foreach ($methods as $method) {
            ChapaPaymentMethod::updateOrCreate(
                ['code' => $method['code']],
                $method
            );
        }
    }
}
