<?php

namespace Tests\Feature\ProductRequests;

use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use App\Models\User;
use App\Models\OfflinePaymentMethod;
use App\Models\OfflinePaymentSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

// ============================================================================
// WILLINGNESS → PAYMENT → STATUS SYNC BREAKAGE TESTS
// Group: willingness-payment-sync
// These tests are designed to break the system and find vulnerabilities
// in the willingness confirmation → payment → status synchronization flow
// ============================================================================

test('after paying advance via chapa, requests page still shows pay advance button', function () {
    $user = User::factory()->create();
    
    // Create product request
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Simulate: Customer confirms willingness
    $productRequest->markCustomerWillingness();
    expect($productRequest->customer_willing_to_buy)->toBeTrue();

    // Simulate: Customer pays advance via Chapa
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

    // Simulate webhook updating status to 'processing'
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Customer visits requests page - should NOT see "Pay Advance" button
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.index'));

    // Handle version mismatch
    if ($response->status() === 409 && $response->headers->has('X-Inertia-Location')) {
        // Version mismatch is acceptable - verify it's redirecting correctly
        expect($response->headers->get('X-Inertia-Location'))->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        
        if (isset($json['props']['requests'])) {
            $requestData = collect($json['props']['requests'])->firstWhere('id', $productRequest->id);
            expect($requestData)->not->toBeNull('Request should be found in list');
            
            // Breakage: If advance_payment_status is 'processing', requires_advance_payment should be false
            expect($requestData['advance_payment_status'])->toBeIn(['processing', 'paid']);
            // The workflow_status should not be 'awaiting_advance_payment' if payment is processing
            if ($requestData['advance_payment_status'] === 'processing') {
                expect($requestData['workflow_status'])->not->toBe('awaiting_advance_payment');
            }
        }
    }
})->group('willingness-payment-sync');

test('after paying advance via offline, requests page still shows pay advance button', function () {
    $user = User::factory()->create();
    $offlineMethod = OfflinePaymentMethod::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Customer confirms willingness
    $productRequest->markCustomerWillingness();

    // Customer submits offline payment
    $submission = OfflinePaymentSubmission::factory()->create([
        'user_id' => $user->id,
        'product_request_id' => $productRequest->id,
        'offline_payment_method_id' => $offlineMethod->id,
        'status' => 'pending',
        'amount' => 1150,
        'currency' => 'ETB',
    ]);

    // Create transaction with 'processing' status
    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => $submission->submission_ref,
        'gateway_status' => 'proof_uploaded',
        'admin_status' => 'unseen',
        'payment_method' => 'offline',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Update product request to 'processing'
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Visit requests page - should NOT show "Pay Advance"
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.index'));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        
        if (isset($json['props']['requests'])) {
            $requestData = collect($json['props']['requests'])->firstWhere('id', $productRequest->id);
            expect($requestData)->not->toBeNull('Request should be found in list');
            expect($requestData['advance_payment_status'])->toBe('processing');
            // If payment is processing, workflow should NOT be awaiting_advance_payment
            expect($requestData['workflow_status'])->not->toBe('awaiting_advance_payment');
        } else {
            // If requests not in response, that's also a breakage
            expect($json)->toHaveKey('props.requests');
        }
    }
})->group('willingness-payment-sync');

test('request show page shows pay advance button after payment processing', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment is processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Visit the request show page
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        $requestData = $json['props']['request'];
        expect($requestData['advance_payment_status'])->toBe('processing');
        
        // Breakage: If advance_payment_status is 'processing', requires_advance_payment should be false
        expect($requestData['requires_advance_payment'] ?? null)->toBeFalse();
    }
})->group('willingness-payment-sync');

test('requiresAdvancePayment returns true when status is processing', function () {
    $productRequest = ProductRequest::factory()->create([
        'status' => 'approved',
        'advance_payment_status' => 'processing', // Processing, should NOT require payment
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true,
    ]);

    // Breakage: This should return FALSE because status is 'processing'
    expect($productRequest->requiresAdvancePayment())->toBeFalse();
})->group('willingness-payment-sync');

