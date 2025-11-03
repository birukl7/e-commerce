# Product Request Payment Breakage Tests

## Overview

These are harsh, basic functionality tests designed to break the product request payment feature. They test edge cases, race conditions, authorization issues, and UI/UX problems.

## Running the Tests

### Backend Tests (PHP/Pest)

```bash
# Run all breakage tests
php artisan test --group=product-request-payment-breakage

# Run a specific test
php artisan test --filter="advance payment redirects to wrong page"
```

### Frontend Tests (TypeScript/Vitest)

**Note:** Frontend tests require setup. See `tests/Frontend/ProductRequestPaymentBreakage.test.tsx` for instructions.

```bash
# Once set up, run frontend tests
npm run test:frontend -- --group=product-request-payment-breakage
```

## Test Categories

### 1. Advance Payment Edge Cases
- Wrong redirect pages (should go to product request pages, not order pages)
- Payment without willingness confirmation
- Status synchronization after payment
- Duplicate payment prevention

### 2. Final Payment Edge Cases
- Final payment before advance is paid
- Wrong redirect pages
- Status synchronization

### 3. Offline Payment Edge Cases
- Wrong success page redirects for advance/final payments
- Payment type detection

### 4. Payment Failure Handling
- Correct failure pages for product requests (not generic failure pages)
- Proper error messaging

### 5. Status Synchronization
- UI shows correct status immediately after payment
- "Pay Advance" button hidden when payment is processing/paid
- Pending approval messages display correctly

### 6. Authorization
- Users cannot access other users' payments
- Unauthenticated users are blocked

### 7. Admin Approval
- Admin can see product request payment details
- Approval correctly updates product request status

### 8. Missing Data
- Graceful handling when product request is deleted
- Proper detection when product_request_id is missing but tx_ref prefix exists

### 9. Race Conditions
- Concurrent payment processing
- Duplicate payment prevention

### 10. UI Navigation
- All pages use "Back to Product Request" not "Back to Orders"
- Consistent navigation across all product request payment pages

## Expected Failures

These tests are designed to catch issues. If they pass, the feature is robust. If they fail, they highlight specific problems to fix.

## Adding New Tests

When adding new breakage tests:
1. Use the group: `uses()->group('product-request-payment-breakage')`
2. Name tests descriptively: `test('what breaks when...', function() {})`
3. Test edge cases, not happy paths
4. Focus on user-facing breakage scenarios

