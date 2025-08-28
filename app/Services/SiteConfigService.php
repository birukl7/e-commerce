<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SiteConfigService
{
    private const CACHE_KEY = 'site_config_settings';
    private const CACHE_TTL = 3600; // 1 hour

    private array $settings = [];
    private bool $loaded = false;

    public function __construct()
    {
        $this->loadSettings();
    }

    private function loadSettings(): void
    {
        if ($this->loaded) {
            return;
        }

        $this->settings = Cache::remember(
            self::CACHE_KEY,
            self::CACHE_TTL,
            fn() => Setting::autoloaded()
                ->get()
                ->pluck('value', 'key')
                ->toArray()
        );

        $this->loaded = true;
    }

    public function get(string $key, $default = null)
    {
        return $this->settings[$key] ?? $default;
    }

    public function set(string $key, $value, string $type = 'string', string $group = 'general'): void
    {
        Setting::set($key, $value, $type, $group);
        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        $this->settings = [];
        $this->loaded = false;
        $this->loadSettings();
    }

    // Payment Configuration Methods
    public function getEnabledPaymentMethods(): array
    {
        $methods = $this->get('payments.methods', '["chapa","paypal"]');
        return is_string($methods) ? json_decode($methods, true) : $methods;
    }

    public function isManualPaymentEnabled(): bool
    {
        return (bool) $this->get('payments.manual.enabled', false);
    }

    public function requiresAdminApproval(): bool
    {
        return (bool) $this->get('payments.require_admin_approval', true);
    }

    public function getTaxRate(): float
    {
        return (float) $this->get('payments.tax_rate', 0.15);
    }

    public function shouldAutoApproveGatewayPayments(): bool
    {
        return (bool) $this->get('payments.auto_approve_if_gateway_paid', true);
    }

    // UI Configuration Methods
    public function getSalesSidebarGroup(): string
    {
        return $this->get('ui.sales_sidebar_group', 'Sales');
    }

    public function getAdminMenuGroups(): array
    {
        $groups = $this->get('admin.menu.groups', '["Dashboard","Sales","Content","Settings"]');
        return is_string($groups) ? json_decode($groups, true) : $groups;
    }

    // Grouped settings for admin interface
    public function getGroupedSettings(): array
    {
        return Setting::all()
            ->groupBy('group')
            ->map(function ($settings) {
                return $settings->map(function ($setting) {
                    return [
                        'key' => $setting->key,
                        'value' => $setting->getTypedValue(),
                        'type' => $setting->type,
                        'description' => $setting->description,
                        'autoload' => $setting->autoload,
                    ];
                });
            })
            ->toArray();
    }
}