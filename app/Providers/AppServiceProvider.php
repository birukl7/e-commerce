<?php

namespace App\Providers;

use App\Services\SiteConfigService;
use App\Services\AdminMenuService;
use App\Services\NotificationService;
use App\Models\OutOfStockNotification;
use App\Models\Product;
use App\Models\TaxSetting;
use App\Observers\ProductObserver;
use App\Policies\OutOfStockNotificationPolicy;
use App\Policies\TaxSettingPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Event;
use App\Events\PaymentCompleted;
use App\Events\PaymentApproved;
use App\Listeners\SendPaymentNotifications;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register SiteConfigService as singleton
        $this->app->singleton(SiteConfigService::class);
        
        // Register AdminMenuService as singleton
        $this->app->singleton(AdminMenuService::class);
        
        // Register NotificationService as singleton
        $this->app->singleton(NotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(OutOfStockNotification::class, OutOfStockNotificationPolicy::class);
        Gate::policy(TaxSetting::class, TaxSettingPolicy::class);
        
        // Register observers
        Product::observe(ProductObserver::class);

        // Event listeners
        Event::listen(PaymentCompleted::class, [SendPaymentNotifications::class, 'handle']);
        Event::listen(PaymentApproved::class, [SendPaymentNotifications::class, 'handle']);
    }
}