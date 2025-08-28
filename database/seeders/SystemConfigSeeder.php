<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $systemSettings = [
            // Payment settings
            [
                'key' => 'payments.methods',
                'value' => json_encode(['chapa', 'paypal']),
                'type' => 'json',
                'group' => 'payments',
                'autoload' => true,
                'description' => 'Enabled payment methods'
            ],
            [
                'key' => 'payments.manual.enabled',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'payments',
                'autoload' => true,
                'description' => 'Allow manual payment submissions'
            ],
            [
                'key' => 'payments.require_admin_approval',
                'value' => '1',
                'type' => 'boolean', 
                'group' => 'payments',
                'autoload' => true,
                'description' => 'Require admin approval for payments'
            ],
            [
                'key' => 'payments.tax_rate',
                'value' => '0.15',
                'type' => 'decimal',
                'group' => 'payments',
                'autoload' => true,
                'description' => 'Default tax rate (15%)'
            ],
            [
                'key' => 'payments.auto_approve_if_gateway_paid',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'payments', 
                'autoload' => true,
                'description' => 'Auto-approve payments from payment gateways'
            ],
            // UI settings
            [
                'key' => 'ui.sales_sidebar_group',
                'value' => 'Sales',
                'type' => 'string',
                'group' => 'ui',
                'autoload' => true,
                'description' => 'Sidebar group name for sales-related items'
            ],
            [
                'key' => 'admin.menu.groups',
                'value' => json_encode(['Dashboard', 'Sales', 'Content', 'Settings']),
                'type' => 'json',
                'group' => 'ui',
                'autoload' => true,
                'description' => 'Available admin menu groups'
            ],
        ];

        foreach ($systemSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}