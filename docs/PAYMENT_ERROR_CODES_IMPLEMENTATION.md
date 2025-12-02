# Payment Error Codes Implementation

This document describes the comprehensive error code system implemented for payment failure pages, covering both product request payments and regular order payments.

## Overview

The system now provides specific, user-friendly error messages based on the type of payment failure. Error codes are extracted from multiple sources:
1. Chapa return URL query parameters
2. Transaction gateway payload
3. Transaction gateway status
4. Error messages in responses

## Error Code Sources

### 1. Chapa Return URL Parameters
When Chapa redirects users back after payment, it may include error information in query parameters:
- `status` - Payment status (success, failed, cancelled, etc.)
- `error_code` - Specific error code
- `error` - Error message

### 2. Transaction Gateway Payload
The `gateway_payload` field in `PaymentTransaction` may contain:
- `error_code` - Chapa error code
- `code` - Alternative error code field
- `error` - Error identifier
- `message` - Error message (parsed for error type)

### 3. Gateway Status
The transaction's `gateway_status` is mapped to error codes:
- `cancelled` → `user_cancelled`
- `timeout`, `expired` → `timeout`
- `failed` → Extracted from payload or defaults to `processing_error`

## Supported Error Codes

### Payment Method Errors

#### `insufficient_funds`
- **Title**: Insufficient Funds
- **Description**: Account doesn't have sufficient balance
- **Suggestions**: 
  - Check account balance
  - Add funds to account
  - Try again once funds are available

#### `user_cancelled` / `cancelled`
- **Title**: Payment Cancelled
- **Description**: User cancelled the payment process
- **Suggestions**:
  - If accidental, try again
  - Complete the payment process
  - Contact support if needed

#### `invalid_phone` / `invalid_account`
- **Title**: Invalid Account
- **Description**: Phone number or account information is invalid
- **Suggestions**:
  - Verify phone number is correct
  - Ensure account is registered with payment provider
  - Try using a different payment method

#### `timeout` / `expired` / `session_expired`
- **Title**: Payment Timeout
- **Description**: Payment session expired
- **Suggestions**:
  - Complete payment within time limit
  - Try again with fresh session
  - Ensure stable internet connection

#### `network_error`
- **Title**: Network Error
- **Description**: Network error during payment processing
- **Suggestions**:
  - Check internet connection
  - Try again in a moment
  - Contact support if persists

#### `declined` / `card_declined`
- **Title**: Payment Declined
- **Description**: Payment declined by bank or payment provider
- **Suggestions**:
  - Contact bank to verify transaction
  - Try different payment method
  - Ensure payment method is active

#### `wrong_pin` / `authentication_failed`
- **Title**: Authentication Failed
- **Description**: Incorrect PIN/password entered multiple times
- **Suggestions**:
  - Wait a few minutes before retrying
  - Ensure correct PIN is entered
  - Contact bank if account is locked

#### `account_locked`
- **Title**: Account Locked
- **Description**: Account temporarily locked
- **Suggestions**:
  - Contact bank to unlock account
  - Wait for lock period to expire
  - Try using different payment method

### System Errors

#### `order_not_found` / `transaction_not_found`
- **Title**: Order/Transaction Not Found
- **Description**: Unable to locate order or transaction
- **Suggestions**:
  - Contact support with reference number
  - Verify transaction was initiated
  - Check order status

#### `product_request_not_found`
- **Title**: Product Request Not Found
- **Description**: Product request not found or unauthorized
- **Suggestions**:
  - Contact support with transaction reference
  - Check product requests page
  - Verify logged into correct account

#### `request_terminated`
- **Title**: Request Terminated
- **Description**: Product request has been terminated
- **Suggestions**:
  - Request is no longer active
  - May need to create new request
  - Contact support if error

#### `processing_error`
- **Title**: Processing Error
- **Description**: Error occurred during payment processing
- **Suggestions**:
  - Try again
  - Contact support
  - Use alternative payment method

#### `missing_reference`
- **Title**: Missing Reference
- **Description**: Payment reference is missing
- **Suggestions**:
  - Contact support if payment was made
  - Verify payment was initiated
  - Check transaction history

