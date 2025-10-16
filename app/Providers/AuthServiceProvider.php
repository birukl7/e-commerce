<?php

namespace App\Providers;

use App\Models\OutOfStockNotification;
use App\Models\ProductRequest;
use App\Models\TaxSetting;
use App\Models\TaxClass;
use App\Policies\OutOfStockNotificationPolicy;
use App\Policies\ProductRequestPolicy;
use App\Policies\TaxSettingPolicy;
use App\Policies\TaxClassPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        OutOfStockNotification::class => OutOfStockNotificationPolicy::class,
        ProductRequest::class => ProductRequestPolicy::class,
        TaxSetting::class => TaxSettingPolicy::class,
        TaxClass::class => TaxClassPolicy::class,
        \App\Models\Product::class => \App\Policies\SupplierProductPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
