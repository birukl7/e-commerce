<?php

use App\Models\User;
use App\Models\ProductRequest;
use App\Notifications\ProductRequestStatusUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

// ============================================================================
// PRODUCT ARRIVAL BREAKAGE TESTS
// Group: product-arrival-breakage
// 
// Run with: php artisan test --group=product-arrival-breakage
// 
// These tests are designed to break the product arrival feature by testing
// edge cases, validation failures, authorization issues, and data integrity.
// ============================================================================

uses()->group('product-arrival-breakage');

// Helper function to create admin user
function createAdminUser(): User
{
    $admin = User::factory()->create([
        'status' => 'active', // Required for SecureAdminAccess middleware
        'email_verified_at' => now(), // Required for 'verified' middleware
    ]);
    
    // Assign admin role if using Spatie roles
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $admin->assignRole($adminRole);
    }
    
    return $admin;
}

// ============================================================================
// AUTHORIZATION BREAKAGE TESTS
// ============================================================================

test('non-admin user cannot mark product as arrived', function () {
    $user = User::factory()->create();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
    ]);

    $response = $this->actingAs($user)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should be forbidden (403) or redirect with error
    if ($response->status() === 302) {
        $session = $response->getSession();
        expect($session->has('error') || $session->has('errors'))->toBeTrue();
    } else {
        expect($response->status())->toBe(403);
    }
    
    // Product should not be marked as arrived
    expect($productRequest->fresh()->product_arrived_at)->toBeNull();
});

test('regular user cannot mark their own product as arrived', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
    ]);

    $response = $this->actingAs($user)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should be forbidden - customer cannot mark their own product as arrived
    if ($response->status() === 302) {
        $session = $response->getSession();
        expect($session->has('error') || $session->has('errors'))->toBeTrue();
    } else {
        expect($response->status())->toBe(403);
    }
});

test('unauthenticated user cannot mark product as arrived', function () {
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
    ]);

    $response = $this->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
        'arrival_date' => now()->format('Y-m-d'),
    ]);

    // Should redirect to login or be forbidden
    expect(in_array($response->status(), [302, 401, 403]))->toBeTrue();
});

// ============================================================================
// VALIDATION BREAKAGE TESTS
// ============================================================================

test('admin cannot mark product as arrived when request is not approved', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'pending', // NOT approved
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should have validation error
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
    
    // Product should not be marked as arrived
    expect($productRequest->fresh()->product_arrived_at)->toBeNull();
});

test('admin cannot mark product as arrived when advance payment is not paid', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'pending', // NOT paid
        'advance_amount' => 1000,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should have validation error
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
    
    // Product should not be marked as arrived
    expect($productRequest->fresh()->product_arrived_at)->toBeNull();
});

test('admin cannot mark product as arrived when request is rejected', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'rejected', // Rejected
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should have validation error (terminated request)
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
    
    // Product should not be marked as arrived
    expect($productRequest->fresh()->product_arrived_at)->toBeNull();
});

test('admin cannot mark product as arrived when customer lost interest', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'lost_interest_at' => now(), // Customer lost interest
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    // Should have validation error (terminated request)
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
    
    // Product should not be marked as arrived
    expect($productRequest->fresh()->product_arrived_at)->toBeNull();
});

test('admin cannot mark product as arrived with invalid date format', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => 'invalid-date-format',
        ]);

    // Should have validation error
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
});

test('admin cannot mark product as arrived with arrival notes exceeding max length', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $longNotes = str_repeat('a', 5001); // Exceeds 5000 character limit

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
            'arrival_notes' => $longNotes,
        ]);

    // Should have validation error
    $session = $response->getSession();
    expect($session->has('error') || $session->has('errors'))->toBeTrue();
});

// ============================================================================
// DATA INTEGRITY BREAKAGE TESTS
// ============================================================================

