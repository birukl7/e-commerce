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
            [
                'name' => 'Telebirr',
                'code' => 'telebirr',
                'description' => 'Pay with your Telebirr mobile wallet',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'CBE',
                'code' => 'cbe',
                'description' => 'Pay with Commercial Bank of Ethiopia',
                'logo' => null,
                'is_active' => true,
                'sort_order' => 2,
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
