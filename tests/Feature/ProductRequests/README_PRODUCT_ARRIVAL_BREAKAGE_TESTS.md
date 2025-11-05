# Product Arrival Breakage Tests

## Overview

This test suite contains comprehensive breaking tests for the Product Arrival feature. These tests are designed to find edge cases, validation failures, authorization issues, data integrity problems, and potential bugs in the product arrival workflow.

## Test Group

**Group Name**: `product-arrival-breakage`

**Run Command**:
```bash
php artisan test --group=product-arrival-breakage
```

## Test Categories

### 1. Authorization Breakage Tests
Tests that verify unauthorized access is properly blocked:
- Non-admin users cannot mark products as arrived
- Regular users cannot mark their own products as arrived
- Unauthenticated users are blocked

### 2. Validation Breakage Tests
Tests that verify validation rules are enforced:
- Cannot mark arrived when request is not approved
- Cannot mark arrived when advance payment is not paid
- Cannot mark arrived when request is rejected
- Cannot mark arrived when customer lost interest
- Invalid date format rejection
- Arrival notes exceeding max length

### 3. Data Integrity Breakage Tests
Tests that verify data consistency and integrity:
- Multiple markings overwrite previous data correctly
- Null values are preserved when notes are not provided
- Workflow status updates correctly

### 4. Notification Breakage Tests
Tests that verify notification behavior:
- Duplicate notifications when marking multiple times
- No duplicate notifications when completing procurement after arrival
- Notifications sent even when final payment is already paid

### 5. Workflow Breakage Tests
Tests that verify workflow state transitions:
- Marking arrived before procurement starts
- Marking arrived during procurement (doesn't affect procurement)
- Completing procurement preserves existing arrival data

### 6. Edge Case Breakage Tests
Tests that verify edge case handling:
- Future dates allowed
- Past dates allowed
- Default timestamp when no date provided
- Empty string notes converted to null
- Final payment availability updates

### 7. Concurrency Breakage Tests
Tests that expose race conditions:
- Multiple admins marking simultaneously

### 8. UI/Data Display Breakage Tests
Tests that verify frontend data display:
- Customer view shows arrival banner
- Customer view hides banner when not arrived
- Admin view shows arrival notes

## Expected Behaviors vs. Potential Issues

### ✅ Expected Behaviors (Should Pass)
1. Authorization properly blocks unauthorized access
2. Validation prevents invalid states
3. Data integrity is maintained
4. Workflow status updates correctly

### ⚠️ Potential Issues (Tests May Fail)
1. **Duplicate Notifications**: Marking product as arrived multiple times may send duplicate notifications
2. **Race Conditions**: Concurrent marking by multiple admins may cause data inconsistency
3. **Future Dates**: System may not validate against future dates (intentional per design)
4. **Overwriting Data**: Multiple markings may overwrite previous arrival data (expected behavior)

## Test Coverage

- **Authorization**: 3 tests
- **Validation**: 6 tests
- **Data Integrity**: 3 tests
- **Notifications**: 3 tests
- **Workflow**: 3 tests
- **Edge Cases**: 6 tests
- **Concurrency**: 1 test
- **UI/Display**: 3 tests

**Total**: 28 breaking tests

## Running Specific Test Categories

While all tests are grouped under `product-arrival-breakage`, you can run individual tests:

```bash
# Run a specific test
php artisan test --filter="non_admin_user_cannot_mark_product_as_arrived"

# Run authorization tests only (using filter)
php artisan test --filter="authorization|cannot_mark" --group=product-arrival-breakage

# Run validation tests only
php artisan test --filter="validation|cannot_mark" --group=product-arrival-breakage
```

## Notes

- These are **breaking tests** - they're designed to find issues, not necessarily pass
- Some tests may intentionally fail to expose potential bugs
- Tests use `Notification::fake()` to prevent actual notifications during testing
- Tests use `RefreshDatabase` to ensure clean state between tests
- Admin role assignment uses Spatie Permission if available, gracefully handles if not

## Related Test Files

- `ProductRequestBreakageTest.php` - General product request breakage tests
- `ProductRequestPaymentBreakageTest.php` - Payment-related breakage tests
- `StatusDisplayBreakageTest.php` - Status display breakage tests

