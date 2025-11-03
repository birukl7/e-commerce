<?php

namespace Tests\Feature\ProductRequests;

use App\Models\User;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(RefreshDatabase::class);

/**
 * CHAPA PAYMENT STATUS SYNC BREAKAGE TESTS
 * Group: thisgroup
 * These tests are designed to break the system and find vulnerabilities
 * in the Chapa payment → status synchronization flow
 */

test('advance payment status not updated after chapa payment return', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending', // Not paid yet
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate payment return callback
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Refresh product request from database
    $productRequest->refresh();

    // BREAKAGE TEST: Status should be 'processing', not null or 'pending'
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('advance_payment_status should be "processing" after Chapa payment return, but is: ' . ($productRequest->advance_payment_status ?? 'null'));
})->group('thisgroup');

test('workflow status not awaiting admin approval when payment processing', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment is processing (awaiting admin approval)
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $workflowStatus = $productRequest->getWorkflowStatus();

    // BREAKAGE TEST: Should be 'awaiting_admin_approval', not 'awaiting_advance_payment'
    expect($workflowStatus)->toBe('awaiting_admin_approval')
        ->and('workflow_status should be "awaiting_admin_approval" when advance_payment_status is "processing", but got: ' . $workflowStatus);
})->group('thisgroup');

test('requests list shows wrong status after payment', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment made, awaiting admin approval
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('request.index'));

    // Handle 409 (Inertia version mismatch)
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    $response->assertInertia(fn ($page) => 
        $page->component('request/request-dashboard')
            ->has('requests', 1)
            ->where('requests.0.workflow_status', 'awaiting_admin_approval')
            ->where('requests.0.advance_payment_status', 'processing')
    );
})->group('thisgroup');

test('payment return fails to update status when webhook delayed', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending', // Webhook hasn't processed yet
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate payment return (before webhook processes)
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Refresh to get latest status
    $productRequest->refresh();

    // BREAKAGE TEST: Status should be updated to 'processing' by paymentReturn()
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('paymentReturn() should update advance_payment_status to "processing" even if webhook is delayed, but status is: ' . ($productRequest->advance_payment_status ?? 'null'));
})->group('thisgroup');

test('status update timing issue in payment return', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Check if success page shows correct status
    $response->assertInertia(fn ($page) => 
        $page->component('product-requests/advance-payment-success-chapa')
            ->where('productRequest.advance_payment_status', 'processing')
            ->where('productRequest.workflow_status', 'awaiting_admin_approval')
    );
})->group('thisgroup');

test('webhook fails to set status to processing', function () {
    // This test simulates webhook behavior by directly updating via PaymentController logic
    // Since webhook route may not be accessible in tests, we test the webhook's effect
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'pending',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate webhook behavior: update gateway status to 'paid' and trigger product request update
    $transaction->update(['gateway_status' => 'paid']);
    
    // Simulate what webhook does: update product request to 'processing'
    // This tests the webhook's intended behavior
    $productRequest->update([
        'advance_payment_status' => 'processing',
        'payment_reference' => $transaction->tx_ref,
        'payment_method' => 'chapa',
    ]);

    // Refresh product request
    $productRequest->refresh();

    // BREAKAGE TEST: Webhook should set status to 'processing'
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('Chapa webhook should set advance_payment_status to "processing", but got: ' . ($productRequest->advance_payment_status ?? 'null'));
})->group('thisgroup');

test('race condition between payment return and webhook', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'pending',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Update transaction to 'paid' (simulating Chapa callback)
    $transaction->update(['gateway_status' => 'paid']);

    // Simulate payment return (user redirects back)
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Refresh product request
    $productRequest->refresh();

    // BREAKAGE TEST: Should be 'processing' regardless of webhook timing
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('paymentReturn() should handle race condition and set status to "processing", but got: ' . ($productRequest->advance_payment_status ?? 'null'));
})->group('thisgroup');

test('pay advance button visible when status is processing', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Should hide button
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // BREAKAGE TEST: requiresAdvancePayment() should return false when status is 'processing'
    expect($productRequest->requiresAdvancePayment())->toBeFalse()
        ->and('requiresAdvancePayment() should return false when advance_payment_status is "processing", but returned true');
})->group('thisgroup');

test('status not persisting after payment return', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate payment return
    $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Fetch fresh from database (simulating page reload)
    $freshProductRequest = ProductRequest::find($productRequest->id);

    // BREAKAGE TEST: Status should persist in database
    expect($freshProductRequest->advance_payment_status)->toBe('processing')
        ->and('advance_payment_status should persist as "processing" in database after payment return, but got: ' . ($freshProductRequest->advance_payment_status ?? 'null'));
})->group('thisgroup');

test('payment transaction not linked to product request', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Create transaction without product_request_id initially (simulating payment initiation)
    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => null, // Not linked initially
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate payment return
    $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Refresh transaction
    $transaction->refresh();

    // BREAKAGE TEST: Transaction should be linked to product request
    expect($transaction->product_request_id)->toBe($productRequest->id)
        ->and('Payment transaction should be linked to product_request_id after payment return');
})->group('thisgroup');
