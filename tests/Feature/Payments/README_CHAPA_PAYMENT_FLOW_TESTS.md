# Chapa Payment Flow Tests

## Overview

This test suite provides comprehensive tests for Chapa payment integration flows, covering payment method selection, payment processing, callbacks, return URLs, and various payment types (regular orders, advance payments, final payments).

## Running the Tests

```bash
# Run all Chapa payment flow tests
php artisan test --group=chapa-payment-flows

# Run a specific test
php artisan test --group=chapa-payment-flows --filter="regular order chapa payment processes successfully"

# Run with verbose output
php artisan test --group=chapa-payment-flows --verbose
```

## Test Coverage

### 1. Payment Method Selection Page Tests (4 tests)
- ✅ Displays available payment methods
- ✅ Requires authentication
- ✅ Validates required parameters
- ✅ Only shows active payment methods

### 2. Payment Processing Tests - Regular Orders (6 tests)
- ✅ Processes successfully with mobile wallet (Telebirr, CBE)
- ✅ Processes successfully with bank debit card (Bank of Abyssinia)
- ✅ Validates payment method code
- ✅ Validates required fields
- ✅ Handles Chapa API failure gracefully
- ✅ Validates currency and amount

### 3. Payment Processing Tests - Advance Payments (2 tests)
- ✅ Processes advance payment successfully
- ✅ Creates transaction with correct metadata

### 4. Payment Processing Tests - Final Payments (1 test)
- ✅ Processes final payment successfully

### 5. Payment Callback Tests (4 tests)
- ✅ Updates transaction status to paid
- ✅ Handles missing tx_ref
- ✅ Handles non-existent transaction
- ✅ Updates product request advance payment status

### 6. Payment Return Tests (6 tests)
- ✅ Redirects to success page for paid transaction
- ✅ Redirects to failure page for failed transaction
- ✅ Handles missing tx_ref
- ✅ Handles non-existent transaction
- ✅ Updates advance payment status to processing
- ✅ Updates final payment status to processing

### 7. Integration Tests - Full Payment Flow (2 tests)
- ✅ Full payment flow from selection to callback
- ✅ Full advance payment flow

### 8. Edge Cases and Error Handling (3 tests)
- ✅ Handles concurrent requests gracefully
- ✅ Validates currency
- ✅ Validates amount is positive

## Test Statistics

- **Total Tests**: 26
- **Test Group**: `chapa-payment-flows`
- **Coverage**: Payment method selection, processing, callbacks, returns, and error handling

## Key Test Scenarios

### Payment Method Selection Flow
1. User navigates to payment method selection page
2. System displays available Chapa payment methods (mobile wallets, bank cards)
3. User selects a payment method
4. System validates selection and proceeds to payment processing

### Payment Processing Flow
1. User submits payment with selected method
2. System validates payment data
3. System creates payment transaction
4. System calls Chapa API to initialize payment
5. System redirects user to Chapa checkout page

### Payment Callback Flow
1. Chapa sends callback with payment status
2. System receives callback with tx_ref
3. System updates transaction status
4. System updates order/product request status
5. System returns success response to Chapa

### Payment Return Flow
1. User returns from Chapa checkout page
2. System looks up transaction by tx_ref
3. System checks payment status
4. System redirects to appropriate success/failure page
5. System updates product request status if applicable

## Helper Functions

### `createChapaPaymentMethods()`
Creates test Chapa payment methods:
- Telebirr (mobile wallet)
- CBE Birr (mobile wallet)
- Bank of Abyssinia (bank debit card)

### `mockChapaApiSuccess(string $checkoutUrl)`
Mocks successful Chapa API response with checkout URL.

### `mockChapaApiFailure()`
Mocks failed Chapa API response.

## Test Data

Tests use factories to create:
- Users
- Orders
- Product Requests
- Payment Transactions
- Chapa Payment Methods

## Important Notes

### Order Status Values
- Valid order statuses: `processing`, `shipped`, `delivered`, `cancelled`
- Tests use `processing` for new orders

### Payment Status Values
- Valid payment statuses: `pending`, `paid`, `failed`, `refunded`
- Tests use `pending` for new payments

### Transaction Gateway Status
- Valid gateway statuses: `pending`, `paid`, `failed`, `processing`
- Tests verify status transitions correctly

### Payment Method Codes
- Mobile wallets: `telebirr`, `cbe`, `mpesa`, `awash`, `ebirr`
- Bank cards: `boa`, `awash_bank`, `addis_bank`, `hibret`, `cbo`, `berhan`, `nib`
- Tests validate that only active methods are accepted

## Dependencies

- Laravel Framework
- Pest PHP Testing Framework
- HTTP Facade (for mocking Chapa API)
- Database migrations and seeders

## Maintenance

When adding new Chapa payment methods or modifying payment flows:
1. Update `createChapaPaymentMethods()` helper if needed
2. Add tests for new payment methods
3. Update test expectations if flow changes
4. Ensure all tests pass with `--group=chapa-payment-flows`

## Troubleshooting

### Tests Failing with 500 Errors
- Check that required models/factories exist
- Verify database migrations are up to date
- Check that Chapa API mocking is set up correctly

### Tests Failing with Validation Errors
- Verify payment method codes match database
- Check that required fields are provided
- Ensure order status values are valid

### Tests Failing with Missing Transactions
- Verify transaction creation logic
- Check that tx_ref is generated correctly
- Ensure database is refreshed between tests

