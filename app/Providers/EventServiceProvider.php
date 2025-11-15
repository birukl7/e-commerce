<?php

namespace App\Providers;

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Listeners\SendPaymentNotifications;
use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use App\Listeners\SendOrderNotifications;
use App\Events\OrderCreatedFromAdvance;
use App\Events\ProductRequestCreated;
use App\Events\ProductRequestStatusChanged;
use App\Listeners\SendProductRequestNotifications;
use App\Listeners\LogSentMail;
use Illuminate\Mail\Events\MessageSent;
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
        PaymentFailed::class => [
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
        OrderCreatedFromAdvance::class => [
            SendOrderNotifications::class,
        ],
        ProductRequestCreated::class => [
            SendProductRequestNotifications::class,
        ],
        ProductRequestStatusChanged::class => [
            SendProductRequestNotifications::class,
        ],
        MessageSent::class => [
            LogSentMail::class,
        ],
    ];
}


