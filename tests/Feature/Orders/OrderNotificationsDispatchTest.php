<?php
uses()->group('milestone2-group2');

use App\Events\OrderCreated;
use App\Events\OrderStatusChanged;
use App\Events\ShipmentCreated;
use App\Listeners\SendOrderNotifications;
use App\Jobs\SendOrderConfirmationEmail;
use App\Jobs\SendOrderStatusUpdateEmail;
use App\Jobs\SendShipmentCreatedEmail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Queue::fake();
});

it('queues order confirmation on OrderCreated', function () {
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

    (new SendOrderNotifications())->handle(new OrderCreated($order));

    Queue::assertPushed(SendOrderConfirmationEmail::class);
});

it('queues status update on OrderStatusChanged', function () {
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

    (new SendOrderNotifications())->handle(new OrderStatusChanged($order, 'processing', 'shipped'));

    Queue::assertPushed(SendOrderStatusUpdateEmail::class);
});

it('queues shipment email on ShipmentCreated', function () {
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

    (new SendOrderNotifications())->handle(new ShipmentCreated($order, 'TRACK-123'));

    Queue::assertPushed(SendShipmentCreatedEmail::class);
});


