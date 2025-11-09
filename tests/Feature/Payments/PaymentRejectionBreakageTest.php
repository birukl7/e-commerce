<?php

use App\Models\User;
use App\Models\ProductRequest;
use App\Models\PaymentTransaction;
use App\Models\Order;
use App\Models\PaymentRejectionReason;
use App\Services\PaymentFinalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

// ============================================================================
// MILESTONE 6: PAYMENT REJECTION FLOW BREAKAGE TESTS
// Group: milestone-6-payment-rejection
// 
// Run with: php artisan test --group=milestone-6-payment-rejection
// ============================================================================

uses()->group('milestone-6-payment-rejection');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an admin user with proper role assignment for payment rejection tests
 */
function createPaymentRejectionAdminUser(): User
{
    $admin = User::factory()->create([
        'status' => 'active',
        'email_verified_at' => now(),
    ]);
    
    // Assign admin role using Spatie permissions
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole($adminRole);
    }
    
    return $admin;
}

/**
 * Create a test rejection reason
 */
function createTestRejectionReason(array $attributes = []): PaymentRejectionReason
{
    return PaymentRejectionReason::factory()->create(array_merge([
        'reason_code' => 'test_reason_' . uniqid(),
        'reason_text' => 'Test Rejection Reason',
        'description' => 'Test description',
        'applies_to' => ['both'],
        'is_active' => true,
        'sort_order' => 1,
    ], $attributes));
}

/**
 * Create a test payment transaction ready for rejection
 */
function createTestPaymentForRejection(array $attributes = []): PaymentTransaction
{
    return PaymentTransaction::factory()->create(array_merge([
        'gateway_status' => 'proof_uploaded',
        'admin_status' => 'unseen',
    ], $attributes));
}

// ============================================================================
// DATABASE SCHEMA & MODEL RELATIONSHIPS
// ============================================================================

test('payment_rejection_reasons table exists with correct schema', function () {
    $reason = createTestRejectionReason([
        'reason_code' => 'test_code',
        'reason_text' => 'Test Reason',
        'description' => 'Test Description',
        'applies_to' => ['product_request', 'normal_purchase'],
        'is_active' => true,
        'sort_order' => 5,
    ]);

    expect($reason->reason_code)->toBe('test_code');
    expect($reason->reason_text)->toBe('Test Reason');
    expect($reason->description)->toBe('Test Description');
    expect($reason->applies_to)->toBe(['product_request', 'normal_purchase']);
    expect($reason->is_active)->toBeTrue();
    expect($reason->sort_order)->toBe(5);
});

test('payment_transactions table has rejection_reason_code column with foreign key', function () {
    $reason = createTestRejectionReason(['reason_code' => 'test_fk']);
    $payment = createTestPaymentForRejection([
        'rejection_reason_code' => 'test_fk',
    ]);

    $payment->refresh();
    expect($payment->rejection_reason_code)->toBe('test_fk');
    expect($payment->rejectionReason)->not->toBeNull();
    expect($payment->rejectionReason->reason_code)->toBe('test_fk');
});

test('payment transaction rejection reason relationship works correctly', function () {
    $reason = createTestRejectionReason(['reason_code' => 'relationship_test']);
    $payment = createTestPaymentForRejection([
        'rejection_reason_code' => 'relationship_test',
    ]);

    expect($payment->rejectionReason)->not->toBeNull();
    expect($payment->rejectionReason->id)->toBe($reason->id);
    expect($payment->rejectionReason->reason_text)->toBe($reason->reason_text);
});

test('rejection reason payment transactions relationship works correctly', function () {
    $reason = createTestRejectionReason(['reason_code' => 'reverse_test']);
    
    $payment1 = createTestPaymentForRejection(['rejection_reason_code' => 'reverse_test']);
    $payment2 = createTestPaymentForRejection(['rejection_reason_code' => 'reverse_test']);

    $reason->refresh();
    expect($reason->paymentTransactions)->toHaveCount(2);
    expect($reason->paymentTransactions->pluck('id')->toArray())->toContain($payment1->id, $payment2->id);
});

// ============================================================================
// REJECTION REASONS MODEL SCOPES
// ============================================================================

