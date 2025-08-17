<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\OfflinePaymentMethod;

class OfflinePaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $paymentMethods = [
            [
                'name' => 'Commercial Bank of Ethiopia',
                'type' => 'bank',
                'description' => 'Transfer money to our CBE bank account and upload the receipt',
                'instructions' => 'Please transfer the exact amount to our CBE account and upload a clear screenshot of your payment confirmation.',
                'details' => [
                    'account_name' => 'ShopHub E-commerce',
                    'account_number' => '1000123456789',
                    'bank_name' => 'Commercial Bank of Ethiopia',
                    'branch' => 'Main Branch'
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Telebirr Mobile Money',
                'type' => 'mobile',
                'description' => 'Send payment via Telebirr mobile money and upload the confirmation SMS screenshot',
                'instructions' => 'Send the exact amount to our Telebirr number and upload a screenshot of the success message.',
                'details' => [
                    'phone_number' => '+251911234567',
                    'account_name' => 'ShopHub Store',
                    'service' => 'Telebirr'
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Bank of Abyssinia',
                'type' => 'bank',
                'description' => 'Bank transfer to our Bank of Abyssinia account',
                'instructions' => 'Transfer the payment amount to our bank account and upload the bank receipt or mobile banking screenshot.',
                'details' => [
                    'account_name' => 'ShopHub Trading PLC',
                    'account_number' => '2000987654321',
                    'bank_name' => 'Bank of Abyssinia',
                    'swift_code' => 'ABYSETET'
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'HelloCash Mobile Payment',
                'type' => 'mobile',
                'description' => 'Pay using HelloCash mobile payment service',
                'instructions' => 'Send money via HelloCash to our merchant account and upload the transaction receipt.',
                'details' => [
                    'merchant_code' => 'SHOPHUB001',
                    'phone_number' => '+251911876543',
                    'service' => 'HelloCash'
                ],
                'is_active' => false, // Disabled by default
                'sort_order' => 4,
            ],
        ];

        foreach ($paymentMethods as $method) {
            OfflinePaymentMethod::updateOrCreate(
                ['name' => $method['name']],
                $method
            );
        }
    }
}
