# Status Display Breakage Tests

## Overview
These tests verify that both **ADMIN** and **CUSTOMER** views correctly display status after Chapa advance payment. Specifically, they ensure that when `advance_payment_status = 'processing'`, both views show "Awaiting Admin Approval" instead of "Awaiting Advance Payment".

## Running the Tests

```bash
# Run all status display breakage tests
php artisan test --group=status-display-breakage

# Run with verbose output
php artisan test --group=status-display-breakage --verbose
```

## Test Coverage

### Admin View Tests (4 tests)
1. ✅ **admin view shows wrong status after chapa advance payment** - Verifies admin view shows correct workflow_status
2. ✅ **admin view shows awaiting advance payment when status is processing** - Verifies workflow_status calculation
3. ✅ **admin view workflow status not refreshed after payment** - Verifies refresh logic in controller
4. ✅ **admin view shows warning when payment is processing** - Verifies badge display logic

### Customer View Tests (4 tests)
5. ✅ **customer view shows wrong status after chapa advance payment** - Verifies customer view shows correct status
6. ✅ **customer requests list shows wrong status after payment** - Verifies requests list display
7. ✅ **customer view shows pay advance button when status is processing** - Verifies requiresAdvancePayment() logic
8. ✅ **customer view status not updated after payment return** - Verifies status update after payment return

### Workflow Status Calculation Tests (3 tests)
9. ✅ **workflow status calculation bug when payment is processing** - Core logic test
10. ✅ **workflow status returns awaiting advance when status is null or pending** - Edge case handling
11. ✅ **workflow status returns awaiting advance when status is pending** - Normal flow test

### Status Synchronization Tests (4 tests)
12. ✅ **status mismatch between payment transaction and product request** - Verifies paymentReturn() updates status
13. ✅ **status update timing issue between webhook and views** - Verifies both views show correct status
14. ✅ **database state vs displayed state mismatch** - Verifies data integrity
15. ✅ **status display consistency across all views** - Verifies consistency

## What These Tests Verify

1. **When `advance_payment_status = 'processing'`:**
   - ✅ `workflow_status` = `'awaiting_admin_approval'` (NOT `'awaiting_advance_payment'`)
   - ✅ Admin view shows "Awaiting Admin Approval"
   - ✅ Customer view shows "Awaiting Admin Approval"
   - ✅ "Pay Advance" button is hidden
   - ✅ Warning badge shows "Willingness confirmed + Advance Payment Pending"

2. **Status Synchronization:**
   - ✅ Payment return updates status to 'processing'
   - ✅ Both views refresh and show latest status
   - ✅ Database state matches displayed state

3. **Edge Cases:**
   - ✅ Handles null/pending status correctly
   - ✅ Handles timing issues between webhook and views
   - ✅ Handles 409 (Inertia version mismatch) responses

## Test Results
All 15 tests passing with 26 assertions.