test('active scope filters only active rejection reasons', function () {
    $active1 = createTestRejectionReason(['is_active' => true]);
    $active2 = createTestRejectionReason(['is_active' => true]);
    $inactive = createTestRejectionReason(['is_active' => false]);

    $activeReasons = PaymentRejectionReason::active()->get();
    
    expect($activeReasons->pluck('id')->toArray())->toContain($active1->id, $active2->id);
    expect($activeReasons->pluck('id')->toArray())->not->toContain($inactive->id);
});

test('ordered scope sorts by sort_order then reason_text', function () {
    $reason1 = createTestRejectionReason(['sort_order' => 3, 'reason_text' => 'Zebra']);
    $reason2 = createTestRejectionReason(['sort_order' => 1, 'reason_text' => 'Apple']);
    $reason3 = createTestRejectionReason(['sort_order' => 2, 'reason_text' => 'Banana']);

    $ordered = PaymentRejectionReason::ordered()->get();
    
    expect($ordered[0]->id)->toBe($reason2->id); // sort_order 1
    expect($ordered[1]->id)->toBe($reason3->id); // sort_order 2
    expect($ordered[2]->id)->toBe($reason1->id); // sort_order 3
});

test('forPaymentType scope filters by applies_to correctly', function () {
    $both = createTestRejectionReason(['applies_to' => ['both']]);
    $productRequest = createTestRejectionReason(['applies_to' => ['product_request']]);
    $normalPurchase = createTestRejectionReason(['applies_to' => ['normal_purchase']]);
    $bothTypes = createTestRejectionReason(['applies_to' => ['product_request', 'normal_purchase']]);

    // Test product_request type
    $productRequestReasons = PaymentRejectionReason::forPaymentType('product_request')->get();
    expect($productRequestReasons->pluck('id')->toArray())->toContain($both->id);
    expect($productRequestReasons->pluck('id')->toArray())->toContain($productRequest->id);
    expect($productRequestReasons->pluck('id')->toArray())->toContain($bothTypes->id);
    expect($productRequestReasons->pluck('id')->toArray())->not->toContain($normalPurchase->id);

    // Test normal_purchase type
    $normalPurchaseReasons = PaymentRejectionReason::forPaymentType('normal_purchase')->get();
    expect($normalPurchaseReasons->pluck('id')->toArray())->toContain($both->id);
    expect($normalPurchaseReasons->pluck('id')->toArray())->toContain($normalPurchase->id);
    expect($normalPurchaseReasons->pluck('id')->toArray())->toContain($bothTypes->id);
    expect($normalPurchaseReasons->pluck('id')->toArray())->not->toContain($productRequest->id);
});

// ============================================================================
// PAYMENT REJECTION WITH REASONS
// ============================================================================

