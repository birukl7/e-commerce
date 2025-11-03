# Willingness Payment Sync Breakage Tests

## Overview
These tests are designed to find vulnerabilities in the willingness confirmation → payment → status synchronization flow. They specifically target the bug where customers see "Pay Advance" button even after they've already paid.

## Running the Tests

### Backend Tests
```bash
php artisan test --group=willingness-payment-sync
```

### Frontend Tests
```bash
npm test -- --group=willingness-payment-sync
# or with Vitest
npm run test:unit -- --grep="willingness-payment-sync"
```

## Bug Found

### Primary Bug Location
**File:** `app/Models/ProductRequest.php`  
**Method:** `getWorkflowStatus()`  
**Line:** ~376

### The Bug
The `getWorkflowStatus()` method checks if `advance_payment_status !== 'paid'` but does NOT check for `'processing'` status. This means:

1. Customer confirms willingness
2. Customer pays advance (via Chapa or offline)
3. Status is set to `'processing'` (awaiting admin approval)
4. `getWorkflowStatus()` still returns `'awaiting_advance_payment'` because it only checks for `!== 'paid'`
5. UI shows "Pay Advance" button incorrectly

### Test That Catches It
`test('workflow status incorrect after payment processing - BUG FOUND')`

## Test Coverage

### Backend Tests
1. ✅ After paying advance via Chapa, requests page still shows pay advance button
2. ✅ After paying advance via offline, requests page still shows pay advance button
3. ✅ Request show page shows pay advance button after payment processing
4. ✅ `requiresAdvancePayment` returns true when status is processing
5. ✅ Status not refreshed when viewing request after payment
6. ✅ Customer can pay advance twice if status not synced
7. ❌ **Workflow status incorrect after payment processing** ← BUG FOUND
8. ✅ Chapa webhook updates status but page cache shows old status
9. ✅ Multiple rapid payment attempts create duplicate transactions
10. ✅ Request show page does not refresh status after payment callback

### Frontend Tests
- UI state management validation
- State synchronization checks
- Race condition detection
- Status display logic verification
- Data freshness validation

## Expected Fix

In `app/Models/ProductRequest.php`, the `getWorkflowStatus()` method should check for `'processing'` status:

```php
// Current (BUGGY):
$advanceStatus = $this->advance_payment_status ?? 'pending';
if ($advanceStatus !== 'paid') {
    return 'awaiting_advance_payment'; // WRONG - doesn't check 'processing'
}

// Should be:
$advanceStatus = $this->advance_payment_status ?? 'pending';
if ($advanceStatus === 'processing') {
    return 'awaiting_admin_approval'; // Or appropriate status
}
if ($advanceStatus !== 'paid') {
    return 'awaiting_advance_payment';
}
```

## Related Issues

1. `requiresAdvancePayment()` already correctly excludes `'processing'` status
2. UI components may also need to check `'processing'` status
3. Request dashboard action button calculation needs fixing