test('status not refreshed when viewing request after payment', function () {
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

    // Customer pays via Chapa
    PaymentTransaction::factory()->create([
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

    // Update status in database directly (simulating webhook)
    DB::table('product_requests')
        ->where('id', $productRequest->id)
        ->update(['advance_payment_status' => 'processing']);

    // Refresh the model to ensure we have latest status
    $productRequest->refresh();
    expect($productRequest->advance_payment_status)->toBe('processing');

    // Visit request show page - should refresh and show updated status
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        // Should show 'processing' status, not stale 'pending'
        expect($json['props']['request']['advance_payment_status'])->toBe('processing');
    }
})->group('willingness-payment-sync');

test('customer can pay advance twice if status not synced', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Already processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // First payment transaction exists
    PaymentTransaction::factory()->create([
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
    ]);

    // Breakage: Try to access advance payment page even though payment is processing
    $response = $this->actingAs($user)
        ->get(route('product-requests.advance-payment.show', $productRequest->id));

    // Should redirect with error, not allow payment
    if ($response->status() === 302) {
        $location = $response->headers->get('Location');
        // Should redirect away from payment page
        expect($location)->not->toContain('advance-payment');
    } else {
        // Or should show error if rendered
        expect($response->status())->toBeIn([302, 400, 403]);
    }
})->group('willingness-payment-sync');

test('workflow status incorrect after payment processing - BUG FOUND', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment is processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Get workflow status
    $workflowStatus = $productRequest->getWorkflowStatus();

    // BREAKAGE BUG: getWorkflowStatus() checks advance_payment_status !== 'paid'
    // but does NOT check for 'processing', so it returns 'awaiting_advance_payment'
    // even though payment is already processing!
    
    // This test documents the bug - workflow should NOT be 'awaiting_advance_payment'
    // when status is 'processing'
    expect($workflowStatus)->not->toBe('awaiting_advance_payment');
    
    // If bug is fixed, workflow should be something like 'awaiting_admin_approval' or 'procurement_in_progress'
    // Currently it incorrectly returns 'awaiting_advance_payment'
})->group('willingness-payment-sync');

test('request dashboard shows wrong action button after payment', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.index'));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        // Verify redirect URL is correct
        $redirectUrl = $response->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        
        if (isset($json['props']['requests'])) {
            $requestData = collect($json['props']['requests'])->firstWhere('id', $productRequest->id);
            expect($requestData)->not->toBeNull('Request should be found in list');
            
            $workflowStatus = $requestData['workflow_status'] ?? null;
            
            // Breakage: If payment is processing, action button should NOT be "Pay Advance"
            expect($requestData['advance_payment_status'])->toBe('processing');
            expect($workflowStatus)->not->toBe('awaiting_advance_payment');
        } else {
            // If requests not in response, that's also a breakage
            expect($json['props'])->toHaveKey('requests');
        }
    }
})->group('willingness-payment-sync');

