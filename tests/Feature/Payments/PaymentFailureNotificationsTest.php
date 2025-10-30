<?php
uses()->group('milestone2-group4');

use App\Events\PaymentFailed;
use App\Listeners\SendPaymentNotifications;
use App\Jobs\SendPaymentFailedEmail;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Queue::fake();
});

it('queues failure email on gateway failure (checkout)', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'user_id' => $user->id,
        'status' => 'processing',
        'payment_status' => 'failed',
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
        'tx_ref' => 'FAIL-CHK-1',
        'order_id' => $order->id,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'failed',
    ]);

    (new SendPaymentNotifications())->handle(new PaymentFailed($payment, 'checkout'));

    Queue::assertPushed(SendPaymentFailedEmail::class);
});

it('queues failure email on gateway failure (advance)', function () {
    $user = User::factory()->create();
    $productRequest = ProductRequest::create([
        'user_id' => $user->id,
        'product_name' => 'Test Product',
        'description' => 'desc',
        'status' => 'pending',
    ]);

    $payment = PaymentTransaction::create([
        'tx_ref' => 'FAIL-ADV-1',
        'product_request_id' => $productRequest->id,
        'amount' => 50,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'failed',
    ]);

    (new SendPaymentNotifications())->handle(new PaymentFailed($payment, 'advance'));

    Queue::assertPushed(SendPaymentFailedEmail::class);
});


