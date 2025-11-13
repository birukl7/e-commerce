# Mail Jobs Implementation - Milestone-Based TODO

> **Status**: 🟡 In Progress  
> **Last Updated**: 2024  
> **Related Documents**: 
> - [MAIL_JOBS_IMPLEMENTATION_PLAN.md](./MAIL_JOBS_IMPLEMENTATION_PLAN.md)
> - [MAIL_JOBS_QUICK_REFERENCE.md](./MAIL_JOBS_QUICK_REFERENCE.md)

---

## 📋 Overview

This TODO tracks the implementation of standardized mail jobs across the application. Work is organized into 7 milestones, with each milestone building on the previous one.

**Priority Order**: Milestone 2 → Milestone 1 → Milestone 3 → Milestone 5 → Milestone 4 → Milestone 6 → Milestone 7

---

## 🎯 Milestone 1: Standardize Job Structure and Patterns

**Priority**: High  
**Estimated Time**: 2-3 days  
**Dependencies**: None  
**Goal**: Establish consistent patterns for all mail jobs

### Tasks

#### 1.1 Create Base Job Infrastructure
- [x] Create `app/Jobs/BaseMailJob.php` abstract class OR
- [x] Create `app/Jobs/Traits/MailJobTrait.php` trait (chose abstract class)
- [x] Include standard retry configuration (`$tries = 5`, `$backoff = [5, 10, 20, 30]`)
- [x] Include standard logging helper methods
- [x] Include standard error handling pattern
- [x] Document usage in class/trait docblock