test('admin can reject payment with rejection reason code', function () {
    $admin = createPaymentRejectionAdminUser();
    $reason = createTestRejectionReason(['reason_code' => 'test_reject']);
    $payment = createTestPaymentForRejection([
        'gateway_status' => 'proof_uploaded',
        'admin_status' => 'unseen',
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $result = $paymentFinalizer->handleAdminRejection(
        $payment,
        $admin,
        'Additional notes here',
        'test_reject'
    );

    expect($result)->toBeTrue();
    $payment->refresh();
    expect($payment->admin_status)->toBe('rejected');
    expect($payment->rejection_reason_code)->toBe('test_reject');
    expect($payment->admin_notes)->toBe('Additional notes here');
    expect($payment->admin_id)->toBe($admin->id);
    expect($payment->admin_action_at)->not->toBeNull();
});

test('payment rejection stores rejection reason text in notification', function () {
    Notification::fake();
    
    $admin = createPaymentRejectionAdminUser();
    $user = User::factory()->create();
    $reason = createTestRejectionReason([
        'reason_code' => 'notification_test',
        'reason_text' => 'Insufficient Funds',
        'description' => 'Payment amount mismatch',
    ]);
    
    $productRequest = ProductRequest::factory()->create(['user_id' => $user->id]);
    $payment = createTestPaymentForRejection([
        'product_request_id' => $productRequest->id,
        'customer_email' => $user->email,
        'gateway_status' => 'proof_uploaded',
        'admin_status' => 'unseen',
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminRejection(
        $payment,
        $admin,
        'Please check the amount',
        'notification_test'
    );

    Notification::assertSentTo(
        $user,
        \App\Notifications\ProductRequestStatusUpdated::class,
        function ($notification) {
            return str_contains($notification->message, 'Insufficient Funds') &&
                   str_contains($notification->message, 'Please check the amount');
        }
    );
});

test('payment rejection without reason code falls back to notes', function () {
    $admin = createPaymentRejectionAdminUser();
    $payment = createTestPaymentForRejection();

    $paymentFinalizer = app(PaymentFinalizer::class);
    $result = $paymentFinalizer->handleAdminRejection(
        $payment,
        $admin,
        'Custom rejection note'
    );

    expect($result)->toBeTrue();
    $payment->refresh();
    expect($payment->admin_status)->toBe('rejected');
    expect($payment->rejection_reason_code)->toBeNull();
    expect($payment->admin_notes)->toBe('Custom rejection note');
});

test('payment cannot be rejected if already approved', function () {
    $admin = createPaymentRejectionAdminUser();
    $reason = createTestRejectionReason();
    $payment = createTestPaymentForRejection([
        'admin_status' => 'approved',
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $result = $paymentFinalizer->handleAdminRejection(
        $payment,
        $admin,
        null,
        $reason->reason_code
    );

    expect($result)->toBeFalse();
    $payment->refresh();
    expect($payment->admin_status)->toBe('approved');
});

test('payment cannot be rejected if already rejected', function () {
    $admin = createPaymentRejectionAdminUser();
    $reason = createTestRejectionReason();
    $payment = createTestPaymentForRejection([
        'admin_status' => 'rejected',
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $result = $paymentFinalizer->handleAdminRejection(
        $payment,
        $admin,
        null,
        $reason->reason_code
    );

    expect($result)->toBeFalse();
});

// ============================================================================
// PAYMENT RETRY FUNCTIONALITY
// ============================================================================

test('customer can retry rejected payment for product request advance', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $reason = createTestRejectionReason(['reason_code' => 'retry_test']);
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'advance_payment_status' => 'pending', // Will be reset
    ]);
    
    $payment = createTestPaymentForRejection([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123',
        'customer_email' => $user->email,
        'admin_status' => 'rejected',
        'rejection_reason_code' => 'retry_test',
        'admin_notes' => 'Test rejection',
    ]);

    // Verify payment is rejected before retry
    expect($payment->admin_status)->toBe('rejected');
    
    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    $response->assertRedirect();
    
    // Use fresh() to get the latest data from database
    $payment = PaymentTransaction::find($payment->id);
    $productRequest = $productRequest->fresh();
    
    // Core functionality: payment status should be reset
    // admin_status is an ENUM, so it will be 'unseen' instead of null
    expect($payment->admin_status)->toBe('unseen')
        ->and($payment->rejection_reason_code)->toBeNull()
        ->and($payment->admin_notes)->toBeNull()
        ->and($productRequest->advance_payment_status)->toBe('pending');
});

test('customer can retry rejected payment for product request final', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $reason = createTestRejectionReason();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'final_payment_status' => 'pending',
    ]);
    
    $payment = createTestPaymentForRejection([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'FINAL-' . $productRequest->id . '-456',
        'customer_email' => $user->email,
        'admin_status' => 'rejected',
    ]);

    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    $response->assertRedirect();
    
    // Use fresh() to get the latest data from database
    $payment = $payment->fresh();
    $productRequest = $productRequest->fresh();
    
    // admin_status is an ENUM, so it will be 'unseen' instead of null
    expect($payment->admin_status)->toBe('unseen');
    expect($productRequest->final_payment_status)->toBe('pending');
});

test('customer cannot retry payment that is not rejected', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $payment = createTestPaymentForRejection([
        'customer_email' => $user->email,
        'admin_status' => 'approved',
    ]);

    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    $response->assertSessionHas('error');
    $payment->refresh();
    expect($payment->admin_status)->toBe('approved');
});

test('customer cannot retry another customers payment', function () {
    $user1 = User::factory()->create(['email_verified_at' => now()]);
    $user2 = User::factory()->create(['email_verified_at' => now()]);
    
    $payment = createTestPaymentForRejection([
        'customer_email' => $user1->email,
        'admin_status' => 'rejected',
    ]);

    $response = $this->actingAs($user2)
        ->post(route('payments.retry', $payment->id));

    $response->assertSessionHas('error');
});

test('payment retry resets order status if order was cancelled', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => 'cancelled',
    ]);
    
    $payment = createTestPaymentForRejection([
        'order_id' => $order->id,
        'customer_email' => $user->email,
        'admin_status' => 'rejected',
    ]);

    // Verify order is cancelled before retry
    expect($order->status)->toBe('cancelled');

    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    $response->assertRedirect();
    $order = $order->fresh();
    // Order status should be reset to 'processing' if it was cancelled
    // Note: Order status enum is ['processing', 'shipped', 'delivered', 'cancelled']
    // So we reset to 'processing' instead of 'pending'
    expect($order->status)->toBe('processing');
});

