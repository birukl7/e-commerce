<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Events\OrderCreatedFromAdvance;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use App\Jobs\SendAdvanceOrderConfirmationEmail;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendShipmentCreatedEmail;
use App\Models\NotificationOutbox;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

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
                Log::info('[SendOrderNotifications] Dispatching SendOrderConfirmationEmail', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number ?? null,
                ]);
                
                SendOrderConfirmationEmail::dispatch($order)
                    ->onQueue('emails');
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
                Log::info('[SendOrderNotifications] Dispatching SendOrderStatusUpdateEmail', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number ?? null,
                    'new_status' => $event->newStatus,
                ]);
                
                SendOrderStatusUpdateEmail::dispatch($order, $event->newStatus, 'Your order status has been updated.')
                    ->onQueue('emails');
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
                Log::info('[SendOrderNotifications] Dispatching SendShipmentCreatedEmail', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number ?? null,
                    'tracking_number' => $event->trackingNumber,
                ]);
                
                SendShipmentCreatedEmail::dispatch($order, $user, $event->trackingNumber)
                    ->onQueue('emails');
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
                Log::info('[SendOrderNotifications] Dispatching SendAdvanceOrderConfirmationEmail', [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number ?? null,
                ]);
                
                SendAdvanceOrderConfirmationEmail::dispatch($order, $user)
                    ->onQueue('emails');
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


