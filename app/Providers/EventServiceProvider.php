<?php

namespace App\Providers;

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Listeners\SendPaymentNotifications;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PaymentCompleted::class => [
            SendPaymentNotifications::class,
        ],
        PaymentApproved::class => [
            SendPaymentNotifications::class,
        ],
    ];
}