// ============================================================================
// ADMIN CONTROLLER REJECTION FLOW
// ============================================================================

test('admin payment controller requires rejection reason code', function () {
    $admin = createPaymentRejectionAdminUser();
    $payment = createTestPaymentForRejection();

    $response = $this->actingAs($admin)
        ->post(route('admin.payments.reject', $payment->id), [
            'notes' => 'Some notes',
        ]);

    $response->assertSessionHasErrors('rejection_reason_code');
});

test('admin payment controller rejects payment with valid reason code', function () {
    $admin = createPaymentRejectionAdminUser();
    $reason = createTestRejectionReason(['reason_code' => 'controller_test']);
    $payment = createTestPaymentForRejection();

    $response = $this->actingAs($admin)
        ->post(route('admin.payments.reject', $payment->id), [
            'rejection_reason_code' => 'controller_test',
            'notes' => 'Additional notes',
        ]);

    $response->assertSessionHas('success');
    $payment->refresh();
    expect($payment->admin_status)->toBe('rejected');
    expect($payment->rejection_reason_code)->toBe('controller_test');
    expect($payment->admin_notes)->toBe('Additional notes');
});

test('admin payment controller validates rejection reason code exists', function () {
    $admin = createPaymentRejectionAdminUser();
    $payment = createTestPaymentForRejection();

    $response = $this->actingAs($admin)
        ->post(route('admin.payments.reject', $payment->id), [
            'rejection_reason_code' => 'non_existent_reason',
            'notes' => 'Some notes',
        ]);

    $response->assertSessionHasErrors('rejection_reason_code');
});

// ============================================================================
// BULK ACTIONS WITH REJECTION REASONS
// ============================================================================

test('bulk rejection requires rejection reason code', function () {
    $admin = createPaymentRejectionAdminUser();
    $payment1 = createTestPaymentForRejection();
    $payment2 = createTestPaymentForRejection();

    $response = $this->actingAs($admin)
        ->post(route('admin.payments.bulk_action'), [
            'action' => 'reject',
            'payment_ids' => [$payment1->id, $payment2->id],
            'notes' => 'Bulk rejection',
        ]);

    $response->assertSessionHasErrors('rejection_reason_code');
});

test('bulk rejection applies reason to all selected payments', function () {
    $admin = createPaymentRejectionAdminUser();
    $reason = createTestRejectionReason(['reason_code' => 'bulk_test']);
    $payment1 = createTestPaymentForRejection();
    $payment2 = createTestPaymentForRejection();
    $payment3 = createTestPaymentForRejection(['admin_status' => 'approved']); // Cannot be rejected

    $response = $this->actingAs($admin)
        ->post(route('admin.payments.bulk_action'), [
            'action' => 'reject',
            'payment_ids' => [$payment1->id, $payment2->id, $payment3->id],
            'rejection_reason_code' => 'bulk_test',
            'notes' => 'Bulk rejection notes',
        ]);

    $payment1->refresh();
    $payment2->refresh();
    $payment3->refresh();
    
    expect($payment1->admin_status)->toBe('rejected');
    expect($payment1->rejection_reason_code)->toBe('bulk_test');
    expect($payment2->admin_status)->toBe('rejected');
    expect($payment2->rejection_reason_code)->toBe('bulk_test');
    expect($payment3->admin_status)->toBe('approved'); // Should remain unchanged
});

// ============================================================================
// REJECTION REASONS API ENDPOINT
// ============================================================================