#### `duplicate_transaction`
- **Title**: Duplicate Transaction
- **Description**: Transaction already processed
- **Suggestions**:
  - Check order status
  - Verify payment was successful
  - Contact support if needed

#### `api_error`
- **Title**: Payment Gateway Error
- **Description**: Temporary error with payment gateway
- **Suggestions**:
  - Try again in a few moments
  - Use alternative payment method
  - Contact support if persists

#### `service_unavailable`
- **Title**: Service Unavailable
- **Description**: Payment service temporarily unavailable
- **Suggestions**:
  - Try again later
  - Use alternative payment method
  - Contact support

## Implementation Details

### Backend (PaymentController.php)

#### Error Code Extraction Flow
1. **Extract from Chapa Return URL** (highest priority)
   - Checks `status`, `error_code`, `error` query parameters
   - Normalizes to standard error codes

2. **Extract from Transaction Data**
   - Parses `gateway_payload` JSON
   - Checks for `error_code`, `code`, `error` fields
   - Infers from error messages

3. **Map from Gateway Status**
   - Maps status values to error codes
   - Fallback for unknown statuses

#### Helper Methods

**`extractErrorCode($transaction, $gatewayStatus, $gatewayPayload)`**
- Main method for extracting error codes
- Checks multiple sources in priority order
- Returns normalized error code or null

**`normalizeErrorCode($code)`**
- Normalizes various error code formats to standard codes
- Handles Chapa-specific error codes
- Maps synonyms to standard codes

**`inferErrorCodeFromMessage($message)`**
- Analyzes error message text
- Extracts error type from message content
- Returns appropriate error code

**`mapStatusToErrorCode($status)`**
- Maps gateway status to error code
- Handles status-based error inference

### Frontend Components

#### Payment Failed Page (`payment-failed.tsx`)
- Handles all error codes for regular orders
- Displays context-specific help suggestions
- Shows transaction references and order details

#### Advance Payment Failure (`advance-payment-failure.tsx`)
- Product request specific error handling
- Shows advance payment details
- Provides retry options

#### Final Payment Failure (`final-payment-failure.tsx`)
- Final payment specific error handling
- Emphasizes product readiness
- Provides urgent retry options

## Error Code Display

### Error Information Displayed
1. **Error Title** - User-friendly title based on error code
2. **Error Description** - Detailed explanation of the error
3. **Error Code** - Technical error code (for support)
4. **Transaction ID** - Reference for support inquiries
5. **Context-Specific Suggestions** - Actionable next steps

### Visual Indicators
- **Red color scheme** for errors
- **Icon-based indicators** for different error types
- **Color-coded cards** for different information types
- **Prominent transaction reference** for support

## Testing Error Codes

### How to Test Each Error Code

1. **Insufficient Funds**
   - Use test account with low balance
   - Attempt payment exceeding balance

2. **User Cancelled**
   - Start payment, click cancel on Chapa page

3. **Invalid Phone/Account**
   - Use invalid phone number format
   - Use unregistered account

4. **Timeout**
   - Wait extended time before completing payment
   - Let session expire

5. **Network Error**
   - Disconnect internet during payment
   - Simulate network failure

6. **Payment Declined**
   - Use test card that will decline
   - Contact bank to decline transaction

7. **Wrong PIN**
   - Enter wrong PIN multiple times

8. **Account Locked**
   - Trigger account lock with failed attempts

## Error Code Priority

When multiple error sources are available, priority is:
1. Chapa return URL parameters (most recent)
2. Transaction gateway payload
3. Gateway status mapping
4. Default error code

## Logging

All error code extraction is logged with:
- Source of error code
- Original vs normalized code
- Transaction details
- User context

Check logs at: `storage/logs/laravel.log`

Look for:
- `Extracting error code from transaction`
- `Error code normalized`
- `Chapa return URL error code`

## Future Enhancements

1. **Error Code Analytics**
   - Track most common error codes
   - Identify patterns in failures
   - Improve error prevention

2. **Automated Retry Logic**
   - Smart retry for transient errors
   - Exponential backoff
   - Error-specific retry strategies

3. **Enhanced Error Messages**
   - Localized error messages
   - Multi-language support
   - Context-aware suggestions

4. **Error Recovery Flows**
   - Guided recovery for specific errors
   - Alternative payment method suggestions
   - Automatic fallback options

