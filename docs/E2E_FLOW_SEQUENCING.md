# E2E Flow Sequencing Guide

Quick reference for chaining E2E test flows in logical order.

## Flow Definitions

| Flow ID | Name | Description |
|---------|------|-------------|
| F1 | Customer Buy (Pay Upload) | Customer purchases product with offline payment + proof upload |
| F2 | Customer Buy (Chapa) | Customer purchases product with Chapa payment |
| F3 | Admin Approve Payment | Admin approves customer payment |
| F4 | Customer Request Product | Customer submits product request |
| F5 | Admin Approve Request | Admin approves product request with pricing |
| F6 | Admin Reject Request | Admin rejects product request |
| F7 | Customer Pay Advance (Upload) | Customer pays advance with offline + proof upload |
| F8 | Customer Pay Advance (Chapa) | Customer pays advance with Chapa |
| F9 | Admin Approve Advance | Admin approves advance payment |
| F10 | Admin Reject Advance | Admin rejects advance payment |
| F11 | Customer Pay Final (Upload) | Customer pays final payment with offline + proof upload |
| F12 | Customer Pay Final (Chapa) | Customer pays final payment with Chapa |
| F13 | Admin Approve Final | Admin approves final payment |

## Flow Chains

### Chain 1: Regular Purchase - Pay & Upload Path
```
F1 (Customer Buy - Pay Upload)
  ↓ [order_id, payment_id]
F3 (Admin Approve Payment)
```

**Data Flow**:
- F1 creates: `order_id`, `payment_id`
- F3 uses: `payment_id` from F1

**Test Suite**: `regular-purchase-pay-upload.spec.ts`

---

### Chain 2: Regular Purchase - Chapa Path
```
F2 (Customer Buy - Chapa)
  ↓ [order_id, payment_id]
F3 (Admin Approve Payment)
```

**Data Flow**:
- F2 creates: `order_id`, `payment_id`
- F3 uses: `payment_id` from F2

**Test Suite**: `regular-purchase-chapa.spec.ts`

---

### Chain 3: Product Request - Full Lifecycle (Upload Path)
```
F4 (Customer Request Product)
  ↓ [product_request_id]
F5 (Admin Approve Request)
  ↓ [product_request_id, advance_amount, final_amount]
F7 (Customer Pay Advance - Upload)
  ↓ [product_request_id, advance_payment_id]
F9 (Admin Approve Advance)
  ↓ [product_request_id]
[Admin Start Procurement] (Manual step or helper)
  ↓ [product_request_id]
[Admin Mark Product Arrived] (Manual step or helper)
  ↓ [product_request_id]
F11 (Customer Pay Final - Upload)
  ↓ [product_request_id, final_payment_id]
F13 (Admin Approve Final)
```

**Data Flow**:
- F4 creates: `product_request_id`
- F5 uses: `product_request_id`, sets `advance_amount`, `final_amount`
- F7 uses: `product_request_id`, creates `advance_payment_id`
- F9 uses: `advance_payment_id`
- F11 uses: `product_request_id`, creates `final_payment_id`
- F13 uses: `final_payment_id`

**Test Suite**: `product-request-full-lifecycle-upload.spec.ts`

---

### Chain 4: Product Request - Full Lifecycle (Chapa Path)
```
F4 (Customer Request Product)
  ↓ [product_request_id]
F5 (Admin Approve Request)
  ↓ [product_request_id, advance_amount, final_amount]
F8 (Customer Pay Advance - Chapa)
  ↓ [product_request_id, advance_payment_id]
F9 (Admin Approve Advance)
  ↓ [product_request_id]
[Admin Start Procurement]
  ↓ [product_request_id]
[Admin Mark Product Arrived]
  ↓ [product_request_id]
F12 (Customer Pay Final - Chapa)
  ↓ [product_request_id, final_payment_id]
F13 (Admin Approve Final)
```

**Test Suite**: `product-request-full-lifecycle-chapa.spec.ts`

---

### Chain 5: Product Request - Rejection Path
```
F4 (Customer Request Product)
  ↓ [product_request_id]
F6 (Admin Reject Request)
```

**Data Flow**:
- F4 creates: `product_request_id`
- F6 uses: `product_request_id`, sets `status: 'rejected'`

**Test Suite**: `product-request-rejection.spec.ts`

---

### Chain 6: Product Request - Advance Rejection Path
```
F4 (Customer Request Product)
  ↓ [product_request_id]
F5 (Admin Approve Request)
  ↓ [product_request_id]
F7 (Customer Pay Advance - Upload)
  ↓ [product_request_id, advance_payment_id]
F10 (Admin Reject Advance)
```

**Data Flow**:
- F4 creates: `product_request_id`
- F5 uses: `product_request_id`
- F7 uses: `product_request_id`, creates `advance_payment_id`
- F10 uses: `advance_payment_id`

**Test Suite**: `product-request-advance-rejection.spec.ts`

---

## Implementation Patterns

### Pattern 1: Sequential Execution with Shared Context

```typescript
test.describe('Regular Purchase Suite', () => {
  let sharedContext: {
    orderId?: string;
    paymentId?: string;
  } = {};

  test('F1: Customer buys product', async ({ page }) => {
    // ... perform purchase
    sharedContext.orderId = await extractOrderId(page);
    sharedContext.paymentId = await extractPaymentId(page);
  });

  test('F3: Admin approves payment', async ({ page }) => {
    test.skip(!sharedContext.paymentId, 'Payment ID required');
    // Use sharedContext.paymentId
  });
});
```

