<?php
uses()->group('milestone1-group1');

use App\Events\PaymentCompleted;
use App\Listeners\SendPaymentNotifications;
use App\Models\NotificationOutbox;
use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('reserves outbox key once to ensure idempotency', function () {
    Queue::fake();

    $listener = new SendPaymentNotifications();

    $user = User::factory()->create();
    $payment = PaymentTransaction::create([
        'tx_ref' => 'CHK-UNIQ-1',
        'amount' => 10,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
    ]);

    // First handle should create outbox record and dispatch a job
    $listener->handle(new PaymentCompleted($payment, 'checkout'));
    expect(NotificationOutbox::where('key', 'payment:CHK-UNIQ-1:completed:checkout')->exists())->toBeTrue();

    // Second handle should be a no-op due to unique key
    $listener->handle(new PaymentCompleted($payment, 'checkout'));

    // Only one outbox row
    expect(NotificationOutbox::where('key', 'payment:CHK-UNIQ-1:completed:checkout')->count())->toBe(1);
});


