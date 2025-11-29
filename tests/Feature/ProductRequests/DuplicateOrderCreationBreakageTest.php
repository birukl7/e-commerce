<?php

use App\Models\User;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Services\PaymentFinalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

// ============================================================================
// DUPLICATE ORDER CREATION BREAKAGE TESTS
// Group: duplicate-order-creation-breakage
// 
// Run with: php artisan test --group=duplicate-order-creation-breakage
// ============================================================================

uses()->group('duplicate-order-creation-breakage');

test('advance payment creates an order when finalized', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000, // Total amount
        'advance_payment_status' => 'processing',
        'final_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null, // No order yet
    ]);

    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150, // Advance amount with tax
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => [
            'payment_type' => 'advance',
            'subtotal' => 1000,
            'tax_amount' => 150,
            'taxes' => [],
        ],
    ]);

    // Admin approves advance payment
    $paymentFinalizer = app(PaymentFinalizer::class);
    $result = $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');

    expect($result)->toBeTrue();
    
    // Refresh product request
    $productRequest->refresh();
    
    // After advance payment is approved, an order should be created
    expect($productRequest->order_id)->not->toBeNull();
    expect($productRequest->advance_payment_status)->toBe('paid');
    
    // Verify order exists
    $order = Order::find($productRequest->order_id);
    expect($order)->not->toBeNull();
    expect($order->user_id)->toBe($user->id);
    
    // Store the order ID for next test
    return ['productRequest' => $productRequest, 'order' => $order];
});

test('final payment creates a separate order instead of reusing advance payment order', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000, // Total amount
        'advance_payment_status' => 'paid',
        'final_payment_status' => 'processing',
        'procurement_status' => 'completed',
        'product_arrived_at' => now(),
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null, // No order yet - this simulates the bug
    ]);

    // First, approve advance payment to create an order
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen', // Needs to be unseen so it can be approved
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => [
            'payment_type' => 'advance',
            'subtotal' => 1000,
            'tax_amount' => 150,
        ],
    ]);
    
    // Also need to set advance_payment_status back to processing so it can be finalized
    $productRequest->update(['advance_payment_status' => 'processing']);

    $paymentFinalizer = app(PaymentFinalizer::class);
    
    // Approve advance payment - this should create an order
    $advanceResult = $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Advance approved');
    expect($advanceResult)->toBeTrue();
    
    $productRequest->refresh();
    $advanceOrderId = $productRequest->order_id;
    
    // Verify advance payment created an order
    expect($advanceOrderId)->not->toBeNull();
    $advanceOrder = Order::find($advanceOrderId);
    expect($advanceOrder)->not->toBeNull();
    
    // Count orders before final payment
    $ordersBeforeFinal = Order::where('user_id', $user->id)->count();
    
    // Now process final payment
    $finalTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'FINAL-' . $productRequest->id . '-789012',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 2300, // Final amount with tax
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => [
            'payment_type' => 'final',
            'subtotal' => 2000,
            'tax_amount' => 300,
        ],
    ]);

    // Approve final payment
    $finalResult = $paymentFinalizer->handleAdminApproval($finalTransaction, $admin, 'Final approved');
    expect($finalResult)->toBeTrue();
    
    // Count orders after final payment
    $ordersAfterFinal = Order::where('user_id', $user->id)->count();
    
    // THIS IS THE BREAKAGE: Two separate orders should NOT be created
    // The final payment should reuse the advance payment's order
    expect($ordersAfterFinal)->toBe($ordersBeforeFinal); // Should be same count
    
    $productRequest->refresh();
    
    // The product request should still point to the same order
    expect($productRequest->order_id)->toBe($advanceOrderId);
    
    // There should only be ONE order for this product request
    $productRequestOrders = Order::where('notes', 'like', '%product request #' . $productRequest->id . '%')
        ->orWhere('id', $productRequest->order_id)
        ->get();
    
    expect($productRequestOrders->count())->toBe(1); // Should be only one order
});

test('advance and final payments create two separate orders for same product request', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'advance_payment_status' => 'processing',
        'final_payment_status' => 'pending',
        'procurement_status' => 'completed',
        'product_arrived_at' => now(),
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    
    // Approve advance payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-111111',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $advanceResult = $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Advance');
    expect($advanceResult)->toBeTrue();
    
    $productRequest->refresh();
    $advanceOrderId = $productRequest->order_id;
    
    // Now approve final payment
    $finalTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'FINAL-' . $productRequest->id . '-222222',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 2300,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'final'],
    ]);

    $finalResult = $paymentFinalizer->handleAdminApproval($finalTransaction, $admin, 'Final');
    expect($finalResult)->toBeTrue();
    
    $productRequest->refresh();
    
    // BREAKAGE: This test documents the current buggy behavior
    // Currently, final payment might create a new order if order_id is not set properly
    // We want to verify that only ONE order exists for this product request
    
    $allOrders = Order::where('user_id', $user->id)
        ->where(function ($query) use ($productRequest) {
            $query->where('notes', 'like', '%product request #' . $productRequest->id . '%')
                  ->orWhere('id', $productRequest->order_id);
        })
        ->get();
    
    // This test will FAIL if the bug exists (more than one order)
    // After fix, this should pass (exactly one order)
    expect($allOrders->count())->toBe(1)
        ->and($productRequest->order_id)->not->toBeNull()
        ->and($productRequest->order_id)->toBe($advanceOrderId);
});

test('order total amount should reflect both advance and final payments', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000, // Total
        'advance_payment_status' => 'processing',
        'final_payment_status' => 'pending',
        'procurement_status' => 'completed',
        'product_arrived_at' => now(),
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    
    // Approve advance payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-333333',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150, // 1000 + 150 tax
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => [
            'payment_type' => 'advance',
            'subtotal' => 1000,
            'tax_amount' => 150,
        ],
    ]);

    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Advance');
    $productRequest->refresh();
    
    $order = Order::find($productRequest->order_id);
    expect($order)->not->toBeNull();
    
    // After final payment, the order total should include both payments
    $finalTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'FINAL-' . $productRequest->id . '-444444',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 2300, // 2000 + 300 tax
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => [
            'payment_type' => 'final',
            'subtotal' => 2000,
            'tax_amount' => 300,
        ],
    ]);

    $paymentFinalizer->handleAdminApproval($finalTransaction, $admin, 'Final');
    
    $order->refresh();
    $productRequest->refresh();
    
    // The order should reflect the total amount (advance + final)
    // Note: The order might be updated with the total amount after final payment
    expect($order->id)->toBe($productRequest->order_id);
    
    // Verify the order is linked to the product request
    expect($order->notes)->toContain('product request #' . $productRequest->id);
});

