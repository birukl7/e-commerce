# Chapa Payment Failure Scenarios - Testing Guide

This document outlines the various scenarios that can cause Chapa payment failures and how to test them.

## Overview

Chapa payment failures can occur at different stages of the payment flow:
1. **Initialization Stage** - Before redirecting to Chapa checkout
2. **Checkout Stage** - During payment on Chapa's hosted page
3. **Return/Callback Stage** - When user returns from Chapa
4. **Webhook Stage** - When Chapa sends status updates

## Failure Scenarios

### 1. **Initialization Failures** (Before Checkout)

These occur when initializing the payment with Chapa API:

#### 1.1 Invalid API Credentials
- **Scenario**: Wrong or expired secret key
- **Expected Behavior**: Payment initialization fails, user sees error before redirect
- **How to Test**: 
  - Temporarily set wrong `CHAPA_SECRET_KEY` in `.env`
  - Attempt to make a payment
  - Should see error: "Payment initialization failed"

#### 1.2 Invalid Payment Data
- **Scenario**: Missing required fields (amount, email, tx_ref, etc.)
- **Expected Behavior**: Chapa API returns error, payment not initialized
- **How to Test**:
  - Send payment request with missing required fields
  - Check logs for Chapa API error response

#### 1.3 Network/API Errors
- **Scenario**: Chapa API is down or unreachable
- **Expected Behavior**: Connection timeout or HTTP error
- **How to Test**:
  - Block network access temporarily
  - Or use invalid Chapa API URL
  - Should see network error

#### 1.4 Invalid Amount
- **Scenario**: Amount is 0, negative, or exceeds limits
- **Expected Behavior**: Chapa rejects the payment
- **How to Test**:
  - Try payment with amount = 0
  - Try payment with very large amount
  - Check Chapa API response

### 2. **Checkout Page Failures** (On Chapa's Hosted Page)

These occur while user is on Chapa's checkout page:

#### 2.1 User Cancellation
- **Scenario**: User clicks "Cancel" or closes the browser
- **Expected Behavior**: User returns to your site with `gateway_status = 'failed'` or `pending`
- **How to Test**:
  - Start payment, redirect to Chapa
  - Click cancel or close browser
  - Check return URL handling

#### 2.2 Insufficient Funds
- **Scenario**: User's mobile money/bank account has insufficient balance
- **Expected Behavior**: Chapa shows error, user returns with failed status
- **How to Test**:
  - Use test account with low balance
  - Attempt payment exceeding balance
  - Should see failure on return

#### 2.3 Invalid Phone Number
- **Scenario**: Phone number format is incorrect or not registered
- **Expected Behavior**: Chapa rejects the payment
- **How to Test**:
  - Use invalid phone number format
  - Use unregistered phone number
  - Check Chapa error response

#### 2.4 Expired Payment Session
- **Scenario**: User takes too long on checkout page
- **Expected Behavior**: Session expires, payment fails
- **How to Test**:
  - Start payment, wait extended time (15+ minutes)
  - Complete payment after expiration
  - Should see timeout error

#### 2.5 Wrong PIN/Password
- **Scenario**: User enters incorrect PIN multiple times
- **Expected Behavior**: Account locked, payment fails
- **How to Test**:
  - Enter wrong PIN 3+ times
  - Check Chapa error response

#### 2.6 Network Issues During Payment
- **Scenario**: User loses internet connection while on Chapa page
- **Expected Behavior**: Payment fails, user returns with error
- **How to Test**:
  - Start payment, disconnect internet mid-payment
  - Reconnect and check return status

### 3. **Return URL Failures** (After Payment Attempt)

These occur when user returns from Chapa checkout:

#### 3.1 Payment Declined by Bank/Mobile Money Provider
- **Scenario**: Bank or mobile money provider declines transaction
- **Expected Behavior**: `gateway_status = 'failed'` in return URL
- **How to Test**:
  - Use test card/account that will decline
  - Complete payment flow
  - Check return URL parameters

#### 3.2 Transaction Not Found
- **Scenario**: Transaction reference doesn't exist in Chapa
- **Expected Behavior**: Error when verifying transaction
- **How to Test**:
  - Manually modify return URL with invalid tx_ref
  - Access return URL
  - Should see "Transaction not found" error

#### 3.3 Status Mismatch
- **Scenario**: Return URL shows different status than webhook
- **Expected Behavior**: System should verify with Chapa API
- **How to Test**:
  - Mock return URL with 'failed' status
  - But webhook says 'paid'
  - System should verify with Chapa API

#### 3.4 Missing Return Parameters
- **Scenario**: Chapa doesn't include expected parameters in return URL
- **Expected Behavior**: System should handle gracefully
- **How to Test**:
  - Access return URL without parameters
  - Should extract tx_ref from URL path
  - Should handle missing data gracefully

