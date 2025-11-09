# Payment Rejection Breakage Tests

## Overview

This test suite provides comprehensive breakage tests for **Milestone 6: Payment Rejection Flow with Predefined Reasons & Retry Capability**. The tests are designed to validate the entire payment rejection workflow, including database schema, model relationships, business logic, authorization, and error handling.

## Running the Tests

```bash
# Run all payment rejection breakage tests
php artisan test --group=milestone-6-payment-rejection

# Run a specific test
php artisan test --group=milestone-6-payment-rejection --filter="customer can retry rejected payment"
```

## Test Coverage

### 1. Database Schema & Model Relationships (4 tests)
- ✅ Payment rejection reasons table structure
- ✅ Foreign key relationships
- ✅ Model relationships (bidirectional)
- ✅ Column constraints and data types

### 2. Rejection Reasons Model Scopes (3 tests)
- ✅ Active scope filtering
- ✅ Ordered scope sorting
- ✅ Payment type filtering (product_request vs normal_purchase)

### 3. Payment Rejection with Reasons (5 tests)
- ✅ Admin rejection with reason code
- ✅ Notification includes rejection reason
- ✅ Fallback to notes when no reason provided
- ✅ Validation (cannot reject approved/rejected payments)

### 4. Payment Retry Functionality (7 tests)
- ✅ Retry for product request advance payments
- ✅ Retry for product request final payments
- ✅ Validation (cannot retry non-rejected payments)
- ✅ Authorization (cannot retry others' payments)
- ✅ Order status reset
- ✅ Error handling for missing records

### 5. Admin Controller Rejection Flow (3 tests)
- ✅ Required rejection reason code validation
- ✅ Successful rejection with reason
- ✅ Invalid reason code validation

### 6. Bulk Actions (2 tests)
- ✅ Required rejection reason for bulk rejection
- ✅ Bulk rejection applies to all selected payments

### 7. API Endpoints (1 test)
- ✅ Active reasons filtered by payment type

### 8. Edge Cases & Error Handling (4 tests)
- ✅ Foreign key constraints
- ✅ Deletion validation
- ✅ Missing record handling
- ✅ Database constraint violations

### 9. Seeder Validation (2 tests)
- ✅ Default reasons creation
- ✅ Idempotency

## Test Statistics

- **Total Tests**: 30
- **Total Assertions**: 90
- **Test Group**: `milestone-6-payment-rejection`

## Key Test Scenarios

### Payment Rejection Flow
1. Admin selects rejection reason from dropdown
2. Optional notes can be added
3. Payment status updated to 'rejected'
4. Rejection reason stored in database
5. Customer notified with reason

### Payment Retry Flow
1. Customer sees rejected payment with reason
2. Customer clicks "Retry Payment"
3. Payment status reset to 'unseen' (ENUM constraint)
4. Product request payment status reset to 'pending'
5. Order status reset if cancelled
6. Customer redirected to payment page

### Edge Cases Tested
- Foreign key constraint violations
- Missing related records (product requests, orders)
- Invalid rejection reason codes
- Attempting to retry non-rejected payments
- Attempting to retry another customer's payment
- Bulk rejection operations
- Seeder idempotency

## Important Notes

### Database Constraints
- `admin_status` is an ENUM and cannot be NULL - retry sets it to 'unseen'
- `rejection_reason_code` has a foreign key constraint
- Order status enum: `['processing', 'shipped', 'delivered', 'cancelled']` - no 'pending'

### Route Model Binding
- Payment retry route uses `{payment}` parameter with route model binding
- `PaymentTransaction` model includes `resolveRouteBinding()` for proper resolution

### Test Helpers
- `createPaymentRejectionAdminUser()` - Creates admin user with Spatie permissions
- `createTestRejectionReason()` - Creates test rejection reason
- `createTestPaymentForRejection()` - Creates payment ready for rejection

## Dependencies

- Laravel Framework
- Pest PHP Testing Framework
- Spatie Laravel Permission (for admin role assignment)
- Database migrations and seeders

## Maintenance

When adding new rejection reasons or modifying the rejection flow:
1. Update the seeder if adding new default reasons
2. Add tests for new rejection scenarios
3. Update edge case tests if business logic changes
4. Ensure all tests pass before merging

