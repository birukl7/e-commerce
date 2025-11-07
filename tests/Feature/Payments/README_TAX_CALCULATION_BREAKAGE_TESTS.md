# Tax Calculation Breakage Tests

## Overview

This test suite verifies that tax calculations are properly implemented across all payment flows as part of **Milestone 1: Tax Calculation Verification & Fixes**.

## Test Group

All tests in this suite are grouped under `milestone-1-tax-calculation` and can be run with:

```bash
php artisan test --group=milestone-1-tax-calculation
```

## Test Coverage

### 1. Advance Payment Tax Calculation - Chapa
- ✅ Verifies tax is calculated before sending to Chapa API
- ✅ Verifies correct amount (with tax) is sent to Chapa
- ✅ Verifies tax breakdown is stored in payment transaction

### 2. Advance Payment Tax Calculation - Offline
- ✅ Verifies tax is calculated before storing transaction
- ✅ Verifies transaction stores tax-calculated total amount
- ✅ Verifies tax breakdown is stored in gateway_payload

### 3. Final Payment Tax Calculation - Chapa
- ✅ Verifies tax is calculated before sending to Chapa API
- ✅ Verifies correct amount (with tax) is sent to Chapa
- ✅ Verifies tax breakdown is stored in payment transaction

### 4. Final Payment Tax Calculation - Offline
- ✅ Verifies tax is calculated before storing transaction
- ✅ Verifies transaction stores tax-calculated total amount

### 5. Normal Purchase Tax Calculation - Chapa
- ✅ Verifies tax is calculated correctly for regular orders
- ✅ Verifies order is updated with tax-calculated total
- ✅ Verifies Chapa API receives tax-calculated amount

### 6. Normal Purchase Tax Calculation - Offline
- ✅ Verifies tax breakdown is stored in transaction

### 7. Tax Breakdown Storage and Retrieval
- ✅ Verifies tax breakdown is stored in gateway_payload
- ✅ Verifies tax amounts are calculated correctly
- ✅ Verifies individual tax details are stored

### 8. Edge Cases
- ✅ Handles zero active taxes correctly
- ✅ Handles multiple active taxes correctly
- ✅ Handles very small amounts correctly
- ✅ Handles very large amounts correctly

### 9. Tax Calculation Consistency
- ✅ Verifies tax calculation is consistent across payment methods
- ✅ Verifies tax calculation matches TaxService output exactly

### 10. Product Request Payment Controller Verification
- ✅ Verifies ProductRequestPaymentController::processAdvancePayment() calculates tax
- ✅ Verifies ProductRequestPaymentController::processFinalPayment() calculates tax

## Test Structure

Each test follows this pattern:
1. **Setup**: Create user, product request/order, and tax settings
2. **Action**: Execute payment flow (Chapa or Offline)
3. **Assert**: Verify tax calculation, amount sent to API, and transaction storage

## Key Assertions

### Chapa Payments
- Amount sent to Chapa API must include tax
- Amount must be greater than subtotal
- Amount must match TaxService calculation

### Offline Payments
- Transaction amount must include tax
- Transaction must store tax breakdown in gateway_payload
- Tax breakdown must include: subtotal, tax_amount, taxes array

### Payment Transactions
- `amount` field must equal subtotal + tax_amount
- `gateway_payload` must contain:
  - `subtotal`: Original amount before tax
  - `tax_amount`: Total tax amount
  - `taxes`: Array of individual tax details

## Helper Functions

### `createTestTaxSettings()`
Creates two active tax settings for testing:
- Standard VAT: 15%
- Service Tax: 2.5%

### `calculateExpectedTax(float $subtotal, array $taxSettings)`
Calculates expected tax using TaxService for comparison.

## Running Tests

### Run all tax calculation tests:
```bash
php artisan test --group=milestone-1-tax-calculation
```

### Run specific test:
```bash
php artisan test --filter="advance payment chapa does not calculate tax"
```

### Run with verbose output:
```bash
php artisan test --group=milestone-1-tax-calculation --verbose
```

## Expected Behavior

All tests should **PASS** after implementing Milestone 1 fixes. These are breakage tests that verify:
- Tax is calculated before payment processing
- Tax-calculated amounts are sent to payment gateways
- Tax breakdown is properly stored in transactions
- Tax calculations are consistent across all payment flows

## Notes

- Tests use HTTP fake to mock Chapa API responses
- Tests create test tax settings that are cleaned up after each test
- Tests verify both the amount sent to APIs and the data stored in database
- Edge cases test boundary conditions (zero taxes, multiple taxes, small/large amounts)

