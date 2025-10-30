<?php
uses()->group('milestone2-group3');

use App\Mail\OrderConfirmation;
use App\Mail\AdvanceOrderConfirmation as AdvanceOrderConfirmationMail;
use App\Mail\OrderStatusUpdate as OrderStatusUpdateMail;
use App\Mail\ShipmentCreated as ShipmentCreatedMail;
use App\Models\Order;
use App\Models\ProductRequest;
use App\Models\User;

it('renders OrderConfirmation email', function () {
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
    $html = (new OrderConfirmation($order))->render();
    expect($html)->toContain('Order Confirmation')->toContain((string)$order->id);
});

it('renders AdvanceOrderConfirmation email', function () {
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
    $html = (new AdvanceOrderConfirmationMail($order))->render();
    expect($html)->toContain('order #')->toContain((string)$order->id);
});

it('renders OrderStatusUpdate email', function () {
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
    $html = (new OrderStatusUpdateMail($order, 'shipped', 'Your order status has been updated.'))->render();
    expect($html)->toContain('status')->toContain('updated');
});

it('renders ShipmentCreated email', function () {
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
    $html = (new ShipmentCreatedMail($order, 'TRACK-123'))->render();
    expect($html)->toContain('has been shipped')->toContain('TRACK-123');
});


