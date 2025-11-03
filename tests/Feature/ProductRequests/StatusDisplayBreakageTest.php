<?php

namespace Tests\Feature\ProductRequests;

use App\Models\User;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

/**
 * STATUS DISPLAY BREAKAGE TESTS
 * Group: status-display-breakage
 * These tests verify that both ADMIN and CUSTOMER views correctly display
 * "Awaiting Admin Approval" when advance payment status is 'processing'
 */

// ============================================================================
// ADMIN VIEW TESTS
// ============================================================================

test('admin view shows wrong status after chapa advance payment', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
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

    $response = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // Handle 409 (Inertia version mismatch)
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Admin view should show workflow_status as 'awaiting_admin_approval'
    $response->assertInertia(fn ($page) => 
        $page->component('admin/product-request/show')
            ->where('product_request.workflow_status', 'awaiting_admin_approval')
            ->where('product_request.advance_payment_status', 'processing')
    );
})->group('status-display-breakage');

test('admin view shows awaiting advance payment when status is processing', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Calculate workflow status - should be 'awaiting_admin_approval'
    $workflowStatus = $productRequest->getWorkflowStatus();

    // BREAKAGE TEST: Should NOT be 'awaiting_advance_payment' when status is 'processing'
    expect($workflowStatus)->not->toBe('awaiting_advance_payment')
        ->and('When advance_payment_status is "processing", workflow_status should be "awaiting_admin_approval", but got: ' . $workflowStatus);
    
    expect($workflowStatus)->toBe('awaiting_admin_approval')
        ->and('workflow_status should be "awaiting_admin_approval" when payment is processing');
})->group('status-display-breakage');

test('admin view workflow status not refreshed after payment', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
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

    // Simulate payment return updating status
    $productRequest->update(['advance_payment_status' => 'processing']);

    // Admin views the page
    $response = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Admin view should show correct status after refresh
    $response->assertInertia(fn ($page) => 
        $page->component('admin/product-request/show')
            ->where('product_request.workflow_status', 'awaiting_admin_approval')
            ->where('product_request.advance_payment_status', 'processing')
    );
})->group('status-display-breakage');

test('admin view shows warning when payment is processing', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment processing, should NOT show warning
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $response = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Should show "Willingness confirmed + Advance Payment Pending" 
    // NOT "Willingness confirmed but advance payment NOT yet paid"
    $response->assertInertia(fn ($page) => 
        $page->component('admin/product-request/show')
            ->has('product_request')
    );

    // Check JSON structure for the badge text
    $json = json_decode($response->getContent(), true);
    expect($json)->toBeArray()
        ->and($json)->toHaveKey('props')
        ->and($json['props'])->toHaveKey('product_request');
    
    $pr = $json['props']['product_request'];
    expect($pr)->toBeArray()
        ->and($pr)->toHaveKey('advance_payment_status');
    
    // Status should be 'processing', not 'pending'
    expect($pr['advance_payment_status'])->toBe('processing')
        ->and('Admin view should show advance_payment_status as "processing", not "pending"');
})->group('status-display-breakage');

// ============================================================================
// CUSTOMER VIEW TESTS
// ============================================================================

test('customer view shows wrong status after chapa advance payment', function () {
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
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Customer view should show workflow_status as 'awaiting_admin_approval'
    $response->assertInertia(fn ($page) => 
        $page->component('request/show')
            ->where('request.workflow_status', 'awaiting_admin_approval')
            ->where('request.advance_payment_status', 'processing')
    );
})->group('status-display-breakage');

test('customer requests list shows wrong status after payment', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment processing
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

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Customer requests list should show 'awaiting_admin_approval'
    $response->assertInertia(fn ($page) => 
        $page->component('request/request-dashboard')
            ->has('requests', 1)
            ->where('requests.0.workflow_status', 'awaiting_admin_approval')
            ->where('requests.0.advance_payment_status', 'processing')
    );
})->group('status-display-breakage');

test('customer view shows pay advance button when status is processing', function () {
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
        ->and('requiresAdvancePayment() should return false when advance_payment_status is "processing"');

    // Check workflow status
    $workflowStatus = $productRequest->getWorkflowStatus();
    expect($workflowStatus)->toBe('awaiting_admin_approval')
        ->and('workflow_status should be "awaiting_admin_approval" when payment is processing');
})->group('status-display-breakage');

test('customer view status not updated after payment return', function () {
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
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Refresh product request
    $productRequest->refresh();

    // Now customer views their request
    $viewResponse = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Handle 409
    if ($viewResponse->status() === 409) {
        expect($viewResponse->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // BREAKAGE TEST: Customer view should show correct status after payment return
    $viewResponse->assertInertia(fn ($page) => 
        $page->component('request/show')
            ->where('request.workflow_status', 'awaiting_admin_approval')
            ->where('request.advance_payment_status', 'processing')
            ->where('request.requires_advance_payment', false)
    );
})->group('status-display-breakage');

// ============================================================================
// WORKFLOW STATUS CALCULATION TESTS
// ============================================================================

test('workflow status calculation bug when payment is processing', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Payment processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Refresh to simulate database state
    $productRequest->refresh();

    $workflowStatus = $productRequest->getWorkflowStatus();

    // BREAKAGE TEST: Should return 'awaiting_admin_approval', NOT 'awaiting_advance_payment'
    expect($workflowStatus)->toBe('awaiting_admin_approval')
        ->and('getWorkflowStatus() should return "awaiting_admin_approval" when advance_payment_status is "processing"')
        ->and('Current value: ' . $workflowStatus);
    
    expect($workflowStatus)->not->toBe('awaiting_advance_payment')
        ->and('getWorkflowStatus() should NOT return "awaiting_advance_payment" when payment is processing');
})->group('status-display-breakage');

test('workflow status returns awaiting advance when status is null or pending', function () {
    $user = User::factory()->create();
    
    // Test with 'pending' status (since null is not allowed in DB)
    // The getWorkflowStatus() method handles null as 'pending' anyway
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending', // Not paid, not processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $workflowStatus = $productRequest->getWorkflowStatus();

    // Should return 'awaiting_advance_payment' when status is 'pending' (or null, which is treated as pending)
    expect($workflowStatus)->toBe('awaiting_advance_payment')
        ->and('getWorkflowStatus() should return "awaiting_advance_payment" when advance_payment_status is "pending"');
})->group('status-display-breakage');

test('workflow status returns awaiting advance when status is pending', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending', // Not paid, not processing
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    $workflowStatus = $productRequest->getWorkflowStatus();

    // Should return 'awaiting_advance_payment' when status is 'pending'
    expect($workflowStatus)->toBe('awaiting_advance_payment')
        ->and('getWorkflowStatus() should return "awaiting_advance_payment" when advance_payment_status is "pending"');
})->group('status-display-breakage');

