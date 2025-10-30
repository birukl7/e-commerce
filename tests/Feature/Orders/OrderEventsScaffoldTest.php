<?php
uses()->group('milestone2-group1');

use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use App\Models\Order;
use App\Models\User;

it('can instantiate order events (scaffold)', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'user_id' => $user->id,
        'status' => 'processing',
        'payment_status' => 'paid',
        'payment_method' => 'chapa',
        'currency' => 'USD',
        'subtotal' => 100,
        'tax_amount' => 0,
        'shipping_amount' => 0,
        'discount_amount' => 0,
        'total_amount' => 100,
        'shipping_method' => 'standard',
    ]);

    expect(new OrderCreated($order, 'checkout'))->toBeInstanceOf(OrderCreated::class);
    expect(new OrderStatusChanged($order, 'processing', 'shipped'))->toBeInstanceOf(OrderStatusChanged::class);
    expect(new ShipmentCreated($order, 'TRACK-1'))->toBeInstanceOf(ShipmentCreated::class);
});


