<?php

namespace App\Providers;

use App\Services\SiteConfigService;
use App\Services\AdminMenuService;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}