### 4. **Webhook Failures**

These occur when Chapa sends webhook notifications:

#### 4.1 Invalid Webhook Signature
- **Scenario**: Webhook signature doesn't match
- **Expected Behavior**: Webhook rejected, payment status not updated
- **How to Test**:
  - Send webhook with wrong signature
  - Check logs for signature verification failure

#### 4.2 Duplicate Webhook
- **Scenario**: Chapa sends same webhook multiple times
- **Expected Behavior**: System should handle idempotently
- **How to Test**:
  - Send same webhook twice
  - Check that payment status isn't updated twice

#### 4.3 Webhook for Non-Existent Transaction
- **Scenario**: Webhook references transaction not in database
- **Expected Behavior**: System should log error but not crash
- **How to Test**:
  - Send webhook with invalid tx_ref
  - Check error handling

### 5. **Product Request Specific Failures**

For product request payments (advance/final):

#### 5.1 Product Request Not Found
- **Scenario**: Product request ID doesn't exist or user mismatch
- **Expected Behavior**: Show generic failure page
- **How to Test**:
  - Use invalid product_request_id
  - Use product_request_id from different user
  - Should see "Product request not found or unauthorized"

#### 5.2 Request Already Paid
- **Scenario**: Attempting to pay for already paid request
- **Expected Behavior**: Show success page, don't process again
- **How to Test**:
  - Pay advance payment
  - Try to pay advance again
  - Should see duplicate payment prevention

#### 5.3 Request Terminated
- **Scenario**: Product request was cancelled/terminated
- **Expected Behavior**: Payment should be rejected
- **How to Test**:
  - Terminate a product request
  - Try to pay for it
  - Should see termination error

## Testing Checklist

### Pre-Checkout Testing
- [ ] Test with invalid API credentials
- [ ] Test with missing required fields
- [ ] Test with invalid amount (0, negative, too large)
- [ ] Test network timeout scenarios
- [ ] Test API rate limiting

### Checkout Page Testing
- [ ] Test user cancellation
- [ ] Test insufficient funds
- [ ] Test invalid phone number
- [ ] Test expired session
- [ ] Test wrong PIN multiple times
- [ ] Test network disconnection

### Return URL Testing
- [ ] Test with `gateway_status=failed` in return URL
- [ ] Test with missing tx_ref parameter
- [ ] Test with invalid tx_ref
- [ ] Test status verification with Chapa API
- [ ] Test handling of pending status

### Webhook Testing
- [ ] Test invalid signature
- [ ] Test duplicate webhooks
- [ ] Test webhook for non-existent transaction
- [ ] Test webhook with different statuses (failed, paid, pending)

### Product Request Testing
- [ ] Test with invalid product_request_id
- [ ] Test with unauthorized user
- [ ] Test duplicate payment prevention
- [ ] Test terminated request payment

## Chapa Status Codes

Based on code analysis, Chapa returns these statuses:

- **`success`**: Payment successful
- **`failed`**: Payment failed
- **`pending`**: Payment pending
- **`cancelled`**: Payment cancelled by user

## Error Messages to Expect

1. **Initialization Errors**:
   - "Payment initialization failed: [Chapa error message]"
   - "Failed to initialize payment. Please try again."

2. **Return URL Errors**:
   - "Payment was not successful"
   - "Product request not found or unauthorized"
   - "Transaction not found"

3. **Webhook Errors**:
   - "Invalid webhook signature"
   - "Transaction not found in database"

## How to Simulate Failures

### Using Chapa Test Mode
1. Use Chapa test credentials
2. Use test phone numbers that will fail
3. Use test amounts that trigger specific errors

### Manual Testing
1. Modify return URLs manually
2. Send fake webhooks
3. Block network access
4. Use invalid transaction references

### Automated Testing
1. Create unit tests for each scenario
2. Mock Chapa API responses
3. Test error handling paths
4. Verify logging and error messages

## Monitoring and Logging

All failures should be logged with:
- Transaction reference (tx_ref)
- Error message
- User ID
- Payment type
- Timestamp
- Full error context

Check logs at: `storage/logs/laravel.log`

Look for:
- `=== PAYMENT RETURN REQUEST - RAW INCOMING DATA ===`
- `Chapa payment initialization failed`
- `Product request not found or unauthorized`
- `Payment callback received for already paid transaction`

## Best Practices

1. **Always verify with Chapa API** before showing final status
2. **Handle all edge cases** gracefully
3. **Log everything** for debugging
4. **Show user-friendly error messages**
5. **Provide retry options** when appropriate
6. **Prevent duplicate payments** with status checks
7. **Handle webhooks idempotently**

