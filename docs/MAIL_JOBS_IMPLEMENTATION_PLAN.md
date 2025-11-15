# Comprehensive Mail Jobs Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to standardize, revise, and implement mail jobs throughout the application. The current implementation has inconsistencies, some outdated code, and direct mail sending that should be queued. This plan addresses all these issues systematically.

## Current State Analysis

### ✅ What's Working Well
1. **Event-Driven Architecture**: Events (`OrderCreated`, `PaymentApproved`, etc.) are properly defined
2. **Listener Structure**: `SendOrderNotifications` and `SendPaymentNotifications` listeners exist
3. **Idempotency**: `NotificationOutbox` model exists for deduplication
4. **Queue Infrastructure**: Queue system is configured and working
5. **Mail Classes**: Most mail classes exist in `app/Mail/`

### ❌ Issues Identified

#### 1. **Inconsistent Job Dispatching**
- `SendOrderNotifications` uses `Queue::push()` (deprecated pattern)
- `SendPaymentNotifications` uses `dispatch()` (correct)
- `NotificationService` uses `dispatch()` but with delays
- Direct `Mail::to()->send()` calls in `ProductRequest` model boot methods

#### 2. **Inconsistent Job Structure**
- Some jobs have retry logic (`$tries`, `$backoff`) - `SendOrderConfirmationEmail`, `SendOrderStatusUpdateEmail`
- Others don't have retry logic - `SendAdvanceOrderConfirmationEmail`, `SendShipmentCreatedEmail`, etc.
- Inconsistent error handling and logging
- Some jobs use `public` properties, others use `protected`

#### 3. **Direct Mail Sending (Not Queued)**
- `ProductRequest` model sends emails directly in `booted()` method
- This blocks requests and doesn't use queue system
- No error handling or retry logic

#### 4. **Outdated Job Implementation**
- `SendEmailJob` uses old `Mail::send()` closure pattern instead of Mailables
- `NotificationService::sendEmail()` has incorrect signature (expects mailable but passes differently)

#### 5. **Missing Standardization**
- No consistent pattern for job properties (public vs protected)
- No consistent error handling pattern
- No consistent logging pattern
- Missing queue name specification in some jobs

#### 6. **Model Relationships**
- Jobs may be using outdated model relationships
- Need to verify all relationships still exist and work correctly

## Implementation Plan

### Phase 1: Standardize Job Structure and Patterns

#### 1.1 Create Base Job Trait/Interface
**Goal**: Establish consistent patterns for all mail jobs

**Tasks**:
- Create a base trait `MailJobTrait` with common functionality:
  - Standard retry configuration (`$tries = 5`, `$backoff = [5, 10, 20, 30]`)
  - Standard logging pattern
  - Standard error handling
  - Queue name specification (`onQueue('emails')`)
- Or create an abstract base class `BaseMailJob` that all mail jobs extend

**Files to Create**:
- `app/Jobs/Traits/MailJobTrait.php` OR
- `app/Jobs/BaseMailJob.php`

#### 1.2 Standardize All Existing Jobs
**Goal**: Update all mail jobs to follow consistent pattern

**Jobs to Update**:
1. `SendOrderConfirmationEmail` ✅ (has retry logic, needs standardization)
2. `SendOrderStatusUpdateEmail` ✅ (has retry logic, needs standardization)
3. `SendPaymentConfirmationEmail` ❌ (needs retry logic)
4. `SendPaymentApprovedEmail` ❌ (needs retry logic, error handling)
5. `SendPaymentFailedEmail` ❌ (needs retry logic, error handling)
6. `SendAdvanceOrderConfirmationEmail` ❌ (needs retry logic, error handling)
7. `SendAdvancePaymentConfirmationEmail` ❌ (needs retry logic, error handling)
8. `SendAdvancePaymentApprovedEmail` ❌ (needs retry logic, error handling)
9. `SendShipmentCreatedEmail` ❌ (needs retry logic, error handling)

**Standard Pattern**:
```php
class SendXxxEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $tries = 5;
    public $backoff = [5, 10, 20, 30];
    
    public function __construct(
        public $model, // Use proper type hints
        public $user,
        // ... other params
    ) {}
    
    public function handle(): void
    {
        \Log::info('[JobName] Handling job', [
            'model_id' => $this->model->id,
            'user_email' => $this->user->email ?? null,
        ]);
        
        try {
            Mail::to($this->user->email)
                ->onQueue('emails')
                ->send(new XxxMail($this->model, ...));
        } catch (\Throwable $e) {
            \Log::error('[JobName] Send failed', [
                'model_id' => $this->model->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw for queue retry mechanism
        }
    }
}
```

### Phase 2: Fix Direct Mail Sending

#### 2.1 Create ProductRequest Mail Jobs
**Goal**: Move ProductRequest emails to queued jobs

**Tasks**:
1. Create `SendProductRequestSubmittedEmail` job
2. Create `SendProductRequestStatusUpdateEmail` job
3. Create `SendProductRequestAdminNotificationEmail` job (for admin notifications)
4. Create `ProductRequestCreated` event
5. Create `ProductRequestStatusChanged` event
6. Create `SendProductRequestNotifications` listener
7. Update `ProductRequest` model to dispatch events instead of sending emails directly