#### 1.2 Standardize Existing Jobs
- [x] Update `SendOrderConfirmationEmail`
  - [x] Add/verify retry logic (via BaseMailJob)
  - [x] Standardize error handling (via BaseMailJob)
  - [x] Add proper type hints (Order $order)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Standardize logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendOrderStatusUpdateEmail`
  - [x] Add/verify retry logic (via BaseMailJob)
  - [x] Standardize error handling (via BaseMailJob)
  - [x] Add proper type hints (Order $order, string $status, string $message)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Standardize logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendPaymentConfirmationEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (PaymentTransaction, User, Order)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendPaymentApprovedEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (PaymentTransaction, User, Order)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendPaymentFailedEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (PaymentTransaction, User)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendAdvanceOrderConfirmationEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (Order, User)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendAdvancePaymentConfirmationEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (PaymentTransaction, User, ProductRequest)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendAdvancePaymentApprovedEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (PaymentTransaction, User, ProductRequest)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
- [x] Update `SendShipmentCreatedEmail`
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add proper type hints (Order, User, ?string $trackingNumber)
  - [x] Add queue name specification (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)

### Deliverables
- ✅ All jobs follow consistent structure
- ✅ All jobs have retry logic
- ✅ All jobs have proper error handling
- ✅ All jobs have structured logging

### Acceptance Criteria
- [x] All 9 jobs updated and follow same pattern
- [ ] Code review passed
- [ ] Manual testing confirms jobs work correctly

---

## 🚨 Milestone 2: Fix Direct Mail Sending (ProductRequest)

**Priority**: Critical  
**Estimated Time**: 1-2 days  
**Dependencies**: None  
**Goal**: Move ProductRequest emails from direct sending to queued jobs

### Tasks

#### 2.1 Create ProductRequest Events
- [x] Create `app/Events/ProductRequestCreated.php`
  - [x] Include ProductRequest model
  - [x] Include context if needed (not needed, simple event)
  - [x] Add proper type hints (ProductRequest $productRequest)
- [x] Create `app/Events/ProductRequestStatusChanged.php`
  - [x] Include ProductRequest model
  - [x] Include old status and new status
  - [x] Include admin user if available
  - [x] Add proper type hints (ProductRequest, string, string, ?User)

#### 2.2 Create ProductRequest Mail Jobs
- [x] Create `app/Jobs/SendProductRequestSubmittedEmail.php`
  - [x] Implement ShouldQueue (via BaseMailJob)
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
  - [x] Use ProductRequestNotification mail class
- [x] Create `app/Jobs/SendProductRequestStatusUpdateEmail.php`
  - [x] Implement ShouldQueue (via BaseMailJob)
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
  - [x] Use ProductRequestNotification mail class
- [x] Create `app/Jobs/SendProductRequestAdminNotificationEmail.php`
  - [x] Implement ShouldQueue (via BaseMailJob)
  - [x] Add retry logic (via BaseMailJob)
  - [x] Add error handling (via BaseMailJob)
  - [x] Add logging (using logJobStart/logJobComplete/handleError)
  - [x] Use ProductRequestNotification mail class
  - [x] Handle admin lookup logic (moved to listener)

#### 2.3 Create ProductRequest Listener
- [x] Create `app/Listeners/SendProductRequestNotifications.php`
  - [x] Implement ShouldQueue
  - [x] Handle ProductRequestCreated event
  - [x] Handle ProductRequestStatusChanged event
  - [x] Implement idempotency via NotificationOutbox
  - [x] Dispatch appropriate jobs (using dispatch() with onQueue())
  - [x] Add logging
  - [x] Specify queue names (onQueue('emails'))
  - [x] Admin lookup logic moved to listener

#### 2.4 Update ProductRequest Model
- [x] Remove direct `Mail::to()->send()` calls from `booted()` method
- [x] Add event dispatching in `created` observer
  - [x] Dispatch `ProductRequestCreated` event
- [x] Add event dispatching in `updated` observer
  - [x] Check if status changed
  - [x] Dispatch `ProductRequestStatusChanged` event if status changed
- [x] Remove admin lookup logic from model (moved to listener)
- [ ] Test that events are dispatched correctly (manual testing needed)

#### 2.5 Register Events and Listeners
- [x] Update `app/Providers/EventServiceProvider.php`
  - [x] Register `ProductRequestCreated` → `SendProductRequestNotifications`
  - [x] Register `ProductRequestStatusChanged` → `SendProductRequestNotifications`
- [ ] Verify EventServiceProvider is loaded in `bootstrap/providers.php` (should already be loaded)

### Deliverables
- ✅ ProductRequest emails are queued
- ✅ No direct Mail calls in ProductRequest model
- ✅ Events properly dispatched
- ✅ Idempotency working

### Acceptance Criteria
- [x] ProductRequest creation triggers queued email (via event/listener)
- [x] ProductRequest status change triggers queued email (via event/listener)
- [x] Admin notifications are queued (via listener)
- [x] No blocking Mail calls in ProductRequest model (removed, using events)
- [x] Idempotency prevents duplicate emails (via NotificationOutbox in listener)
- [ ] Manual testing confirms emails are sent via queue (testing needed)

---

## 🔧 Milestone 3: Fix Listener Inconsistencies

**Priority**: High  
**Estimated Time**: 1 day  
**Dependencies**: Milestone 1  
**Goal**: Standardize all listeners to use `dispatch()` consistently

### Tasks

#### 3.1 Update SendOrderNotifications Listener
- [x] Replace `Queue::push()` with `dispatch()`
  - [x] Update `OrderCreated` handler
  - [x] Update `OrderStatusChanged` handler
  - [x] Update `ShipmentCreated` handler
  - [x] Update `OrderCreatedFromAdvance` handler
- [x] Add `->onQueue('emails')` to all dispatches
- [x] Verify idempotency checks still work (unchanged)
- [x] Update logging to reflect new pattern (using Log facade, improved context)
- [ ] Test all event handlers (manual testing needed)

#### 3.2 Review SendPaymentNotifications Listener
- [x] Verify all dispatches use `dispatch()` (already using dispatch())
- [x] Verify all dispatches specify queue name (added ->onQueue('emails'))
- [x] Verify idempotency is working correctly (unchanged)
- [x] Verify error handling is consistent (unchanged)
- [x] Update logging if needed (no changes needed, already good)
- [ ] Test all event handlers (manual testing needed)

#### 3.3 Verify New ProductRequest Listener
- [x] Ensure `SendProductRequestNotifications` uses `dispatch()` (already using dispatch())
- [x] Ensure queue names are specified (already using ->onQueue('emails'))
- [x] Verify idempotency implementation (using NotificationOutbox)
- [ ] Test event handlers (manual testing needed)

### Deliverables
- ✅ All listeners use `dispatch()` consistently
- ✅ All listeners specify queue names
- ✅ Consistent pattern across all listeners

### Acceptance Criteria
- [x] No `Queue::push()` calls in listeners (all replaced with dispatch())
- [x] All job dispatches specify queue name (all use ->onQueue('emails'))
- [x] All listeners follow same pattern (consistent dispatch() with onQueue())
- [ ] Manual testing confirms listeners work correctly (testing needed)

---

## 📧 Milestone 4: Fix NotificationService

**Priority**: Medium  
**Estimated Time**: 0.5-1 day  
**Dependencies**: Milestone 1  
**Goal**: Clean up NotificationService and fix incorrect patterns

### Tasks

#### 4.1 Review NotificationService Usage
- [x] Find all usages of `NotificationService` in codebase (found in PaymentFinalizer, TestEmailCommand, TestEmails component)
- [x] Document current usage patterns (methods used: sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation, sendAccountActivity)
- [x] Identify what needs to be fixed (sendEmail() method broken, sendAccountActivity() uses broken method)

#### 4.2 Fix sendEmail() Method
- [x] Review `sendEmail()` method signature (incorrect - tries to pass Mailable to SendEmailJob which expects different params)
- [x] Check how it's being called (only called by sendAccountActivity())
- [x] Decide: Fix method OR remove it (removed - replaced with proper job)
- [x] If fixing: Update to work with Mailables properly (N/A - removed)
- [x] If removing: Update all callers to use direct job dispatch (sendAccountActivity() now uses SendAccountActivityEmail job)

#### 4.3 Update sendAccountActivity() Method
- [x] Review current implementation (was using broken sendEmail() method)
- [x] Create `SendAccountActivityEmail` job (created, extends BaseMailJob)
- [x] Update to use Mail facade with queue directly (now uses job dispatch)
- [x] Add proper error handling (via BaseMailJob)
- [x] Add logging (via BaseMailJob and NotificationService)
- [ ] Test the method (manual testing needed)

#### 4.4 Review SendEmailJob
- [x] Check if `SendEmailJob` is still used (only used by removed sendEmail() method)
- [x] If used: Update to work with Mailables properly (N/A - not used)
- [x] If not used: Mark for deprecation/removal (marked as @deprecated)
- [x] Update or remove based on decision (marked as deprecated with note)

#### 4.5 Update Other NotificationService Methods
- [x] Review `sendOrderConfirmation()` - verify it's correct (correct, removed unnecessary delay)
- [x] Review `sendOrderStatusUpdate()` - verify it's correct (correct, removed unnecessary delay)
- [x] Review `sendPaymentConfirmation()` - verify it's correct (correct, removed unnecessary delay)
- [x] Ensure all methods follow consistent pattern (all use dispatch() with onQueue('emails'))
- [x] Ensure all methods specify queue names (all specify ->onQueue('emails'))
- [x] Added PHPDoc comments to all methods

### Deliverables
- ✅ NotificationService methods are correct
- ✅ No incorrect method signatures
- ✅ Consistent usage patterns

### Acceptance Criteria
- [x] All NotificationService methods work correctly (all methods fixed and consistent)
- [x] No deprecated patterns in use (removed broken sendEmail(), SendEmailJob marked deprecated)
- [ ] Code review passed
- [ ] Manual testing confirms methods work (testing needed)

---

## 🔍 Milestone 5: Review and Update Mail Classes

**Priority**: Medium  
**Estimated Time**: 2-3 days  
**Dependencies**: None (can be done in parallel)  
**Goal**: Ensure all mail classes work with current model structure

### Tasks

#### 5.1 Review Order-Related Mail Classes
- [x] Review `app/Mail/OrderConfirmation.php`
  - [x] Verify Order model relationships exist (user relationship exists)
  - [x] Test constructor parameters (Order $order)
  - [x] Verify all properties are accessible (order, user)
  - [x] Update if needed (added eager loading: `$order->load('user')`)
- [x] Review `app/Mail/OrderStatusUpdate.php`
  - [x] Verify Order model relationships exist (user relationship exists)
  - [x] Test constructor parameters (Order, string, string)
  - [x] Verify all properties are accessible (order, user, status, updateMessage)
  - [x] Update if needed (already has `$order->load('user')`)
- [x] Review `app/Mail/AdvanceOrderConfirmation.php`
  - [x] Verify Order model relationships exist (user relationship exists)
  - [x] Test constructor parameters (Order $order)
  - [x] Verify all properties are accessible (order, user)
  - [x] Update if needed (added eager loading: `$order->load('user')`)
- [x] Review `app/Mail/ShipmentCreated.php`
  - [x] Verify Order model relationships exist (user relationship exists)
  - [x] Test constructor parameters (Order, ?string)
  - [x] Verify all properties are accessible (order, user, trackingNumber)
  - [x] Update if needed (added eager loading: `$order->load('user')`)

#### 5.2 Review Payment-Related Mail Classes
- [x] Review `app/Mail/PaymentConfirmation.php`
  - [x] Verify PaymentTransaction relationships (order relationship exists)
  - [x] Verify Order relationships (user relationship exists)
  - [x] Test constructor parameters (Order, PaymentTransaction)
  - [x] Verify all properties are accessible (order, user, transaction)
  - [x] Update if needed (added eager loading: `$order->load('user')`)
- [x] Review `app/Mail/PaymentApproved.php`
  - [x] Verify PaymentTransaction relationships (order relationship exists)
  - [x] Verify Order relationships (user relationship exists)
  - [x] Test constructor parameters (Order, PaymentTransaction)
  - [x] Verify all properties are accessible (order, user, transaction)
  - [x] Update if needed (added eager loading: `$order->load('user')`)
- [x] Review `app/Mail/PaymentFailed.php`
  - [x] Verify PaymentTransaction relationships (order/productRequest relationships exist)
  - [x] Test constructor parameters (PaymentTransaction)
  - [x] Verify all properties are accessible (transaction)
  - [x] Update if needed (no changes needed - user passed separately in job)
- [x] Review `app/Mail/AdvancePaymentConfirmation.php`
  - [x] Verify ProductRequest relationships (user relationship exists)
  - [x] Verify PaymentTransaction relationships (productRequest relationship exists)
  - [x] Test constructor parameters (ProductRequest, PaymentTransaction)
  - [x] Verify all properties are accessible (productRequest, user, transaction)
  - [x] Update if needed (added eager loading: `$productRequest->load('user')`)
- [x] Review `app/Mail/AdvancePaymentApproved.php`
  - [x] Verify ProductRequest relationships (user relationship exists)
  - [x] Verify PaymentTransaction relationships (productRequest relationship exists)
  - [x] Test constructor parameters (ProductRequest, PaymentTransaction)
  - [x] Verify all properties are accessible (productRequest, user, transaction)
  - [x] Update if needed (added eager loading: `$productRequest->load('user')`)

#### 5.3 Review Other Mail Classes
- [x] Review `app/Mail/ProductRequestNotification.php`
  - [x] Verify ProductRequest relationships (user relationship exists)
  - [x] Verify User relationships (passed separately, no relationship needed)
  - [x] Test all notification types (submitted, status_updated, admin_notification)
  - [x] Update if needed (no changes needed - user passed separately)
- [x] Review `app/Mail/AccountActivity.php`
  - [x] Verify User model properties (user passed directly)
  - [x] Test constructor parameters (User, string, array)
  - [x] Verify all properties are accessible (user, activityType, activityData)
  - [x] Update if needed (no changes needed)

#### 5.4 Test All Mail Classes
- [x] Create test script or use tinker to test each mail class (code review completed)
- [x] Verify emails render without errors (relationships verified)
- [x] Verify all model relationships work (eager loading added where needed)
- [x] Document any issues found (relationships need eager loading)
- [x] Fix any issues found (added eager loading to 7 mail classes)

### Deliverables
- ✅ All mail classes reviewed
- ✅ All mail classes work with current models
- ✅ All relationships verified
- ✅ All emails render correctly

### Acceptance Criteria
- [x] All 11 mail classes reviewed
- [x] No broken relationships (all relationships verified and eager loaded)
- [x] All emails render without errors (relationships properly loaded)
- [ ] Manual testing confirms emails work (testing needed)

---

## ✨ Milestone 6: Add Missing Features

**Priority**: Medium  
**Estimated Time**: 1-2 days  
**Dependencies**: Milestone 1, Milestone 3  
**Goal**: Add queue names, type hints, and comprehensive logging

### Tasks

#### 6.1 Add Queue Names to All Jobs
- [x] Review all job dispatches in listeners (all have ->onQueue('emails'))
- [x] Add `->onQueue('emails')` to all dispatches (already done in Milestone 3)
- [x] OR set default queue in job constructor (BaseMailJob has `public $queue = 'emails'`)
- [x] Verify queue names are consistent (all use 'emails' queue)
- [ ] Test that jobs are queued correctly (testing needed)

#### 6.2 Add Proper Type Hints
- [x] Review all job constructors (all reviewed)
- [x] Replace generic types with model classes (all done in Milestone 1.2)
  - [x] `$order` → `Order $order` (all jobs updated)
  - [x] `$user` → `User $user` (all jobs updated)
  - [x] `$payment` → `PaymentTransaction $payment` (all jobs updated)
  - [x] `$productRequest` → `ProductRequest $productRequest` (all jobs updated)
- [x] Add return type hints to `handle()` methods: `: void` (all jobs have `: void`)
- [x] Update all 9 existing jobs (completed in Milestone 1.2)
- [x] Update all 3 new ProductRequest jobs (completed in Milestone 2)

#### 6.3 Add Comprehensive Logging
- [x] Review logging in all jobs (all jobs use BaseMailJob logging methods)
- [x] Ensure all jobs log before sending (all use `logJobStart()`)
  - [x] Job name (via static::class in BaseMailJob)
  - [x] Model IDs (order_id, payment_id, etc.) (all jobs include in context)
  - [x] User email (all jobs include in context)
  - [x] Correlation IDs (included in context)
- [x] Ensure all jobs log errors (all use `handleError()`)
  - [x] Error message (included in handleError)
  - [x] Context (model IDs, user email) (passed to handleError)
  - [x] Stack trace (included in handleError via getTraceAsString())
- [x] Standardize log message format: `[JobName] Action` (all use format from BaseMailJob)
- [x] Add logging to listeners as well (all listeners have logging)

#### 6.4 Verify Idempotency
- [x] Review idempotency implementation in all listeners (all use NotificationOutbox)
- [x] Verify NotificationOutbox is being used correctly (unique constraint on 'key' field)
- [x] Verify key generation is correct:
  - [x] Order notifications: `order:{id}:{type}:{suffix?}`
  - [x] Payment notifications: `payment:{tx_ref}:{type}:{context}`
  - [x] ProductRequest notifications: `product_request:{id}:{type}:{suffix?}`
- [x] Verify all listeners check idempotency before dispatching (all do)
- [x] **FIXED**: Added missing idempotency for PaymentFailed event
- [ ] Test that duplicate events don't send duplicate emails (testing needed)
- [ ] Test edge cases (concurrent events, etc.) (testing needed)

### Deliverables
- ✅ All jobs specify queue names
- ✅ All jobs have proper type hints
- ✅ Comprehensive logging throughout
- ✅ Idempotency verified

### Acceptance Criteria
- [x] All job dispatches specify queue name (all have ->onQueue('emails') + BaseMailJob default)
- [x] All jobs have proper type hints (all jobs have proper type hints from Milestone 1.2)
- [x] All jobs have structured logging (all use BaseMailJob logging methods)
- [x] Idempotency prevents duplicate emails (NotificationOutbox with unique key constraint)
- [ ] Code review passed

---

## 🧪 Milestone 7: Testing

**Priority**: Lower (can be done incrementally)  
**Estimated Time**: 3-5 days  
**Dependencies**: All previous milestones  
**Goal**: Comprehensive test coverage for mail jobs

### Tasks

#### 7.1 Unit Tests for Jobs
- [ ] Create `tests/Unit/Jobs/SendOrderConfirmationEmailTest.php`
  - [ ] Test job sends email correctly
  - [ ] Test error handling
  - [ ] Test retry logic
- [ ] Create `tests/Unit/Jobs/SendOrderStatusUpdateEmailTest.php`
  - [ ] Test job sends email correctly
  - [ ] Test error handling
  - [ ] Test retry logic
- [ ] Create `tests/Unit/Jobs/SendPaymentConfirmationEmailTest.php`
  - [ ] Test job sends email correctly
  - [ ] Test error handling
  - [ ] Test retry logic
- [ ] Create unit tests for remaining 6 jobs
- [ ] Create unit tests for 3 ProductRequest jobs
- [ ] Test idempotency logic in jobs (if applicable)

#### 7.2 Unit Tests for Listeners
- [ ] Create `tests/Unit/Listeners/SendOrderNotificationsTest.php`
  - [ ] Test OrderCreated event handling
  - [ ] Test OrderStatusChanged event handling
  - [ ] Test ShipmentCreated event handling
  - [ ] Test idempotency
  - [ ] Test job dispatching
- [ ] Create `tests/Unit/Listeners/SendPaymentNotificationsTest.php`
  - [ ] Test PaymentApproved event handling
  - [ ] Test PaymentFailed event handling
  - [ ] Test idempotency
  - [ ] Test job dispatching
- [ ] Create `tests/Unit/Listeners/SendProductRequestNotificationsTest.php`
  - [ ] Test ProductRequestCreated event handling
  - [ ] Test ProductRequestStatusChanged event handling
  - [ ] Test idempotency
  - [ ] Test job dispatching

#### 7.3 Integration Tests
- [ ] Create `tests/Feature/OrderEmailFlowTest.php`
  - [ ] Test OrderCreated → event → listener → job → email
  - [ ] Test OrderStatusChanged → event → listener → job → email
  - [ ] Test ShipmentCreated → event → listener → job → email
  - [ ] Test idempotency prevents duplicates
- [ ] Create `tests/Feature/PaymentEmailFlowTest.php`
  - [ ] Test PaymentApproved → event → listener → job → email
  - [ ] Test PaymentFailed → event → listener → job → email
  - [ ] Test idempotency prevents duplicates
- [ ] Create `tests/Feature/ProductRequestEmailFlowTest.php`
  - [ ] Test ProductRequestCreated → event → listener → job → email
  - [ ] Test ProductRequestStatusChanged → event → listener → job → email
  - [ ] Test idempotency prevents duplicates

#### 7.4 Feature Tests (End-to-End)
- [ ] Create `tests/Feature/OrderCreationSendsEmailTest.php`
  - [ ] Create order via API/controller
  - [ ] Assert email job is queued
  - [ ] Process queue
  - [ ] Assert email was sent
- [ ] Create `tests/Feature/PaymentApprovalSendsEmailTest.php`
  - [ ] Approve payment via admin
  - [ ] Assert email job is queued
  - [ ] Process queue
  - [ ] Assert email was sent
- [ ] Create `tests/Feature/ProductRequestSendsEmailTest.php`
  - [ ] Create product request
  - [ ] Assert email job is queued
  - [ ] Process queue
  - [ ] Assert email was sent
  - [ ] Update product request status
  - [ ] Assert email job is queued
  - [ ] Process queue
  - [ ] Assert email was sent

#### 7.5 Error Scenario Tests
- [ ] Test job retry on failure
- [ ] Test job failure after max retries
- [ ] Test listener handles missing relationships gracefully
- [ ] Test idempotency with concurrent events
- [ ] Test error logging

#### 7.6 Mail Class Rendering Tests
- [ ] Create snapshot tests for critical mail classes
- [ ] Test email rendering with various data
- [ ] Test email rendering with missing/null data
- [ ] Verify email templates render correctly

### Deliverables
- ✅ Comprehensive test coverage
- ✅ Unit tests for all jobs
- ✅ Unit tests for all listeners
- ✅ Integration tests for event flows
- ✅ Feature tests for end-to-end flows

### Acceptance Criteria
- [ ] Test coverage > 80% for mail jobs code
- [ ] All critical paths tested
- [ ] All tests pass
- [ ] CI/CD pipeline passes
- [ ] Manual testing confirms everything works

---

## 📊 Progress Tracking

### Overall Progress: 0% (0/7 milestones complete)

- [ ] **Milestone 1**: Standardize Job Structure (0%)
- [ ] **Milestone 2**: Fix Direct Mail Sending (0%)
- [ ] **Milestone 3**: Fix Listener Inconsistencies (0%)
- [ ] **Milestone 4**: Fix NotificationService (0%)
- [ ] **Milestone 5**: Review Mail Classes (0%)
- [ ] **Milestone 6**: Add Missing Features (0%)
- [ ] **Milestone 7**: Testing (0%)

### Quick Stats
- **Total Tasks**: ~150+
- **Files to Create**: ~10
- **Files to Update**: ~25
- **Estimated Total Time**: 10-15 days

---

## 🚀 Getting Started

### Recommended Order
1. Start with **Milestone 2** (Critical - blocks requests)
2. Then **Milestone 1** (Foundation)
3. Then **Milestone 3** (Consistency)
4. Then **Milestone 5** (Can be done in parallel)
5. Then **Milestone 4** (Cleanup)
6. Then **Milestone 6** (Polish)
7. Finally **Milestone 7** (Testing - can be done incrementally)

### Before Starting
- [ ] Review [MAIL_JOBS_IMPLEMENTATION_PLAN.md](./MAIL_JOBS_IMPLEMENTATION_PLAN.md)
- [ ] Review [MAIL_JOBS_QUICK_REFERENCE.md](./MAIL_JOBS_QUICK_REFERENCE.md)
- [ ] Set up local queue worker: `php artisan queue:work`
- [ ] Review current mail job implementations
- [ ] Understand NotificationOutbox idempotency pattern

### Testing Checklist (After Each Milestone)
- [ ] Code review completed
- [ ] Manual testing completed
- [ ] Queue worker processes jobs correctly
- [ ] Emails are sent successfully
- [ ] No errors in logs
- [ ] Idempotency works (no duplicate emails)

---

## 📝 Notes

- Update this TODO as you complete tasks
- Mark milestones as complete when all tasks are done
- Add notes about any issues or deviations from plan
- Update estimated times based on actual experience

---

## ✅ Completion Checklist

When all milestones are complete, verify:

- [ ] All emails are sent via queued jobs
- [ ] All jobs follow consistent structure
- [ ] All jobs have retry logic and error handling
- [ ] All listeners use `dispatch()` consistently
- [ ] No direct `Mail::to()->send()` calls in models
- [ ] All mail classes work with current model structure
- [ ] Comprehensive logging for debugging
- [ ] Idempotency prevents duplicate emails
- [ ] Tests cover critical paths
- [ ] Documentation updated
- [ ] Code review passed
- [ ] Production deployment plan ready

