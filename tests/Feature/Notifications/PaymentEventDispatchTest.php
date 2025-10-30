<?php
uses()->group('milestone1-group1');

use App\Events\PaymentApproved;
use App\Events\PaymentCompleted;
use App\Jobs\SendAdvancePaymentApprovedEmail;
use App\Jobs\SendAdvancePaymentConfirmationEmail;
use App\Jobs\SendPaymentApprovedEmail;
use App\Jobs\SendPaymentConfirmationEmail;
use App\Models\Order;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Log;
use App\Listeners\SendPaymentNotifications;

it('does not dispatch customer email on gateway payment completed (awaits admin approval)', function () {

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
        'tx_ref' => 'CHK-123',
        'order_id' => $order->id,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
    ]);

    Log::info('[TEST] Listener.handle for PaymentCompleted checkout');
    Queue::fake();
    (new SendPaymentNotifications())->handle(new PaymentCompleted($payment, 'checkout'));
    Queue::assertNotPushed(SendPaymentConfirmationEmail::class);
});

it('does not dispatch customer email on advance payment completed (awaits admin approval)', function () {

    $user = User::factory()->create();
    $productRequest = ProductRequest::create([
        'user_id' => $user->id,
        'product_name' => 'Test Product',
        'description' => 'desc',
        'status' => 'pending',
    ]);
    $payment = PaymentTransaction::create([
        'tx_ref' => 'ADV-123',
        'product_request_id' => $productRequest->id,
        'amount' => 50,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
    ]);

    // Link productRequest lazily not required by job construction; listener checks relation
    Log::info('[TEST] Listener.handle for PaymentCompleted advance');
    Queue::fake();
    (new SendPaymentNotifications())->handle(new PaymentCompleted($payment, 'advance'));
    Queue::assertNotPushed(SendAdvancePaymentConfirmationEmail::class);
});

it('dispatches checkout approved job on admin approval', function () {

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
        'tx_ref' => 'CHK-AP-1',
        'order_id' => $order->id,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
        'admin_status' => 'approved',
    ]);

    Log::info('[TEST] Listener.handle for PaymentApproved checkout');
    Queue::fake();
    (new SendPaymentNotifications())->handle(new PaymentApproved($payment, 'checkout'));
    Queue::assertPushed(SendPaymentApprovedEmail::class);
});

it('dispatches advance approved job on admin approval', function () {

    $user = User::factory()->create();
    $productRequest = ProductRequest::create([
        'user_id' => $user->id,
        'product_name' => 'Test Product',
        'description' => 'desc',
        'status' => 'pending',
    ]);
    $payment = PaymentTransaction::create([
        'tx_ref' => 'ADV-AP-1',
        'product_request_id' => $productRequest->id,
        'amount' => 50,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
        'admin_status' => 'approved',
    ]);

    Log::info('[TEST] Listener.handle for PaymentApproved advance');
    Queue::fake();
    (new SendPaymentNotifications())->handle(new PaymentApproved($payment, 'advance'));
    Queue::assertPushed(SendAdvancePaymentApprovedEmail::class);
});