**Files to Create**:
- `app/Jobs/SendProductRequestSubmittedEmail.php`
- `app/Jobs/SendProductRequestStatusUpdateEmail.php`
- `app/Jobs/SendProductRequestAdminNotificationEmail.php`
- `app/Events/ProductRequestCreated.php`
- `app/Events/ProductRequestStatusChanged.php`
- `app/Listeners/SendProductRequestNotifications.php`

**Files to Update**:
- `app/Models/ProductRequest.php` - Remove direct Mail calls, add event dispatching
- `app/Providers/EventServiceProvider.php` - Register new events/listeners

### Phase 3: Fix Listener Inconsistencies

#### 3.1 Update SendOrderNotifications Listener
**Goal**: Use `dispatch()` instead of `Queue::push()`

**Current Issues**:
- Uses `Queue::push()` which is less flexible
- Should use `dispatch()` for consistency
- Should specify queue name

**Changes**:
```php
// OLD
Queue::push(new SendOrderConfirmationEmail($order));

// NEW
SendOrderConfirmationEmail::dispatch($order)
    ->onQueue('emails');
```

#### 3.2 Standardize All Listeners
**Goal**: Ensure all listeners follow same pattern

**Listeners to Review**:
- `SendOrderNotifications` - Update to use `dispatch()`
- `SendPaymentNotifications` - Already uses `dispatch()`, verify consistency
- `SendProductRequestNotifications` - New listener, follow pattern

### Phase 4: Fix NotificationService

#### 4.1 Update NotificationService
**Goal**: Fix incorrect method signature and usage

**Current Issue**:
- `sendEmail()` method signature doesn't match usage
- `SendEmailJob` uses old pattern

**Tasks**:
1. Either fix `SendEmailJob` to work with Mailables properly
2. Or remove `sendEmail()` method and use direct job dispatching
3. Update `sendAccountActivity()` to use proper job dispatch

**Decision**: Since we have specific jobs for each email type, we should:
- Keep `NotificationService` for convenience methods
- Remove generic `sendEmail()` method
- Update `sendAccountActivity()` to dispatch a specific job or use Mail facade directly with queue

### Phase 5: Review and Update Mail Classes

#### 5.1 Verify All Mail Classes Work with Current Models
**Goal**: Ensure all mail classes use correct model relationships and properties

**Mail Classes to Review**:
1. `OrderConfirmation` - Verify Order model relationships
2. `OrderStatusUpdate` - Verify Order model relationships
3. `PaymentConfirmation` - Verify PaymentTransaction and Order relationships
4. `PaymentApproved` - Verify PaymentTransaction and Order relationships
5. `PaymentFailed` - Verify PaymentTransaction relationships
6. `AdvanceOrderConfirmation` - Verify Order relationships
7. `AdvancePaymentConfirmation` - Verify ProductRequest and PaymentTransaction relationships
8. `AdvancePaymentApproved` - Verify ProductRequest and PaymentTransaction relationships
9. `ShipmentCreated` - Verify Order relationships
10. `ProductRequestNotification` - Verify ProductRequest relationships
11. `AccountActivity` - Verify User model

**Tasks**:
- Check each mail class constructor
- Verify all model relationships exist
- Test that all properties are accessible
- Update any outdated property access

### Phase 6: Add Missing Features

#### 6.1 Add Queue Name to All Jobs
**Goal**: Ensure all jobs specify queue name for better queue management

**Tasks**:
- Add `->onQueue('emails')` to all job dispatches
- Or set default queue in job constructor using `$this->onQueue('emails')`

#### 6.2 Add Proper Type Hints
**Goal**: Improve code quality and IDE support

**Tasks**:
- Add proper type hints to all job constructors
- Use model classes instead of generic types
- Add return type hints to `handle()` methods

#### 6.3 Add Comprehensive Logging
**Goal**: Better observability and debugging

**Tasks**:
- Add structured logging before sending
- Add error logging with context
- Include correlation IDs (order_id, payment_id, etc.)

### Phase 7: Testing Strategy

#### 7.1 Unit Tests
**Goal**: Test individual job functionality

**Tests to Create**:
- Test each job handles email sending correctly
- Test error handling and retry logic
- Test idempotency checks
- Test listener routing

#### 7.2 Integration Tests
**Goal**: Test event → listener → job flow

**Tests to Create**:
- Test OrderCreated event triggers correct job
- Test PaymentApproved event triggers correct job
- Test ProductRequestCreated event triggers correct job
- Test idempotency prevents duplicate sends

#### 7.3 Feature Tests
**Goal**: Test end-to-end email sending

**Tests to Create**:
- Test order creation sends confirmation email
- Test payment approval sends email
- Test status change sends email
- Test ProductRequest submission sends emails

## Implementation Checklist