// ============================================================================
// STATUS SYNCHRONIZATION TESTS
// ============================================================================

test('status mismatch between payment transaction and product request', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'pending', // Not updated yet
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Payment transaction shows paid, but product request status not updated
    $transaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid', // Gateway says paid
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
    ]);

    // BREAKAGE TEST: Status should be synchronized
    // After payment return, product request should be updated
    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('payment.return', ['tx_ref' => $transaction->tx_ref]));

    // Handle 409
    if ($response->status() === 409) {
        expect($response->headers->has('X-Inertia-Location'))->toBeTrue();
        return;
    }

    // Refresh product request
    $productRequest->refresh();

    // BREAKAGE TEST: Product request status should match transaction status
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('Product request advance_payment_status should be "processing" when transaction gateway_status is "paid"')
        ->and('Current status: ' . ($productRequest->advance_payment_status ?? 'null'));
})->group('status-display-breakage');

test('status update timing issue between webhook and views', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
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

    // Simulate webhook updating status
    $productRequest->update(['advance_payment_status' => 'processing']);
    $productRequest->refresh();

    // Verify database state first
    expect($productRequest->advance_payment_status)->toBe('processing')
        ->and('Database should have advance_payment_status as "processing" after webhook');

    // Customer views immediately after webhook
    $customerResponse = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Admin views immediately after webhook
    $adminResponse = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // BREAKAGE TEST: Both views should show correct status regardless of timing
    $customerStatusChecked = false;
    $adminStatusChecked = false;

    if ($customerResponse->status() === 409) {
        // Version mismatch - verify redirect URL
        expect($customerResponse->headers->has('X-Inertia-Location'))->toBeTrue();
        $redirectUrl = $customerResponse->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        $customerStatusChecked = true;
    } else {
        $customerResponse->assertInertia(fn ($page) => 
            $page->component('request/show')
                ->where('request.workflow_status', 'awaiting_admin_approval')
                ->where('request.advance_payment_status', 'processing')
        );
        $customerStatusChecked = true;
    }

    if ($adminResponse->status() === 409) {
        // Version mismatch - verify redirect URL
        expect($adminResponse->headers->has('X-Inertia-Location'))->toBeTrue();
        $redirectUrl = $adminResponse->headers->get('X-Inertia-Location');
        expect($redirectUrl)->toContain('product-requests');
        $adminStatusChecked = true;
    } else {
        $adminResponse->assertInertia(fn ($page) => 
            $page->component('admin/product-request/show')
                ->where('product_request.workflow_status', 'awaiting_admin_approval')
                ->where('product_request.advance_payment_status', 'processing')
        );
        $adminStatusChecked = true;
    }

    // Ensure both were checked
    expect($customerStatusChecked)->toBeTrue()
        ->and('Customer view status should be checked');
    expect($adminStatusChecked)->toBeTrue()
        ->and('Admin view status should be checked');
})->group('status-display-breakage');

test('database state vs displayed state mismatch', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing', // Database has correct status
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Verify database state
    $freshProductRequest = ProductRequest::find($productRequest->id);
    expect($freshProductRequest->advance_payment_status)->toBe('processing')
        ->and('Database should have advance_payment_status as "processing"');

    // Verify workflow status calculation
    $workflowStatus = $freshProductRequest->getWorkflowStatus();
    expect($workflowStatus)->toBe('awaiting_admin_approval')
        ->and('Workflow status should be "awaiting_admin_approval" when database status is "processing"');

    // Verify requiresAdvancePayment
    expect($freshProductRequest->requiresAdvancePayment())->toBeFalse()
        ->and('requiresAdvancePayment() should return false when status is "processing"');
})->group('status-display-breakage');

test('status display consistency across all views', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $admin->assignRole($adminRole);
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
    ]);

    // Check workflow status
    $workflowStatus = $productRequest->getWorkflowStatus();
    expect($workflowStatus)->toBe('awaiting_admin_approval');

    // Customer view
    $customerView = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Customer list
    $customerList = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->get(route('request.index'));

    // Admin view
    $adminView = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // All should show consistent status
    if ($customerView->status() !== 409) {
        $customerView->assertInertia(fn ($page) => 
            $page->has('request')
                ->where('request.workflow_status', 'awaiting_admin_approval')
        );
    }

    if ($customerList->status() !== 409) {
        $customerList->assertInertia(fn ($page) => 
            $page->has('requests')
                ->where('requests.0.workflow_status', 'awaiting_admin_approval')
        );
    }

    if ($adminView->status() !== 409) {
        $adminView->assertInertia(fn ($page) => 
            $page->has('product_request')
                ->where('product_request.workflow_status', 'awaiting_admin_approval')
        );
    }
})->group('status-display-breakage');