### Pattern 2: Database-Based State Sharing

```typescript
test.describe('Product Request Suite', () => {
  let productRequestId: string;

  test('F4: Customer requests product', async ({ page }) => {
    // Create request
    productRequestId = await createProductRequest(page);
  });

  test('F5: Admin approves request', async ({ page }) => {
    // Fetch product request from database using productRequestId
    const request = await fetchProductRequest(productRequestId);
    // Proceed with approval
  });
});
```

### Pattern 3: API-Based State Sharing

```typescript
test.describe('Suite with API State', () => {
  test('F1: Create payment', async ({ page }) => {
    // Create payment via UI
    const paymentId = await extractPaymentId(page);
    
    // Store in test API for next flow
    await page.request.post('/api/test/state/store', {
      data: { key: 'payment_id', value: paymentId }
    });
  });

  test('F3: Approve payment', async ({ page }) => {
    // Retrieve from test API
    const response = await page.request.get('/api/test/state/payment_id');
    const paymentId = await response.json();
    // Use paymentId
  });
});
```

## Test Suite Organization

### Recommended Suite Structure

```
tests/E2E/suites/
├── regular-purchase-pay-upload.spec.ts    # F1 → F3
├── regular-purchase-chapa.spec.ts          # F2 → F3
├── product-request-rejection.spec.ts       # F4 → F6
├── product-request-advance-rejection.spec.ts  # F4 → F5 → F7 → F10
├── product-request-full-lifecycle-upload.spec.ts  # F4 → F5 → F7 → F9 → F11 → F13
└── product-request-full-lifecycle-chapa.spec.ts  # F4 → F5 → F8 → F9 → F12 → F13
```

### Running Specific Suites

```bash
# Run all suites
npx playwright test tests/E2E/suites/

# Run specific suite
npx playwright test tests/E2E/suites/regular-purchase-pay-upload.spec.ts

# Run specific flow
npx playwright test tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts

# Run with specific browser
npx playwright test --project=chromium
```

## Data Dependencies Matrix

| Flow | Requires | Produces |
|------|----------|----------|
| F1 | `product_id`, `customer_id` | `order_id`, `payment_id` |
| F2 | `product_id`, `customer_id` | `order_id`, `payment_id` |
| F3 | `payment_id`, `admin_id` | - |
| F4 | `customer_id` | `product_request_id` |
| F5 | `product_request_id`, `admin_id` | `advance_amount`, `final_amount` |
| F6 | `product_request_id`, `admin_id` | - |
| F7 | `product_request_id`, `customer_id` | `advance_payment_id` |
| F8 | `product_request_id`, `customer_id` | `advance_payment_id` |
| F9 | `advance_payment_id`, `admin_id` | - |
| F10 | `advance_payment_id`, `admin_id` | - |
| F11 | `product_request_id`, `customer_id` | `final_payment_id` |
| F12 | `product_request_id`, `customer_id` | `final_payment_id` |
| F13 | `final_payment_id`, `admin_id` | - |

## Execution Order Recommendations

### Development/Quick Testing
Run flows individually:
```bash
npx playwright test tests/E2E/flows/
```

### Integration Testing
Run complete suites:
```bash
npx playwright test tests/E2E/suites/
```

### CI/CD Pipeline
Run all suites in parallel:
```bash
npx playwright test tests/E2E/suites/ --workers=4
```

## Helper Functions for Flow Chaining

```typescript
// tests/E2E/helpers/flow-chaining.ts

export interface FlowContext {
  customerId?: number;
  adminId?: number;
  productId?: number;
  orderId?: string;
  paymentId?: string;
  productRequestId?: string;
  advancePaymentId?: string;
  finalPaymentId?: string;
}

export class FlowContextManager {
  private context: FlowContext = {};

  set(key: keyof FlowContext, value: any): void {
    this.context[key] = value;
  }

  get(key: keyof FlowContext): any {
    return this.context[key];
  }

  has(key: keyof FlowContext): boolean {
    return this.context[key] !== undefined;
  }

  require(key: keyof FlowContext): any {
    if (!this.has(key)) {
      throw new Error(`Required context key '${key}' not found`);
    }
    return this.get(key);
  }

  clear(): void {
    this.context = {};
  }
}

// Usage in tests
const context = new FlowContextManager();

test('F1: Customer buys', async ({ page }) => {
  const orderId = await performPurchase(page);
  context.set('orderId', orderId);
});

test('F3: Admin approves', async ({ page }) => {
  const paymentId = context.require('paymentId');
  await approvePayment(page, paymentId);
});
```

---

## Quick Reference: Which Suite to Use?

| Scenario | Suite File |
|----------|------------|
| Test regular purchase with upload | `regular-purchase-pay-upload.spec.ts` |
| Test regular purchase with Chapa | `regular-purchase-chapa.spec.ts` |
| Test product request rejection | `product-request-rejection.spec.ts` |
| Test advance payment rejection | `product-request-advance-rejection.spec.ts` |
| Test full product request lifecycle (upload) | `product-request-full-lifecycle-upload.spec.ts` |
| Test full product request lifecycle (Chapa) | `product-request-full-lifecycle-chapa.spec.ts` |