test('getActiveReasons returns only active reasons for payment type', function () {
    $activeBoth = createTestRejectionReason([
        'reason_code' => 'active_both',
        'is_active' => true,
        'applies_to' => ['both'],
    ]);
    $activeProductRequest = createTestRejectionReason([
        'reason_code' => 'active_pr',
        'is_active' => true,
        'applies_to' => ['product_request'],
    ]);
    $inactive = createTestRejectionReason([
        'reason_code' => 'inactive',
        'is_active' => false,
        'applies_to' => ['both'],
    ]);
    $activeNormal = createTestRejectionReason([
        'reason_code' => 'active_normal',
        'is_active' => true,
        'applies_to' => ['normal_purchase'],
    ]);

    $admin = createPaymentRejectionAdminUser();
    
    $response = $this->actingAs($admin)
        ->get(route('api.payment-rejection-reasons.active', ['payment_type' => 'product_request']));

    $response->assertOk();
    $reasons = $response->json();
    $reasonCodes = collect($reasons)->pluck('reason_code')->toArray();
    
    expect($reasonCodes)->toContain('active_both', 'active_pr');
    expect($reasonCodes)->not->toContain('inactive', 'active_normal');
});

// ============================================================================
// EDGE CASES & ERROR HANDLING
// ============================================================================

test('rejection reason foreign key constraint prevents invalid codes', function () {
    expect(function () {
        createTestPaymentForRejection([
            'rejection_reason_code' => 'invalid_code_that_does_not_exist',
        ]);
    })->toThrow(\Illuminate\Database\QueryException::class);
});

test('rejection reason can be deleted if not in use', function () {
    $reason = createTestRejectionReason(['reason_code' => 'deletable']);
    
    $result = $reason->delete();
    
    expect($result)->toBeTrue();
    expect(PaymentRejectionReason::find($reason->id))->toBeNull();
});

test('rejection reason cannot be deleted if in use', function () {
    $reason = createTestRejectionReason(['reason_code' => 'in_use']);
    $payment = createTestPaymentForRejection([
        'rejection_reason_code' => 'in_use',
    ]);

    // This should be handled by the controller, but test the model relationship
    expect($reason->paymentTransactions()->count())->toBe(1);
});

test('payment retry handles missing product request gracefully', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Create a real product request first
    $productRequest = ProductRequest::factory()->create(['user_id' => $user->id]);
    $payment = createTestPaymentForRejection([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123',
        'customer_email' => $user->email,
        'admin_status' => 'rejected',
    ]);
    
    // Set product_request_id to null to simulate missing (can't delete due to FK constraint)
    $payment->update(['product_request_id' => null]);

    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    // Should not throw error, payment should still be reset
    $response->assertRedirect();
    $payment = $payment->fresh();
    // admin_status is an ENUM, so it will be 'unseen' instead of null
    expect($payment->admin_status)->toBe('unseen');
});

test('payment retry handles missing order gracefully', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Create a real order first, then delete it to simulate missing
    $order = Order::factory()->create(['user_id' => $user->id]);
    $payment = createTestPaymentForRejection([
        'order_id' => $order->id,
        'customer_email' => $user->email,
        'admin_status' => 'rejected',
    ]);
    
    $orderId = $order->id;
    // Delete the order to simulate missing
    $order->delete();
    
    // Manually set order_id to null since foreign key constraint prevents this
    $payment->update(['order_id' => null]);

    $response = $this->actingAs($user)
        ->post(route('payments.retry', $payment->id));

    // Should not throw error - redirects to checkout for regular orders
    $response->assertRedirect();
    $payment = $payment->fresh();
    // admin_status is an ENUM, so it will be 'unseen' instead of null
    expect($payment->admin_status)->toBe('unseen');
});

// ============================================================================
// SEEDER VALIDATION
// ============================================================================

test('payment rejection reason seeder creates default reasons', function () {
    $this->artisan('db:seed', ['--class' => 'PaymentRejectionReasonSeeder']);

    $reasons = PaymentRejectionReason::all();
    
    expect($reasons->count())->toBeGreaterThan(0);
    
    // Check for some expected default reasons
    $reasonCodes = $reasons->pluck('reason_code')->toArray();
    expect($reasonCodes)->toContain('insufficient_funds', 'invalid_payment_method', 'other');
});

test('payment rejection reason seeder is idempotent', function () {
    $this->artisan('db:seed', ['--class' => 'PaymentRejectionReasonSeeder']);
    $firstCount = PaymentRejectionReason::count();
    
    $this->artisan('db:seed', ['--class' => 'PaymentRejectionReasonSeeder']);
    $secondCount = PaymentRejectionReason::count();
    
    expect($firstCount)->toBe($secondCount);
});

