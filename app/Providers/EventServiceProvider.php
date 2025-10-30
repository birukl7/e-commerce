<?php

namespace App\Providers;

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Listeners\SendPaymentNotifications;
use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use App\Listeners\SendOrderNotifications;
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
        OrderCreated::class => [
            SendOrderNotifications::class,
        ],
        OrderStatusChanged::class => [
            SendOrderNotifications::class,
        ],
        ShipmentCreated::class => [
            SendOrderNotifications::class,
        ],
    ];
}


