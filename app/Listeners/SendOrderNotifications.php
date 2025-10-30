<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendOrderNotifications implements ShouldQueue
{
    public function handle($event): void
    {
        // Implementation to be added in subsequent steps of Milestone 2
    }
}


