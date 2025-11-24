# E2E Testing Plan - Playwright Integration

## Executive Summary

This document outlines a comprehensive plan for implementing end-to-end (E2E) testing using **Playwright** for the Laravel e-commerce application. Playwright is chosen over Cypress due to:
- Better browser support (Chromium, Firefox, WebKit)
- Native parallel execution
- Superior network interception for mocking Chapa payments
- Better integration with Laravel's testing ecosystem
- TypeScript support (matching your frontend)

## Table of Contents

1. [Framework Selection](#framework-selection)
2. [Architecture Overview](#architecture-overview)
3. [Test Flow Definitions](#test-flow-definitions)
4. [Flow Sequencing & Dependencies](#flow-sequencing--dependencies)
5. [Implementation Plan](#implementation-plan)
6. [Best Practices](#best-practices)
7. [Laravel Integration Strategy](#laravel-integration-strategy)
8. [CI/CD Integration](#cicd-integration)

---

## Framework Selection

### Why Playwright?

1. **Laravel Compatibility**
   - Works seamlessly with Laravel's testing environment
   - Can leverage Laravel's database factories and seeders
   - Supports Laravel's authentication helpers
   - Better for testing Inertia.js applications

2. **Technical Advantages**
   - Multi-browser support (Chromium, Firefox, WebKit)
   - Native parallel execution
   - Advanced network interception (critical for Chapa payment mocking)
   - Auto-waiting reduces flakiness
   - Screenshot/video recording on failure
   - TypeScript support

3. **Community & Ecosystem**
   - Growing adoption in Laravel community
   - Excellent documentation
   - Active maintenance

### Comparison with Cypress

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| Browser Support | Chromium, Firefox, WebKit | Chrome, Firefox (limited) |
| Parallel Execution | Native (free) | Paid plans only |
| Network Mocking | Advanced | Basic |
| Laravel Integration | Excellent | Good |
| TypeScript | Full support | Full support |
| Learning Curve | Moderate | Moderate |

**Decision: Playwright** ✅

---

## Architecture Overview

### Directory Structure

```
tests/
├── E2E/                          # E2E tests directory
│   ├── flows/                    # Individual flow tests
│   │   ├── flow-01-customer-buy-pay-upload.spec.ts
│   │   ├── flow-02-customer-buy-chapa.spec.ts
│   │   ├── flow-03-admin-approve-payment.spec.ts
│   │   ├── flow-04-customer-request-product.spec.ts
│   │   ├── flow-05-admin-approve-request.spec.ts
│   │   ├── flow-06-admin-reject-request.spec.ts
│   │   ├── flow-07-customer-advance-pay-upload.spec.ts
│   │   ├── flow-08-customer-advance-chapa.spec.ts
│   │   ├── flow-09-admin-approve-advance.spec.ts
│   │   ├── flow-10-admin-reject-advance.spec.ts
│   │   ├── flow-11-customer-final-pay-upload.spec.ts
│   │   ├── flow-12-customer-final-chapa.spec.ts
│   │   └── flow-13-admin-approve-final.spec.ts
│   ├── suites/                    # Test suites (chained flows)
│   │   ├── regular-purchase.spec.ts
│   │   ├── product-request-approve.spec.ts
│   │   ├── product-request-reject.spec.ts
│   │   └── full-product-request-lifecycle.spec.ts
│   ├── fixtures/                 # Reusable test fixtures
│   │   ├── auth.ts               # Authentication helpers
│   │   ├── database.ts            # Database setup/teardown
│   │   ├── products.ts            # Product test data
│   │   ├── payments.ts             # Payment mocking
│   │   └── chapa.ts                # Chapa payment mocking
│   ├── helpers/                   # Utility functions
│   │   ├── page-objects/          # Page Object Model
│   │   │   ├── LoginPage.ts
│   │   │   ├── CheckoutPage.ts
│   │   │   ├── PaymentPage.ts
│   │   │   ├── AdminDashboardPage.ts
│   │   │   └── ProductRequestPage.ts
│   │   ├── api-helpers.ts         # API interaction helpers
│   │   └── test-helpers.ts        # General test utilities
│   └── config/                    # Test configuration
│       ├── playwright.config.ts
│       └── test-setup.ts
└── [existing Pest tests...]
```

### Test Data Management

- **Laravel Factories**: Use existing factories for consistent test data
- **Database Seeding**: Seed test database before E2E runs
- **Test Isolation**: Each test should be independent with its own data
- **Cleanup**: Use Laravel's `RefreshDatabase` trait via API helpers

---

## Test Flow Definitions

### Flow 1: Customer Buy Product (Pay & Upload Proof)

**Description**: Customer purchases a product using offline payment method with proof upload.

**Steps**:
1. Customer logs in
2. Browse/search for product
3. Add product to cart
4. Proceed to checkout
5. Select "Pay & Upload Proof" payment method
6. Fill payment details (reference, notes)
7. Upload payment screenshot
8. Submit payment
9. Verify success message
10. Verify payment status is "pending approval"

**Expected Results**:
- Payment transaction created with status `gateway_status: 'proof_uploaded'`
- Payment appears in admin dashboard
- Customer sees confirmation page

**Test File**: `tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts`

---

### Flow 2: Customer Buy Product (Chapa)

**Description**: Customer purchases a product using Chapa payment gateway.

**Steps**:
1. Customer logs in
2. Browse/search for product
3. Add product to cart
4. Proceed to checkout
5. Select "Chapa" payment method
6. Fill customer details (phone number)
7. Initialize Chapa payment
8. **Mock Chapa redirect** (intercept network request)
9. **Mock Chapa callback** (simulate successful payment)
10. Verify redirect to success page
11. Verify payment status is "processing"

**Expected Results**:
- Payment transaction created with status `gateway_status: 'processing'`
- Payment appears in admin dashboard
- Customer sees success page

**Test File**: `tests/E2E/flows/flow-02-customer-buy-chapa.spec.ts`

**Note**: Chapa payment will be mocked using Playwright's network interception.

---

### Flow 3: Admin Approve Payment

**Description**: Admin approves a customer payment (from Flow 1 or Flow 2).

**Prerequisites**: 
- Payment must exist (from Flow 1 or Flow 2)
- Payment status must be `processing` or `proof_uploaded`

**Steps**:
1. Admin logs in
2. Navigate to payment dashboard
3. Find payment (filter/search)
4. View payment details
5. Verify payment information is correct
6. Click "Approve" button
7. Add optional notes
8. Confirm approval
9. Verify success message
10. Verify payment status changed to `approved`
11. Verify order status updated (if applicable)

**Expected Results**:
- Payment `admin_status` changed to `approved`
- Order status updated (if regular order)
- Customer receives notification (verify via database/email queue)

**Test File**: `tests/E2E/flows/flow-03-admin-approve-payment.spec.ts`

---

### Flow 4: Customer Request Product

**Description**: Customer submits a product request.

**Steps**:
1. Customer logs in
2. Navigate to product request page
3. Fill product request form:
   - Product name
   - Product URL
   - Description
   - Upload image
   - Brand, model, color, size, quantity
   - Shipping address
   - Budget constraints
   - Additional notes
4. Submit request
5. Verify success message
6. Verify request appears in customer's request history
7. Verify request status is `pending`

**Expected Results**:
- ProductRequest created with `status: 'pending'`
- Request visible in customer dashboard
- Request visible in admin dashboard

**Test File**: `tests/E2E/flows/flow-04-customer-request-product.spec.ts`

---

### Flow 5: Admin Approve Product Request

**Description**: Admin approves a product request and sets pricing.

**Prerequisites**: Product request must exist (from Flow 4)

**Steps**:
1. Admin logs in
2. Navigate to product requests dashboard
3. Find pending request
4. View request details
5. Click "Approve"
6. Fill approval form:
   - Total amount
   - Advance amount (or percentage)
   - Currency
   - Estimated arrival date
7. Submit approval
8. Verify success message
9. Verify request status changed to `approved`
10. Verify customer can see approved request with pricing

**Expected Results**:
- ProductRequest `status` changed to `approved`
- `amount`, `advance_amount`, `final_amount` set
- Customer receives notification
- Customer can now confirm willingness

**Test File**: `tests/E2E/flows/flow-05-admin-approve-request.spec.ts`

---

### Flow 6: Admin Reject Product Request

**Description**: Admin rejects a product request with reason.

**Prerequisites**: Product request must exist (from Flow 4)

**Steps**:
1. Admin logs in
2. Navigate to product requests dashboard
3. Find pending request
4. View request details
5. Click "Reject"
6. Select rejection reason
7. Add optional notes
8. Confirm rejection
9. Verify success message
10. Verify request status changed to `rejected`
11. Verify customer sees rejection with reason

**Expected Results**:
- ProductRequest `status` changed to `rejected`
- `rejection_reason` set
- Customer receives notification
- Customer cannot proceed with payment

**Test File**: `tests/E2E/flows/flow-06-admin-reject-request.spec.ts`

---

### Flow 7: Customer Pay Advance (Pay & Upload Proof)

**Description**: Customer pays advance payment for approved product request using offline method.

**Prerequisites**: 
- Product request approved (from Flow 5)
- Customer confirmed willingness to buy

**Steps**:
1. Customer logs in
2. Navigate to product request details
3. Verify request is approved
4. Confirm willingness to buy (if not already done)
5. Click "Pay Advance"
6. Select "Pay & Upload Proof" method
7. Fill payment details
8. Upload payment screenshot
9. Submit payment
10. Verify success message
11. Verify advance payment status is `processing`

**Expected Results**:
- PaymentTransaction created with `payment_type: 'product_request_advance'`
- `advance_payment_status` set to `processing`
- Payment appears in admin dashboard

**Test File**: `tests/E2E/flows/flow-07-customer-advance-pay-upload.spec.ts`

---

### Flow 8: Customer Pay Advance (Chapa)

**Description**: Customer pays advance payment using Chapa.

**Prerequisites**: Same as Flow 7

**Steps**:
1. Customer logs in
2. Navigate to product request details
3. Click "Pay Advance"
4. Select "Chapa" method
5. Fill customer details
6. Initialize Chapa payment
7. **Mock Chapa redirect and callback**
8. Verify success
9. Verify advance payment status is `processing`

**Expected Results**: Same as Flow 7, but with Chapa payment method

**Test File**: `tests/E2E/flows/flow-08-customer-advance-chapa.spec.ts`

---

### Flow 9: Admin Approve Advance Payment

**Description**: Admin approves advance payment for product request.

**Prerequisites**: Advance payment exists (from Flow 7 or Flow 8)

**Steps**:
1. Admin logs in
2. Navigate to payment dashboard
3. Find advance payment (filter by type)
4. View payment details
5. Verify product request information
6. Click "Approve"
7. Add optional notes
8. Confirm approval
9. Verify success message
10. Verify advance payment status changed to `paid`
11. Verify procurement can now be started

**Expected Results**:
- Payment `admin_status` changed to `approved`
- `advance_payment_status` changed to `paid`
- `advance_paid_at` set
- Procurement workflow can proceed

**Test File**: `tests/E2E/flows/flow-09-admin-approve-advance.spec.ts`

---

### Flow 10: Admin Reject Advance Payment

**Description**: Admin rejects advance payment with reason.

**Prerequisites**: Advance payment exists (from Flow 7 or Flow 8)

**Steps**:
1. Admin logs in
2. Navigate to payment dashboard
3. Find advance payment
4. View payment details
5. Click "Reject"
6. Select rejection reason
7. Add notes
8. Confirm rejection
9. Verify success message
10. Verify payment status changed to `rejected`
11. Verify customer can see rejection

**Expected Results**:
- Payment `admin_status` changed to `rejected`
- Customer receives notification
- Customer can retry payment

**Test File**: `tests/E2E/flows/flow-10-admin-reject-advance.spec.ts`

---

### Flow 11: Customer Pay Final (Pay & Upload Proof)

**Description**: Customer pays final payment after product arrival using offline method.

**Prerequisites**:
- Product request approved
- Advance payment approved
- Procurement completed
- Product marked as arrived

**Steps**:
1. Customer logs in
2. Navigate to product request details
3. Verify product has arrived
4. Click "Pay Final Payment"
5. Select "Pay & Upload Proof" method
6. Fill payment details
7. Upload payment screenshot
8. Submit payment
9. Verify success message
10. Verify final payment status is `processing`

**Expected Results**:
- PaymentTransaction created with `payment_type: 'product_request_final'`
- `final_payment_status` set to `processing`
- Payment appears in admin dashboard

**Test File**: `tests/E2E/flows/flow-11-customer-final-pay-upload.spec.ts`

---

### Flow 12: Customer Pay Final (Chapa)

**Description**: Customer pays final payment using Chapa.

**Prerequisites**: Same as Flow 11

**Steps**: Similar to Flow 11, but using Chapa payment method

**Test File**: `tests/E2E/flows/flow-12-customer-final-chapa.spec.ts`

---

### Flow 13: Admin Approve Final Payment

**Description**: Admin approves final payment for product request.

**Prerequisites**: Final payment exists (from Flow 11 or Flow 12)

**Steps**:
1. Admin logs in
2. Navigate to payment dashboard
3. Find final payment
4. View payment details
5. Click "Approve"
6. Add optional notes
7. Confirm approval
8. Verify success message
9. Verify final payment status changed to `paid`
10. Verify order created (if applicable)
11. Verify product request workflow completed

**Expected Results**:
- Payment `admin_status` changed to `approved`
- `final_payment_status` changed to `paid`
- `final_paid_at` set
- Order created and linked to product request
- Workflow status shows as completed

**Test File**: `tests/E2E/flows/flow-13-admin-approve-final.spec.ts`

---

## Flow Sequencing & Dependencies

### Logical Flow Chains

#### Chain 1: Regular Purchase (Pay & Upload)
```
Flow 1 (Customer Buy - Pay Upload) 
  → Flow 3 (Admin Approve Payment)
```

#### Chain 2: Regular Purchase (Chapa)
```
Flow 2 (Customer Buy - Chapa) 
  → Flow 3 (Admin Approve Payment)
```

#### Chain 3: Product Request - Approved Path
```
Flow 4 (Customer Request) 
  → Flow 5 (Admin Approve Request) 
  → Flow 7 (Customer Pay Advance - Upload) 
  → Flow 9 (Admin Approve Advance) 
  → [Admin starts procurement] 
  → [Admin marks product arrived] 
  → Flow 11 (Customer Pay Final - Upload) 
  → Flow 13 (Admin Approve Final)
```

#### Chain 4: Product Request - Approved Path (Chapa)
```
Flow 4 (Customer Request) 
  → Flow 5 (Admin Approve Request) 
  → Flow 8 (Customer Pay Advance - Chapa) 
  → Flow 9 (Admin Approve Advance) 
  → [Admin starts procurement] 
  → [Admin marks product arrived] 
  → Flow 12 (Customer Pay Final - Chapa) 
  → Flow 13 (Admin Approve Final)
```

#### Chain 5: Product Request - Rejected Path
```
Flow 4 (Customer Request) 
  → Flow 6 (Admin Reject Request)
```

#### Chain 6: Product Request - Advance Rejected
```
Flow 4 (Customer Request) 
  → Flow 5 (Admin Approve Request) 
  → Flow 7 (Customer Pay Advance - Upload) 
  → Flow 10 (Admin Reject Advance)
```

### Test Suite Organization

Test suites will group related flows:

1. **regular-purchase.spec.ts**
   - Flow 1 → Flow 3
   - Flow 2 → Flow 3

2. **product-request-approve.spec.ts**
   - Flow 4 → Flow 5 → Flow 7 → Flow 9 → Flow 11 → Flow 13
   - Flow 4 → Flow 5 → Flow 8 → Flow 9 → Flow 12 → Flow 13

3. **product-request-reject.spec.ts**
   - Flow 4 → Flow 6
   - Flow 4 → Flow 5 → Flow 7 → Flow 10

### Data Sharing Between Flows

**Strategy**: Use Laravel's database to share state between flows within a suite.

**Implementation**:
- Each suite starts with fresh database seed
- Flows within a suite share the same test data
- Use unique identifiers (emails, order numbers) to link flows
- Store references in test context or shared fixtures

**Example**:
```typescript
// In suite file
test.describe('Regular Purchase Suite', () => {
  let orderId: string;
  let paymentId: string;
  
  test('Flow 1: Customer buys product', async ({ page }) => {
    // ... perform purchase
    orderId = await extractOrderId(page);
    paymentId = await extractPaymentId(page);
  });
  
  test('Flow 3: Admin approves payment', async ({ page }) => {
    // Use orderId and paymentId from previous flow
    await approvePayment(page, paymentId);
  });
});
```

---

## Implementation Plan

### Phase 1: Setup & Infrastructure (Week 1)

#### 1.1 Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### 1.2 Create Configuration
- Create `playwright.config.ts`
- Configure browsers (Chromium, Firefox, WebKit)
- Set up base URL (use Laravel test server)
- Configure test directories
- Set up screenshot/video on failure

#### 1.3 Laravel Test Environment Setup
- Create `.env.testing` file
- Configure separate test database
- Set up test server helper
- Create database migration/seeding helpers

#### 1.4 Create Base Fixtures
- Authentication helpers (customer, admin)
- Database setup/teardown helpers
- API helpers for Laravel integration

### Phase 2: Core Flows (Week 2-3)

#### 2.1 Authentication & Navigation
- Create LoginPage page object
- Create navigation helpers
- Test customer and admin login flows

#### 2.2 Payment Flows (Flows 1, 2, 7, 8, 11, 12)
- Create PaymentPage page object
- Implement Chapa payment mocking
- Implement file upload helpers
- Test payment submission flows

#### 2.3 Admin Approval Flows (Flows 3, 9, 13)
- Create AdminDashboardPage page object
- Create payment approval helpers
- Test approval workflows

#### 2.4 Product Request Flows (Flows 4, 5, 6)
- Create ProductRequestPage page object
- Test request submission
- Test admin approval/rejection

### Phase 3: Flow Chaining & Suites (Week 4)

#### 3.1 Create Test Suites
- Implement regular-purchase.spec.ts
- Implement product-request-approve.spec.ts
- Implement product-request-reject.spec.ts

#### 3.2 Data Sharing Implementation
- Create shared context helpers
- Implement flow dependency management
- Test suite execution order

#### 3.3 Advanced Scenarios
- Test error cases
- Test edge cases
- Test concurrent flows

### Phase 4: CI/CD Integration (Week 5)

#### 4.1 GitHub Actions Setup
- Create workflow file
- Configure test database
- Set up test server
- Configure parallel execution

#### 4.2 Reporting
- Set up test reports
- Configure screenshots/videos
- Set up notifications

---

## Best Practices

### 1. Page Object Model (POM)

**Why**: Reduces code duplication, improves maintainability

**Example**:
```typescript
// tests/E2E/helpers/page-objects/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/dashboard');
  }
}
```

### 2. Test Data Management

**Use Laravel Factories**:
```typescript
// In test setup
await fetch('/api/test/setup', {
  method: 'POST',
  body: JSON.stringify({
    factory: 'Product',
    count: 5
  })
});
```

**Create Test Users**:
```typescript
// tests/E2E/fixtures/auth.ts
export async function createTestCustomer() {
  const response = await fetch('/api/test/users/customer', { method: 'POST' });
  return await response.json();
}
```

### 3. Network Interception for Chapa

**Mock Chapa API**:
```typescript
await page.route('**/api/chapa/**', async route => {
  if (route.request().method() === 'POST') {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        status: 'success',
        data: {
          checkout_url: 'https://checkout.chapa.co/checkout/test-123'
        }
      })
    });
  }
});
```

### 4. File Upload Handling

**Create Helper**:
```typescript
// tests/E2E/helpers/test-helpers.ts
export async function uploadFile(
  page: Page, 
  selector: string, 
  filePath: string
) {
  const fileInput = await page.locator(selector);
  await fileInput.setInputFiles(filePath);
}
```

### 5. Waiting Strategies

**Use Playwright's Auto-Waiting**:
```typescript
// Good - Playwright auto-waits
await page.click('button[type="submit"]');

// Avoid manual waits
// await page.waitForTimeout(1000); // ❌ Bad
```

**Use Explicit Waits When Needed**:
```typescript
// Wait for specific condition
await page.waitForSelector('.payment-success', { state: 'visible' });
```

### 6. Test Isolation

**Each test should**:
- Start with clean database state
- Use unique test data
- Not depend on other tests
- Clean up after itself

### 7. Error Handling

**Capture Screenshots on Failure**:
```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ 
      path: `screenshots/${testInfo.title}.png`,
      fullPage: true 
    });
  }
});
```

---

## Laravel Integration Strategy

### 1. Test Database Setup

**Create Helper Command**:
```php
// app/Console/Commands/SetupE2ETestDatabase.php
php artisan migrate:fresh --seed --env=testing
```

**Use in Test Setup**:
```typescript
// tests/E2E/config/test-setup.ts
export async function setupTestDatabase() {
  await fetch('/api/test/database/setup', { method: 'POST' });
}
```

### 2. Authentication Helpers

**Create API Endpoints for Test Auth**:
```php
// routes/test-api.php (only in testing environment)
Route::post('/test/auth/customer', function() {
  $user = User::factory()->customer()->create();
  Auth::login($user);
  return response()->json(['token' => $user->createToken('test')->plainTextToken]);
});
```

**Use in Playwright**:
```typescript
// tests/E2E/fixtures/auth.ts
export async function loginAsCustomer(page: Page) {
  const response = await fetch('/api/test/auth/customer', { method: 'POST' });
  const { token } = await response.json();
  
  // Set token in localStorage or cookie
  await page.context().addCookies([{
    name: 'auth_token',
    value: token,
    domain: 'localhost',
    path: '/'
  }]);
}
```

### 3. Database State Management

**Create Test API Routes**:
```php
// routes/test-api.php
Route::post('/test/database/reset', function() {
  Artisan::call('migrate:fresh', ['--seed' => true]);
  return response()->json(['status' => 'success']);
});

Route::post('/test/factory/{model}', function($model) {
  $factory = Factory::factoryForModel($model);
  $instance = $factory->create();
  return response()->json($instance);
});
```

### 4. Chapa Payment Mocking

**Strategy**: Intercept Chapa API calls at network level

**Implementation**:
```typescript
// tests/E2E/fixtures/chapa.ts
export async function mockChapaPayment(page: Page, success: boolean = true) {
  await page.route('**/transaction/initialize', async route => {
    if (success) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            checkout_url: 'https://checkout.chapa.co/checkout/test-123'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ status: 'error' })
      });
    }
  });
  
  // Mock callback
  await page.route('**/payment/callback', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ status: 'success' })
    });
  });
}
```

### 5. File Upload Testing

**Create Test Image**:
```typescript
// tests/E2E/fixtures/files.ts
import { writeFileSync } from 'fs';
import { join } from 'path';

export function createTestImage(): string {
  const path = join(__dirname, '../fixtures/test-payment-proof.png');
  // Create a minimal PNG file for testing
  // ... implementation
  return path;
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: ecommerce_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, mysql
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install PHP Dependencies
        run: composer install
      
      - name: Install Node Dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Setup Laravel
        run: |
          cp .env.example .env.testing
          php artisan key:generate --env=testing
          php artisan migrate --env=testing --database=testing
          php artisan db:seed --env=testing --database=testing
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: ecommerce_test
          DB_USERNAME: root
          DB_PASSWORD: password
      
      - name: Start Laravel Server
        run: php artisan serve --env=testing &
      
      - name: Run E2E Tests
        run: npx playwright test
        env:
          APP_URL: http://localhost:8000
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: tests/E2E/screenshots/
```

### Test Execution Strategies

#### 1. Parallel Execution
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : 2, // Parallel workers
  fullyParallel: true, // Run all tests in parallel
});
```

#### 2. Test Sharding (for large suites)
```bash
# Split tests across multiple machines
npx playwright test --shard=1/4  # Machine 1 of 4
npx playwright test --shard=2/4  # Machine 2 of 4
```

#### 3. Retry Strategy
```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
});
```

---

## Next Steps

1. **Review and Approve Plan** ✅
2. **Install Playwright** (Phase 1.1)
3. **Create Base Infrastructure** (Phase 1.2-1.4)
4. **Implement First Flow** (Flow 1) as proof of concept
5. **Iterate and Refine** based on learnings
6. **Implement Remaining Flows** (Phase 2)
7. **Create Test Suites** (Phase 3)
8. **Set Up CI/CD** (Phase 4)

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

---

## Appendix: Example Test File Structure

See `docs/E2E_TESTING_EXAMPLES.md` for complete example implementations of each flow.