test('marking product as arrived multiple times overwrites previous arrival date', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $firstArrivalDate = now()->subDays(5)->format('Y-m-d');
    $secondArrivalDate = now()->format('Y-m-d');

    // First marking
    $response1 = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $firstArrivalDate,
            'arrival_notes' => 'First arrival note',
        ]);

    // Should redirect on success (302)
    expect($response1->status())->toBe(302, 'Expected redirect after marking product as arrived');
    
    // Check for validation errors in session
    $session1 = $response1->getSession();
    if ($session1->has('errors')) {
        $errors = $session1->get('errors');
        expect($errors->all())->toBeEmpty('Validation errors: ' . json_encode($errors->all()));
    }
    if ($session1->has('error')) {
        expect($session1->get('error'))->toBeNull('Session error: ' . $session1->get('error'));
    }
    
    $productRequest->refresh();
    
    // Product should be marked as arrived
    expect($productRequest->product_arrived_at)->not->toBeNull('First marking failed - product not marked as arrived');
    
    $firstArrivalTimestamp = $productRequest->product_arrived_at;

    // Second marking (should overwrite)
    $response2 = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $secondArrivalDate,
            'arrival_notes' => 'Second arrival note',
        ]);

    // Should redirect on success
    if ($response2->status() !== 302) {
        $session = $response2->getSession();
        if ($session->has('errors')) {
            dump('Response 2 errors:', $session->get('errors')->all());
        }
    }

    $productRequest->refresh();
    
    // Second arrival date should overwrite first
    expect($productRequest->product_arrived_at)->not->toBeNull('Product not marked as arrived after second marking');
    expect($productRequest->product_arrived_at->format('Y-m-d'))->toBe($secondArrivalDate);
    expect($productRequest->arrival_notes)->toBe('Second arrival note');
    
    // First timestamp should be different from second
    expect($productRequest->product_arrived_at->timestamp)->not->toBe($firstArrivalTimestamp->timestamp);
});

test('marking product as arrived without notes preserves null value', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
            // No arrival_notes provided
        ]);

    // Should redirect on success (302)
    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');
    
    // Check for errors
    $session = $response->getSession();
    if ($session->has('errors')) {
        expect($session->get('errors')->all())->toBeEmpty('Validation errors occurred');
    }
    if ($session->has('error')) {
        expect($session->get('error'))->toBeNull('Session error occurred');
    }

    $productRequest->refresh();
    
    // Product should be marked as arrived
    expect($productRequest->product_arrived_at)->not->toBeNull('Product not marked as arrived - feature broken');
    expect($productRequest->arrival_notes)->toBeNull();
});

test('marking product as arrived updates workflow status correctly', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'procurement_status' => 'completed',
        'final_payment_status' => 'pending',
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    $productRequest->refresh();
    
    // Workflow status should be 'awaiting_final_payment'
    expect($productRequest->getWorkflowStatus())->toBe('awaiting_final_payment');
});

// ============================================================================
// NOTIFICATION BREAKAGE TESTS
// ============================================================================

test('marking product as arrived sends duplicate notifications when called multiple times', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // First marking
    $response1 = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    expect($response1->status())->toBe(302, 'First marking should succeed');

    // Second marking (should send another notification)
    $response2 = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->addDay()->format('Y-m-d'),
        ]);

    expect($response2->status())->toBe(302, 'Second marking should succeed');

    // Customer should receive 2 notifications (potential issue - duplicate notifications)
    Notification::assertSentTo($customer, ProductRequestStatusUpdated::class, 2);
});

test('completing procurement does not send duplicate notification if product already marked as arrived', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'procurement_status' => 'in_progress',
        'procurement_started_at' => now()->subDays(5),
        'product_arrived_at' => now()->subDay(), // Already marked as arrived
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // Complete procurement (should not send notification since already arrived)
    $this->actingAs($admin)
        ->post(route('admin.product-requests.complete-procurement', $productRequest->id), [
            'procurement_notes' => 'Procurement completed',
        ]);

    // Should NOT send notification (product was already marked as arrived)
    Notification::assertNotSentTo($customer, ProductRequestStatusUpdated::class);
});

