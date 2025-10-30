<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Events\OrderCreatedFromAdvance;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendShipmentCreatedEmail;
use App\Jobs\SendAdvanceOrderConfirmationEmail;
use App\Models\NotificationOutbox;

class SendOrderNotifications implements ShouldQueue
{
    public function handle($event): void
    {
        if ($event instanceof OrderCreated) {
            if (!$this->reserveOutboxKey($this->makeKey('order_created', $event->order->id), get_class($event))) {
                return;
            }
            $order = $event->order;
            $user = $order->user;
            if ($order && $user) {
                Queue::push(new SendOrderConfirmationEmail($order));
            }
            return;
        }

        if ($event instanceof OrderStatusChanged) {
            if (!$this->reserveOutboxKey($this->makeKey('order_status', $event->order->id, $event->newStatus), get_class($event))) {
                return;
            }
            $order = $event->order;
            $user = $order->user;
            if ($order && $user) {
                Queue::push(new SendOrderStatusUpdateEmail($order, $event->newStatus, 'Your order status has been updated.'));
            }
            return;
        }

        if ($event instanceof ShipmentCreated) {
            if (!$this->reserveOutboxKey($this->makeKey('shipment_created', $event->order->id), get_class($event))) {
                return;
            }
            $order = $event->order;
            $user = $order->user;
            if ($order && $user) {
                Queue::push(new SendShipmentCreatedEmail($order, $user, $event->trackingNumber));
            }
            return;
        }

        if ($event instanceof OrderCreatedFromAdvance) {
            if (!$this->reserveOutboxKey($this->makeKey('order_created_from_advance', $event->order->id), get_class($event))) {
                return;
            }
            $order = $event->order;
            $user = $order->user;
            if ($order && $user) {
                Queue::push(new SendAdvanceOrderConfirmationEmail($order, $user));
            }
            return;
        }
    }

    private function makeKey(string $type, int $orderId, ?string $suffix = null): string
    {
        return $suffix ? "order:{$orderId}:{$type}:{$suffix}" : "order:{$orderId}:{$type}";
    }

    private function reserveOutboxKey(string $key, string $eventType): bool
    {
        try {
            NotificationOutbox::create([
                'key' => $key,
                'event_type' => $eventType,
                'model_type' => \App\Models\Order::class,
                'model_id' => (int) (explode(':', $key)[1] ?? 0),
                'recipient' => null,
            ]);
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }
}


