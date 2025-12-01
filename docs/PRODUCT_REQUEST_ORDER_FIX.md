# Product Request Order Fix - Single Order Per Request

## Problem
Previously, the system was creating duplicate orders for product requests:
- One order for advance payment (with `ADV-` prefix)
- Another order for final payment (also with `ADV-` prefix or potentially different)

This violated e-commerce best practices where **ONE order should track the entire transaction**, with payment status reflecting partial/full payment.

## Solution: Single Order Per Product Request

### Industry Best Practice
Based on e-commerce standards:
- **ONE order per product request** (not separate orders for advance and final)
- Order tracks payment status: `pending` → `paid` (when both payments complete)
- Order number is consistent throughout the lifecycle
- Order items remain the same (product request image, not payment proof)

### Changes Made

#### 1. Order Number Prefix
- **Changed from**: `ADV-{id}-{timestamp}` (confusing for final payments)
- **Changed to**: `PR-{id}-{timestamp}` (Product Request - consistent for both payments)

#### 2. Duplicate Order Prevention
- Added check in `ProductRequest::createOrder()` to return existing order if `order_id` is already set
- Final payment **NEVER** creates a new order - always reuses existing one
- Added critical error logging if order doesn't exist for final payment (should never happen)

#### 3. Image Handling
- Order items use **product request image** (from `product_request.image`)
- **NOT** payment proof screenshot
- Added placeholder (`/placeholder.svg`) for orders without images
- Backend returns placeholder path when image is null

#### 4. Payment Transaction Linking
- Both advance and final payment transactions link to the **same order**
- Order ID is set on payment transaction creation
- PaymentFinalizer updates order payment status as payments are approved

### Order Lifecycle

1. **Advance Payment Submission**:
   - Order created with `PR-{id}-{timestamp}`
   - Order status: `processing`
   - Payment status: `pending`
   - Order item created with product request image

2. **Advance Payment Approval**:
   - Order payment status updated (if needed)
   - Order remains the same

3. **Final Payment Submission**:
   - **Reuses existing order** (no new order created)
   - Payment transaction linked to same order

4. **Final Payment Approval**:
   - Order payment status: `paid`
   - Order status: `processing`
   - Same order, same items, same image

### Key Files Modified

1. `app/Models/ProductRequest.php`:
   - Changed order number prefix to `PR-`
   - Added duplicate order prevention check

2. `app/Services/PaymentFinalizer.php`:
   - Final payment NEVER creates new order
   - Returns error if order doesn't exist (critical issue)

3. `app/Http/Controllers/PaymentController.php`:
   - Final payment submission validates order exists
   - Payment transactions linked to existing order

4. `app/Http/Controllers/UserDashboardController.php`:
   - Added placeholder path for orders without images
   - Improved image extraction logging

### Migration Notes

Existing orders with `ADV-` prefix will continue to work. New orders will use `PR-` prefix.

To update existing orders (optional):
```sql
UPDATE orders 
SET order_number = REPLACE(order_number, 'ADV-', 'PR-') 
WHERE order_number LIKE 'ADV-%' 
AND notes LIKE '%product request%';
```

### Testing Checklist

- [ ] Advance payment creates order with `PR-` prefix
- [ ] Final payment reuses same order (no duplicate)
- [ ] Order items show product request image (not payment proof)
- [ ] Orders without images show placeholder
- [ ] Payment transactions link to correct order
- [ ] Order payment status updates correctly