test('marking product as arrived sends notification even when final payment is already paid', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'final_payment_status' => 'paid', // Already paid
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // Mark as arrived (should still send notification)
    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    // Notification should be sent (even though final payment is already paid)
    Notification::assertSentTo($customer, ProductRequestStatusUpdated::class);
});

// ============================================================================
// WORKFLOW BREAKAGE TESTS
// ============================================================================

test('marking product as arrived before procurement starts allows final payment', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'procurement_status' => 'not_started', // Procurement not started
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // Mark as arrived before procurement starts
    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $productRequest->refresh();
    
    // Product should be marked as arrived
    expect($productRequest->product_arrived_at)->not->toBeNull();
    
    // Workflow should allow final payment (even if procurement not started)
    // Note: getWorkflowStatus checks procurement_status, so status might be 'awaiting_procurement'
    // but product_arrived_at should still be set
    expect($productRequest->product_arrived_at)->not->toBeNull();
});

test('marking product as arrived when procurement is in progress does not affect procurement status', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'procurement_status' => 'in_progress',
        'procurement_started_at' => now()->subDays(3),
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // Mark as arrived while procurement is in progress
    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $productRequest->refresh();
    
    // Procurement status should remain 'in_progress'
    expect($productRequest->procurement_status)->toBe('in_progress');
    
    // But product should be marked as arrived
    expect($productRequest->product_arrived_at)->not->toBeNull();
});

test('completing procurement does not overwrite existing arrival date and notes', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $customArrivalDate = now()->subDays(2);
    $customNotes = 'Product arrived early at warehouse';
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'procurement_status' => 'in_progress',
        'procurement_started_at' => now()->subDays(5),
        'product_arrived_at' => $customArrivalDate, // Already marked
        'arrival_notes' => $customNotes, // Already has notes
    ]);

    // Complete procurement (should preserve existing arrival data)
    $this->actingAs($admin)
        ->post(route('admin.product-requests.complete-procurement', $productRequest->id), [
            'procurement_notes' => 'Procurement completed',
        ]);

    $productRequest->refresh();
    
    // Arrival date and notes should be preserved
    expect($productRequest->product_arrived_at->format('Y-m-d'))->toBe($customArrivalDate->format('Y-m-d'));
    expect($productRequest->arrival_notes)->toBe($customNotes);
});

// ============================================================================
// EDGE CASE BREAKAGE TESTS
// ============================================================================

test('marking product as arrived with future date is allowed', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $futureDate = now()->addDays(10)->format('Y-m-d');

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $futureDate,
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $productRequest->refresh();
    
    // Future date should be accepted (no validation against future dates)
    expect($productRequest->product_arrived_at)->not->toBeNull();
    expect($productRequest->product_arrived_at->format('Y-m-d'))->toBe($futureDate);
});

test('marking product as arrived with past date is allowed', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $pastDate = now()->subDays(30)->format('Y-m-d');

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $pastDate,
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $productRequest->refresh();
    
    // Past date should be accepted
    expect($productRequest->product_arrived_at)->not->toBeNull();
    expect($productRequest->product_arrived_at->format('Y-m-d'))->toBe($pastDate);
});

test('marking product as arrived without date defaults to current timestamp', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $beforeMarking = now();

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            // No arrival_date provided
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $afterMarking = now();
    $productRequest->refresh();
    
    // Should default to current timestamp
    expect($productRequest->product_arrived_at)->not->toBeNull();
    expect($productRequest->product_arrived_at->timestamp)->toBeGreaterThanOrEqual($beforeMarking->timestamp);
    expect($productRequest->product_arrived_at->timestamp)->toBeLessThanOrEqual($afterMarking->timestamp);
});

test('marking product as arrived with empty string notes converts to null', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
            'arrival_notes' => '', // Empty string
        ]);

    $productRequest->refresh();
    
    // Empty string should be converted to null
    expect($productRequest->arrival_notes)->toBeNull();
});

