<?php
uses()->group('milestone1-group3');

use App\Mail\PaymentApproved as PaymentApprovedMail;
use App\Mail\AdvancePaymentApproved as AdvancePaymentApprovedMail;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;
use App\Models\User;

it('renders PaymentApproved email with key details', function () {
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
        'tx_ref' => 'MAIL-CHK-1',
        'order_id' => $order->id,
        'amount' => 100,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
        'admin_status' => 'approved',
    ]);

    $mailable = new PaymentApprovedMail($order, $payment);
    $html = $mailable->render();
    expect($html)
        ->toContain('Your payment for Order #')
        ->toContain((string)$order->id)
        ->toContain('USD 100.00');
});

it('renders AdvancePaymentApproved email with key details', function () {
    $user = User::factory()->create();
    $productRequest = ProductRequest::create([
        'user_id' => $user->id,
        'product_name' => 'Some Product',
        'description' => 'desc',
        'status' => 'pending',
    ]);
    $payment = PaymentTransaction::create([
        'tx_ref' => 'MAIL-ADV-1',
        'product_request_id' => $productRequest->id,
        'amount' => 50,
        'currency' => 'USD',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'payment_method' => 'chapa',
        'gateway_status' => 'paid',
        'admin_status' => 'approved',
    ]);

    $mailable = new AdvancePaymentApprovedMail($productRequest, $payment);
    $html = $mailable->render();
    expect($html)
        ->toContain('Your advance payment for Product Request #')
        ->toContain((string)$productRequest->id)
        ->toContain('USD 50.00');
});


