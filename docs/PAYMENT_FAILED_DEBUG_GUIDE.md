# Payment Failed Page Debug Guide

## Overview
This guide helps you debug why the payment-failed page is showing a blank white screen by comparing backend data with frontend expectations.

## Logging Added

### 1. Backend Logging (`app/Http/Controllers/PaymentController.php`)

#### When Payment Return is Called:
- **Log Entry**: `=== PAYMENT RETURN REQUEST - RAW INCOMING DATA ===`
  - Logs ALL incoming data from Chapa redirect URL
  - Includes: query params, path params, headers, full URL, etc.
  - Location: Start of `paymentReturn()` method

#### When Rendering Payment Failed Page:
- **Log Entry**: `=== RENDERING PAYMENT FAILED PAGE - DATA BEING SENT TO FRONTEND ===`
  - Logs the exact data being sent to Inertia
  - Includes: JSON representation, data types, all keys
  - Location: Before `Inertia::render('payment/payment-failed', ...)`

#### Expected Props Log:
- **Log Entry**: `=== FRONTEND COMPONENT EXPECTED PROPS ===`
  - Shows what props the frontend component expects
  - Location: Before rendering payment-failed page

### 2. Frontend Logging (`resources/js/pages/payment/payment-failed.tsx`)

The component now logs comprehensive debug information to the browser console:
- Raw props received
- Individual prop values and types
- JSON serialization of props
- Window Inertia data from `#app` element
- Component state checks

**Access in Browser:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for: `🔴 PAYMENT FAILED COMPONENT - COMPREHENSIVE DEBUG LOG`
- Also available as: `window.paymentFailedProps` and `window.paymentFailedDebug`

### 3. Frontend-to-Backend Logging

The frontend automatically sends its received props to the backend via:
- **Endpoint**: `POST /api/debug/payment-failed-props`
- **Log Entry**: `=== FRONTEND PAYMENT FAILED PROPS RECEIVED ===`
- This allows you to compare what frontend received vs what backend sent

## How to Debug

### Step 1: Check Backend Logs

```bash
# On cPanel/Server
tail -f storage/logs/laravel.log | grep -A 20 "PAYMENT RETURN REQUEST - RAW INCOMING DATA"
```

**Look for:**
- What `tx_ref` value is being extracted
- What query parameters Chapa is sending
- What path parameters are present

### Step 2: Check What Backend is Sending

```bash
tail -f storage/logs/laravel.log | grep -A 30 "RENDERING PAYMENT FAILED PAGE - DATA BEING SENT TO FRONTEND"
```

**Compare:**
- `render_data` - The exact data being sent
- `render_data_json` - JSON representation
- `render_data_keys` - All keys present
- `render_data_types` - Types of each value

### Step 3: Check What Frontend Receives

**In Browser Console:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for the debug log group
4. Check `window.paymentFailedProps` for the actual props

**In Backend Logs:**
```bash
tail -f storage/logs/laravel.log | grep -A 20 "FRONTEND PAYMENT FAILED PROPS RECEIVED"
```

### Step 4: Compare Data

**Backend sends:**
- Check `render_data` in backend logs
- Verify all required props are present
- Check data types match frontend expectations

**Frontend receives:**
- Check browser console logs
- Verify props match what backend sent
- Check if any props are missing or null

**Common Issues:**

1. **Props are null/undefined:**
   - Check if Inertia is properly passing props
   - Verify component name matches: `payment/payment-failed`
   - Check if there's a React error preventing render

2. **Data type mismatch:**
   - Backend sends `amount` as number, frontend expects number/string
   - Backend sends `order_id` as null, frontend expects string | null
   - Verify types match TypeScript interface

3. **Missing props:**
   - Check if `auth` prop is being passed
   - Verify `error` prop is present
   - Ensure `transaction_id` is included

## Quick Debug Commands

### View All Payment Return Logs:
```bash
tail -n 200 storage/logs/laravel.log | grep -A 10 "PAYMENT RETURN"
```

### View Payment Failed Rendering:
```bash
tail -n 200 storage/logs/laravel.log | grep -A 30 "RENDERING PAYMENT FAILED PAGE"
```

### View Frontend Props Received:
```bash
tail -n 200 storage/logs/laravel.log | grep -A 20 "FRONTEND PAYMENT FAILED PROPS"
```

### View All Payment-Related Logs:
```bash
tail -n 500 storage/logs/laravel.log | grep -i "payment.*failed\|payment.*return"
```

## Expected Data Structure

### Backend Sends:
```php
[
    'error' => 'Product request not found or unauthorized',
    'order_id' => null,
    'order_number' => null,
    'amount' => 41.03,  // number
    'currency' => 'ETB',  // string
    'transaction_id' => 'ADV-18-1764606961',  // string
    'error_code' => 'product_request_not_found',  // string
    'auth' => [
        'user' => [
            'id' => 30,  // number
            'name' => 'dechasa',  // string
            'email' => 'dechasateshome566@gmail.com',  // string
        ] | null
    ],
]
```

### Frontend Expects:
```typescript
{
    order_id?: string | null;
    order_number?: string | null;
    error?: string;
    error_code?: string;
    amount?: number | string;
    currency?: string;
    retry_url?: string;
    auth?: {
        user?: User;
    };
    transaction_id?: string;
}
```

## Troubleshooting

### If Page is Still Blank:

1. **Check Browser Console for Errors:**
   - Look for React errors
   - Check for JavaScript exceptions
   - Verify Inertia is loaded

2. **Check Network Tab:**
   - Verify the page request returns 200
   - Check response body contains Inertia data
   - Look for any failed API requests

3. **Check Inertia Data:**
   - Inspect `#app` element's `data-page` attribute
   - Verify it contains valid JSON
   - Check if component name matches: `payment/payment-failed`

4. **Verify Component File:**
   - File exists: `resources/js/pages/payment/payment-failed.tsx`
   - Component is exported correctly
   - No syntax errors in component

## Next Steps

After collecting logs:
1. Compare backend `render_data` with frontend `props`
2. Identify missing or mismatched props
3. Fix data structure in backend if needed
4. Fix component if it's not handling props correctly

