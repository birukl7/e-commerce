<?php
uses()->group('milestone1-group2');

use App\Events\PaymentApproved;
use App\Listeners\SendPaymentNotifications;
use App\Jobs\SendPaymentApprovedEmail;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('queues only once for duplicate admin approval events (idempotent)', function () {
    Queue::fake();

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

    $payment = PaymentTransaction::create([
        'tx_ref' => 'CHK-DEDUP-1',
        'order_id' => $order->id,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
        'admin_status' => 'approved',
    ]);

    $listener = new SendPaymentNotifications();
    $event = new PaymentApproved($payment, 'checkout');

    $listener->handle($event);
    $listener->handle($event); // second time should no-op due to outbox

    $count = Queue::pushed(SendPaymentApprovedEmail::class)->count();
    expect($count)->toBe(1);
});


