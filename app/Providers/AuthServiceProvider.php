<?php

namespace App\Providers;

use App\Models\OutOfStockNotification;
use App\Models\TaxSetting;
use App\Models\TaxClass;
use App\Policies\OutOfStockNotificationPolicy;
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
        TaxSetting::class => TaxSettingPolicy::class,
        TaxClass::class => TaxClassPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