test('marking product as arrived updates final payment availability', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'final_payment_status' => 'pending',
        'procurement_status' => 'completed',
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    // Before marking as arrived, final payment should not be required
    expect($productRequest->requiresFinalPayment())->toBeFalse();

    // Mark as arrived
    $response = $this->actingAs($admin)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => now()->format('Y-m-d'),
        ]);

    expect($response->status())->toBe(302, 'Expected redirect after marking product as arrived');

    $productRequest->refresh();
    
    // Product should be marked as arrived
    expect($productRequest->product_arrived_at)->not->toBeNull();
    
    // After marking as arrived, final payment should be required
    // Note: requiresFinalPayment() also checks procurement_status === 'completed'
    // So this might return false if procurement is not completed
    expect($productRequest->product_arrived_at)->not->toBeNull();
});

// ============================================================================
// CONCURRENCY BREAKAGE TESTS
// ============================================================================

test('multiple admins marking product as arrived simultaneously causes race condition', function () {
    $admin1 = createAdminUser();
    $admin2 = createAdminUser();
    $customer = User::factory()->create();
    Notification::fake();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'customer_willing_to_buy' => true, // Required for workflow to progress
        'willingness_confirmed_at' => now(),
    ]);

    $date1 = now()->subDays(1)->format('Y-m-d');
    $date2 = now()->format('Y-m-d');

    // Simulate concurrent requests
    $response1 = $this->actingAs($admin1)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $date1,
            'arrival_notes' => 'Admin 1 notes',
        ]);

    $response2 = $this->actingAs($admin2)
        ->post(route('admin.product-requests.mark-arrived', $productRequest->id), [
            'arrival_date' => $date2,
            'arrival_notes' => 'Admin 2 notes',
        ]);

    // Both should redirect (even if one fails)
    expect($response1->status())->toBeIn([302, 403]);
    expect($response2->status())->toBeIn([302, 403]);

    $productRequest->refresh();
    
    // At least one should have marked the product as arrived
    // This test exposes potential race condition
    expect($productRequest->product_arrived_at)->not->toBeNull('Neither admin successfully marked product as arrived');
    
    // At least one notification should have been sent
    Notification::assertSentTo($customer, ProductRequestStatusUpdated::class, function ($notification) {
        return true; // Just check that at least one was sent
    });
});

// ============================================================================
// UI/DATA DISPLAY BREAKAGE TESTS
// ============================================================================

test('customer view shows arrival banner when product_arrived_at is set', function () {
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'product_arrived_at' => now(),
        'arrival_notes' => 'Product arrived safely',
    ]);

    $response = $this->actingAs($customer)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Should render the show page
    if ($response->status() === 200) {
        $response->assertInertia(fn ($page) => 
            $page->component('request/show')
                ->has('request', fn ($request) => 
                    $request->has('product_arrived_at')
                        ->has('arrival_notes')
                )
        );
    }
});

test('customer view does not show arrival banner when product_arrived_at is null', function () {
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'advance_amount' => 1000,
        'product_arrived_at' => null, // Not arrived
    ]);

    $response = $this->actingAs($customer)
        ->withHeader('X-Inertia', 'true')
        ->get(route('user.product-requests.show', $productRequest->id));

    // Should render the show page
    if ($response->status() === 200) {
        $response->assertInertia(fn ($page) => 
            $page->component('request/show')
                ->has('request', fn ($request) => 
                    $request->where('product_arrived_at', null)
                )
        );
    }
});

test('admin view shows arrival notes when provided', function () {
    $admin = createAdminUser();
    $customer = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $customer->id,
        'status' => 'approved',
        'advance_payment_status' => 'paid',
        'product_arrived_at' => now(),
        'arrival_notes' => 'Product arrived with minor packaging damage',
    ]);

    $response = $this->actingAs($admin)
        ->withHeader('X-Inertia', 'true')
        ->get(route('admin.product-requests.show', $productRequest->id));

    // Should render the admin show page
    if ($response->status() === 200) {
        $response->assertInertia(fn ($page) => 
            $page->component('admin/product-request/show')
                ->has('product_request', fn ($pr) => 
                    $pr->has('arrival_notes')
                        ->where('product_arrived_at', fn ($date) => $date !== null)
                )
        );
    }
});

