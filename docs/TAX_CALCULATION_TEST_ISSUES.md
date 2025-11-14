# Tax Calculation Test Issues Analysis

## Summary

The tax calculation tests are failing due to several issues that have been identified and partially fixed.

## Issues Identified and Fixed

### ✅ Fixed: HTTP Fake Pattern Mismatch
- **Issue**: Tests used `Http::fake(['api.chapa.co/*' => ...])` but PaymentController uses `https://api.chapa.co/v1/transaction/initialize`
- **Fix Applied**: Updated all HTTP fake patterns to include both exact URL and wildcard:
  ```php
  Http::fake([
      'api.chapa.co/v1/transaction/initialize' => Http::response([...], 200),
      'api.chapa.co/*' => Http::response([...], 200), // Fallback
  ]);
  ```

### ✅ Fixed: Missing Chapa API Keys in Tests
- **Issue**: ChapaService constructor throws `RuntimeException` if API keys aren't configured
- **Fix Applied**: Added Chapa API keys to `phpunit.xml`:
  ```xml
  <env name="CHAPA_SECRET_KEY" value="test_secret_key"/>
  <env name="CHAPA_PUBLIC_KEY" value="test_public_key"/>
  <env name="CHAPA_BASE_URL" value="https://api.chapa.co/v1"/>
  ```

### ✅ Fixed: Missing ChapaPaymentMethod Records
- **Issue**: PaymentController validates payment methods against database, but tests didn't create required records
- **Fix Applied**: 
  - Added `createChapaPaymentMethods()` helper function
  - Added calls to `createChapaPaymentMethods()` in all Chapa payment tests

## Remaining Issues to Investigate

### 1. Regular Order Payment Tests (500 Errors)
**Tests Affected**:
- `normal purchase chapa does not calculate tax correctly for order`
- `normal purchase chapa uses order subtotal instead of total with tax`

**Possible Causes**:
- Payment processing failing before HTTP call
- Missing required data (cart items, order items)
- Validation errors in PaymentController
- Exception being thrown during payment processing

**Investigation Needed**:
- Check if order creation is successful
- Verify cart_items are properly formatted
- Check PaymentController logs for specific errors
- Ensure all required fields are provided

### 2. Transaction Creation Failures (Null Transactions)
**Tests Affected**:
- Multiple tests expecting transactions to exist but finding null

**Possible Causes**:
- Payment processing failing before transaction creation
- Database transaction rollback
- Validation failures
- Exception during transaction creation

**Investigation Needed**:
- Add error logging to see why transactions aren't created
- Check if HTTP call is actually being made
- Verify payment processing completes successfully
- Check database transaction commits

### 3. HTTP Assertion Failures
**Tests Affected**:
- Tests using `Http::assertSent()` but no requests recorded

**Possible Causes**:
- Payment failing before HTTP call
- HTTP fake pattern still not matching
- Request being made to different URL
- Exception preventing HTTP call

**Investigation Needed**:
- Verify HTTP fake is set up before payment processing
- Check actual URL being called in PaymentController
- Add logging to see if HTTP call is attempted
- Verify ChapaService vs PaymentController HTTP calls

## Code Locations

### Payment Processing
- **PaymentController**: `app/Http/Controllers/PaymentController.php:882-1574`
- **ProductRequestPaymentController**: `app/Http/Controllers/ProductRequestPaymentController.php:265-359`
- **ChapaService**: `app/Services/ChapaService.php:34-63`

### Tax Calculation
- **TaxService**: `app/Services/TaxService.php`
- **PaymentController tax logic**: Lines 1011-1094

## Recommended Next Steps

1. **Add Debug Logging**: Add temporary logging in PaymentController to see where failures occur
2. **Check Response Status**: Verify what status codes are actually returned (not just 200/500)
3. **Test HTTP Fake Matching**: Verify HTTP fake is actually catching requests
4. **Check Exception Messages**: Look at actual exception messages in test output
5. **Verify Transaction Creation**: Add assertions to check if transaction creation is attempted

## Test Configuration

All fixes have been applied to:
- ✅ `phpunit.xml` - Added Chapa API keys
- ✅ `tests/Feature/Payments/TaxCalculationBreakageTest.php` - Updated HTTP fakes and added payment method creation