### Phase 1: Standardize Job Structure
- [ ] Create base job trait/class
- [ ] Update `SendOrderConfirmationEmail` to use standard pattern
- [ ] Update `SendOrderStatusUpdateEmail` to use standard pattern
- [ ] Update `SendPaymentConfirmationEmail` to use standard pattern
- [ ] Update `SendPaymentApprovedEmail` to use standard pattern
- [ ] Update `SendPaymentFailedEmail` to use standard pattern
- [ ] Update `SendAdvanceOrderConfirmationEmail` to use standard pattern
- [ ] Update `SendAdvancePaymentConfirmationEmail` to use standard pattern
- [ ] Update `SendAdvancePaymentApprovedEmail` to use standard pattern
- [ ] Update `SendShipmentCreatedEmail` to use standard pattern

### Phase 2: Fix Direct Mail Sending
- [ ] Create `ProductRequestCreated` event
- [ ] Create `ProductRequestStatusChanged` event
- [ ] Create `SendProductRequestSubmittedEmail` job
- [ ] Create `SendProductRequestStatusUpdateEmail` job
- [ ] Create `SendProductRequestAdminNotificationEmail` job
- [ ] Create `SendProductRequestNotifications` listener
- [ ] Update `ProductRequest` model to dispatch events
- [ ] Register events/listeners in `EventServiceProvider`

### Phase 3: Fix Listener Inconsistencies
- [ ] Update `SendOrderNotifications` to use `dispatch()`
- [ ] Verify `SendPaymentNotifications` consistency
- [ ] Ensure all listeners specify queue names

### Phase 4: Fix NotificationService
- [ ] Review `NotificationService` usage
- [ ] Fix or remove `sendEmail()` method
- [ ] Update `sendAccountActivity()` method
- [ ] Consider deprecating `SendEmailJob` if not needed

### Phase 5: Review Mail Classes
- [ ] Review `OrderConfirmation` mail class
- [ ] Review `OrderStatusUpdate` mail class
- [ ] Review `PaymentConfirmation` mail class
- [ ] Review `PaymentApproved` mail class
- [ ] Review `PaymentFailed` mail class
- [ ] Review `AdvanceOrderConfirmation` mail class
- [ ] Review `AdvancePaymentConfirmation` mail class
- [ ] Review `AdvancePaymentApproved` mail class
- [ ] Review `ShipmentCreated` mail class
- [ ] Review `ProductRequestNotification` mail class
- [ ] Review `AccountActivity` mail class

### Phase 6: Add Missing Features
- [ ] Add queue names to all job dispatches
- [ ] Add proper type hints to all jobs
- [ ] Add comprehensive logging to all jobs
- [ ] Verify idempotency is working correctly

### Phase 7: Testing
- [ ] Write unit tests for all jobs
- [ ] Write integration tests for event/listener flow
- [ ] Write feature tests for end-to-end flows
- [ ] Test error scenarios and retry logic
- [ ] Test idempotency prevents duplicates

## Priority Order

### High Priority (Do First)
1. **Phase 2**: Fix ProductRequest direct mail sending (blocks requests)
2. **Phase 1**: Standardize job structure (foundation for everything)
3. **Phase 3**: Fix listener inconsistencies (affects all order/payment emails)

### Medium Priority
4. **Phase 5**: Review mail classes (ensure they work with current code)
5. **Phase 4**: Fix NotificationService (cleanup)
6. **Phase 6**: Add missing features (improvements)

### Lower Priority (Can be done incrementally)
7. **Phase 7**: Testing (important but can be done alongside implementation)

## Code Review Checklist

When reviewing each job/listener/mail class, verify:

- [ ] Uses `dispatch()` not `Queue::push()`
- [ ] Has retry logic (`$tries`, `$backoff`)
- [ ] Has proper error handling with logging
- [ ] Specifies queue name (`onQueue('emails')`)
- [ ] Has proper type hints
- [ ] Uses correct model relationships
- [ ] Includes structured logging
- [ ] Handles null/empty cases gracefully
- [ ] Follows consistent naming conventions
- [ ] Is idempotent (via NotificationOutbox)

## Migration Strategy

### Step 1: Create New Jobs/Events (Non-Breaking)
- Create new ProductRequest events and jobs
- Don't remove old code yet
- Test new code in parallel

### Step 2: Update Existing Jobs (Low Risk)
- Update job structure one at a time
- Test each job after update
- Keep old and new code working

### Step 3: Switch to New Code (Breaking)
- Update listeners to use new patterns
- Update ProductRequest model to use events
- Remove old direct mail sending

### Step 4: Cleanup
- Remove deprecated code
- Remove unused `SendEmailJob` if not needed
- Update documentation

## Notes

- All jobs should be queued (implement `ShouldQueue`)
- All jobs should have retry logic
- All jobs should log before and after sending
- All jobs should handle errors gracefully
- All email sending should go through jobs, never directly
- All events should be idempotent via NotificationOutbox
- Queue name should always be specified for better management

## Success Criteria

- ✅ All emails are sent via queued jobs
- ✅ All jobs follow consistent structure
- ✅ All jobs have retry logic and error handling
- ✅ All listeners use `dispatch()` consistently
- ✅ No direct `Mail::to()->send()` calls in models
- ✅ All mail classes work with current model structure
- ✅ Comprehensive logging for debugging
- ✅ Idempotency prevents duplicate emails
- ✅ Tests cover critical paths