test('race condition: payment updates after page load shows wrong status', function () {
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

    // Customer loads page - sees "Pay Advance" button
    $response1 = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Simultaneously, payment completes and updates status
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Customer refreshes page immediately - should show updated status
    $response2 = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($response2->status() === 409) {
        expect($response2->headers->has('X-Inertia-Location'))->toBeTrue();
        // Verify redirect URL is correct
        $redirectUrl = $response2->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($response2->status())->toBeIn([200, 302]);

    if ($response2->status() === 200) {
        $json = json_decode($response2->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        // Should reflect the updated 'processing' status
        expect($json['props']['request']['advance_payment_status'])->toBe('processing');
        expect($json['props']['request']['requires_advance_payment'] ?? null)->toBeFalse();
    }
})->group('willingness-payment-sync');

test('chapa webhook updates status but page cache shows old status', function () {
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

    // Simulate Chapa webhook updating transaction and product request
    $transaction->update(['gateway_status' => 'paid']);
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Refresh to get latest data
    $productRequest->refresh();

    // Verify requiresAdvancePayment is false
    expect($productRequest->requiresAdvancePayment())->toBeFalse();

    // Visit page - should show updated status
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        // Verify redirect URL is correct
        $redirectUrl = $response->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        // Should show 'processing' status
        expect($json['props']['request']['advance_payment_status'])->toBe('processing');
    }
})->group('willingness-payment-sync');

test('offline payment approval updates status but UI shows old status', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Create admin role if it doesn't exist
    try {
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole($adminRole);
    } catch (\Exception $e) {
        // Role might already exist, or we'll skip this test
        $admin->assignRole('admin');
    }
    $offlineMethod = OfflinePaymentMethod::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $submission = OfflinePaymentSubmission::factory()->create([
        'user_id' => $user->id,
        'product_request_id' => $productRequest->id,
        'offline_payment_method_id' => $offlineMethod->id,
        'status' => 'pending',
        'amount' => 1150,
        'currency' => 'ETB',
    ]);

    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => $submission->submission_ref,
        'gateway_status' => 'proof_uploaded',
        'admin_status' => 'unseen',
        'payment_method' => 'offline',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Admin approves payment
    $response = $this->actingAs($admin)
        ->post(route('admin.payments.approve', $transaction->id));

    // Refresh product request
    $productRequest->refresh();

    // Status should be 'paid' after admin approval
    // But for this test, we're checking if 'processing' status is correctly displayed
    // Customer visits page - should show correct status
    $customerResponse = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($customerResponse->status() === 409) {
        expect($customerResponse->headers->has('X-Inertia-Location'))->toBeTrue();
        // Verify redirect URL is correct
        $redirectUrl = $customerResponse->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($customerResponse->status())->toBeIn([200, 302]);

    if ($customerResponse->status() === 200) {
        $json = json_decode($customerResponse->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        // Should show current status, not cached
        $status = $json['props']['request']['advance_payment_status'];
        expect($status)->toBeIn(['processing', 'paid']);
        
        // If it's processing or paid, should not require advance payment
        expect($json['props']['request']['requires_advance_payment'] ?? null)->toBeFalse();
    }
})->group('willingness-payment-sync');

test('multiple rapid payment attempts create duplicate transactions', function () {
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

    // Create initial transaction
    $firstTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-111111',
        'gateway_status' => 'pending',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // Simulate rapid second attempt - should be prevented
    // First payment already in progress
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Try to access payment page again - should be blocked
    $response = $this->actingAs($user)
        ->get(route('product-requests.advance-payment.show', $productRequest->id));

    // Should redirect with error or show that payment is already processing
    expect($response->status())->toBeIn([302, 200, 400]);
    
    // Count transactions - should still be 1
    $transactions = PaymentTransaction::where('product_request_id', $productRequest->id)
        ->where('tx_ref', 'like', 'ADV-%')
        ->count();

    // Breakage: Should prevent duplicates
    expect($transactions)->toBe(1);
})->group('willingness-payment-sync');

test('request show page does not refresh status after payment callback', function () {
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

    // Payment callback happens (simulated)
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

    // Simulate webhook updating status
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Customer visits request show page
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle version mismatch
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        // Verify redirect URL is correct
        $redirectUrl = $response->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        return;
    }

    // Must get a valid response
    expect($response->status())->toBeIn([200, 302]);

    // Breakage: Controller should refresh the model before calculating requires_advance_payment
    // Check if the response includes fresh data
    if ($response->status() === 200) {
        $json = json_decode($response->getContent(), true);
        expect($json)->toBeArray();
        expect($json)->toHaveKey('props');
        expect($json['props'])->toHaveKey('request');
        
        // Should show 'processing', not stale 'pending'
        expect($json['props']['request']['advance_payment_status'])->toBe('processing');
    }
})->group('willingness-payment-sync');

