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
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderNotifications implements ShouldQueue
{
    use InteractsWithQueue, SerializesModels;
    
    public $queue = 'default';
    
    public function handle($event): void
    {
        try {
            Log::info('[SendOrderNotifications] Listener triggered', [
                'event_type' => get_class($event),
                'event_data' => $this->getEventData($event),
            ]);
            
            if ($event instanceof OrderCreated) {
                if (!$this->reserveOutboxKey($this->makeKey('order_created', $event->order->id), get_class($event))) {
                    Log::info('[SendOrderNotifications] Duplicate outbox key, skipping', [
                        'order_id' => $event->order->id,
                    ]);
                    return;
                }
                $order = $event->order;
                $user = $order->user ?? null;
                if ($order && $user) {
                    Log::info('[SendOrderNotifications] Dispatching SendOrderConfirmationEmail', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number ?? null,
                        'user_email' => $user->email ?? null,
                    ]);
                    
                    SendOrderConfirmationEmail::dispatch($order)
                        ->onQueue('emails');
                } else {
                    Log::warning('[SendOrderNotifications] Missing order or user', [
                        'order_id' => $order->id ?? null,
                        'has_user' => !is_null($user),
                    ]);
                }
                return;
            }

            if ($event instanceof OrderStatusChanged) {
                if (!$this->reserveOutboxKey($this->makeKey('order_status', $event->order->id, $event->newStatus), get_class($event))) {
                    Log::info('[SendOrderNotifications] Duplicate outbox key, skipping', [
                        'order_id' => $event->order->id,
                        'new_status' => $event->newStatus,
                    ]);
                    return;
                }
                $order = $event->order;
                $user = $order->user ?? null;
                if ($order && $user) {
                    Log::info('[SendOrderNotifications] Dispatching SendOrderStatusUpdateEmail', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number ?? null,
                        'new_status' => $event->newStatus,
                        'user_email' => $user->email ?? null,
                    ]);
                    
                    SendOrderStatusUpdateEmail::dispatch($order, $event->newStatus, 'Your order status has been updated.')
                        ->onQueue('emails');
                } else {
                    Log::warning('[SendOrderNotifications] Missing order or user for status change', [
                        'order_id' => $order->id ?? null,
                        'has_user' => !is_null($user),
                    ]);
                }
                return;
            }

            if ($event instanceof ShipmentCreated) {
                if (!$this->reserveOutboxKey($this->makeKey('shipment_created', $event->order->id), get_class($event))) {
                    Log::info('[SendOrderNotifications] Duplicate outbox key, skipping', [
                        'order_id' => $event->order->id,
                    ]);
                    return;
                }
                $order = $event->order;
                $user = $order->user ?? null;
                if ($order && $user) {
                    Log::info('[SendOrderNotifications] Dispatching SendShipmentCreatedEmail', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number ?? null,
                        'tracking_number' => $event->trackingNumber ?? null,
                        'user_email' => $user->email ?? null,
                    ]);
                    
                    SendShipmentCreatedEmail::dispatch($order, $user, $event->trackingNumber ?? '')
                        ->onQueue('emails');
                } else {
                    Log::warning('[SendOrderNotifications] Missing order or user for shipment', [
                        'order_id' => $order->id ?? null,
                        'has_user' => !is_null($user),
                    ]);
                }
                return;
            }

            if ($event instanceof OrderCreatedFromAdvance) {
                if (!$this->reserveOutboxKey($this->makeKey('order_created_from_advance', $event->order->id), get_class($event))) {
                    Log::info('[SendOrderNotifications] Duplicate outbox key, skipping', [
                        'order_id' => $event->order->id,
                    ]);
                    return;
                }
                $order = $event->order;
                $user = $order->user ?? null;
                if ($order && $user) {
                    Log::info('[SendOrderNotifications] Dispatching SendAdvanceOrderConfirmationEmail', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number ?? null,
                        'user_email' => $user->email ?? null,
                    ]);
                    
                    SendAdvanceOrderConfirmationEmail::dispatch($order, $user)
                        ->onQueue('emails');
                } else {
                    Log::warning('[SendOrderNotifications] Missing order or user for advance order', [
                        'order_id' => $order->id ?? null,
                        'has_user' => !is_null($user),
                    ]);
                }
                return;
            }
            
            Log::warning('[SendOrderNotifications] Unhandled event type', [
                'event_type' => get_class($event),
            ]);
        } catch (\Throwable $e) {
            Log::error('[SendOrderNotifications] Error processing event', [
                'event_type' => get_class($event),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Re-throw to mark job as failed
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
            Log::debug('[SendOrderNotifications] Outbox key reservation failed (likely duplicate)', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    private function getEventData($event): array
    {
        if ($event instanceof OrderCreated || $event instanceof OrderCreatedFromAdvance) {
            return ['order_id' => $event->order->id ?? null];
        }
        if ($event instanceof OrderStatusChanged) {
            return [
                'order_id' => $event->order->id ?? null,
                'old_status' => $event->oldStatus ?? null,
                'new_status' => $event->newStatus ?? null,
            ];
        }
        if ($event instanceof ShipmentCreated) {
            return [
                'order_id' => $event->order->id ?? null,
                'tracking_number' => $event->trackingNumber ?? null,
            ];
        }
        return [];
    }
}


