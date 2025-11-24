# E2E Testing Examples - Playwright Implementation

This document provides practical examples for implementing the E2E test flows using Playwright.

## Table of Contents

1. [Configuration Setup](#configuration-setup)
2. [Base Fixtures & Helpers](#base-fixtures--helpers)
3. [Page Object Examples](#page-object-examples)
4. [Flow Implementation Examples](#flow-implementation-examples)
5. [Test Suite Examples](#test-suite-examples)

---

## Configuration Setup

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/E2E',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.APP_URL || 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'php artisan serve --env=testing',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## Base Fixtures & Helpers

### tests/E2E/fixtures/auth.ts

```typescript
import { Page } from '@playwright/test';

export interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin';
}

/**
 * Create a test customer user via Laravel API
 */
export async function createTestCustomer(): Promise<TestUser> {
  const response = await fetch('http://localhost:8000/api/test/users/customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create test customer');
  }
  
  return await response.json();
}

/**
 * Create a test admin user via Laravel API
 */
export async function createTestAdmin(): Promise<TestUser> {
  const response = await fetch('http://localhost:8000/api/test/users/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create test admin');
  }
  
  return await response.json();
}

/**
 * Login as a user via the UI
 */
export async function loginAsUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Login as customer (quick helper)
 */
export async function loginAsCustomer(page: Page, user?: TestUser): Promise<TestUser> {
  const customer = user || await createTestCustomer();
  await loginAsUser(page, customer.email, customer.password);
  return customer;
}

/**
 * Login as admin (quick helper)
 */
export async function loginAsAdmin(page: Page, user?: TestUser): Promise<TestUser> {
  const admin = user || await createTestAdmin();
  await loginAsUser(page, admin.email, admin.password);
  return admin;
}
```

### tests/E2E/fixtures/chapa.ts

```typescript
import { Page } from '@playwright/test';

/**
 * Mock Chapa payment initialization
 */
export async function mockChapaPayment(
  page: Page,
  options: {
    success?: boolean;
    checkoutUrl?: string;
    txRef?: string;
  } = {}
): Promise<void> {
  const {
    success = true,
    checkoutUrl = 'https://checkout.chapa.co/checkout/test-123',
    txRef = 'TEST-TX-' + Date.now(),
  } = options;

  // Mock Chapa API initialization endpoint
  await page.route('**/transaction/initialize', async (route) => {
    if (success) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          message: 'Payment initialized',
          data: {
            checkout_url: checkoutUrl,
            tx_ref: txRef,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          message: 'Payment initialization failed',
        }),
      });
    }
  });

  // Mock Chapa callback endpoint
  await page.route('**/payment/callback', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const txRef = url.searchParams.get('tx_ref') || options.txRef;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        tx_ref: txRef,
        data: {
          status: 'successful',
          tx_ref: txRef,
        },
      }),
    });
  });

  // Mock Chapa return URL
  await page.route('**/payment/return**', async (route) => {
    await route.continue();
  });
}

/**
 * Simulate Chapa checkout page (when redirected)
 */
export async function simulateChapaCheckout(page: Page, success: boolean = true): Promise<void> {
  // If we're redirected to Chapa checkout, simulate the payment
  await page.waitForURL('**/checkout.chapa.co/**', { timeout: 5000 }).catch(() => {
    // If not redirected (mocked), continue
  });

  // Simulate clicking "Pay" button on Chapa page
  if (success) {
    // Mock the success redirect
    await page.route('**/payment/return**', async (route) => {
      await route.fulfill({
        status: 200,
        body: '<html><body>Payment successful</body></html>',
      });
    });
  }
}
```

### tests/E2E/fixtures/database.ts

```typescript
/**
 * Reset test database
 */
export async function resetTestDatabase(): Promise<void> {
  const response = await fetch('http://localhost:8000/api/test/database/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to reset test database');
  }
}

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(): Promise<void> {
  const response = await fetch('http://localhost:8000/api/test/database/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to seed test database');
  }
}

/**
 * Create a test product
 */
export async function createTestProduct(data?: Partial<any>): Promise<any> {
  const response = await fetch('http://localhost:8000/api/test/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    throw new Error('Failed to create test product');
  }

  return await response.json();
}
```

### tests/E2E/helpers/test-helpers.ts

```typescript
import { Page } from '@playwright/test';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Create a test image file for upload
 */
export function createTestImage(): string {
  const path = join(__dirname, '../fixtures/test-payment-proof.png');
  
  // Create a minimal 1x1 PNG (base64 encoded)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(pngBase64, 'base64');
  writeFileSync(path, buffer);
  
  return path;
}

/**
 * Clean up test files
 */
export function cleanupTestFiles(paths: string[]): void {
  paths.forEach(path => {
    try {
      unlinkSync(path);
    } catch (e) {
      // Ignore errors
    }
  });
}

/**
 * Extract order ID from page
 */
export async function extractOrderId(page: Page): Promise<string | null> {
  // Try multiple selectors
  const selectors = [
    '[data-order-id]',
    '.order-id',
    'input[name="order_id"]',
  ];

  for (const selector of selectors) {
    const element = await page.locator(selector).first();
    if (await element.isVisible()) {
      const value = await element.getAttribute('data-order-id') || 
                   await element.textContent() ||
                   await element.inputValue();
      if (value) return value.trim();
    }
  }

  // Try to extract from URL
  const url = page.url();
  const match = url.match(/order[_-]?id[=:](\d+)/i) || url.match(/orders\/(\d+)/);
  if (match) return match[1];

  return null;
}

/**
 * Extract payment ID from page
 */
export async function extractPaymentId(page: Page): Promise<string | null> {
  const selectors = [
    '[data-payment-id]',
    '.payment-id',
    'input[name="payment_id"]',
  ];

  for (const selector of selectors) {
    const element = await page.locator(selector).first();
    if (await element.isVisible()) {
      const value = await element.getAttribute('data-payment-id') || 
                   await element.textContent() ||
                   await element.inputValue();
      if (value) return value.trim();
    }
  }

  return null;
}

/**
 * Wait for payment status to update
 */
export async function waitForPaymentStatus(
  page: Page,
  expectedStatus: string,
  timeout: number = 10000
): Promise<void> {
  await page.waitForFunction(
    (status) => {
      const statusElement = document.querySelector('[data-payment-status]');
      return statusElement?.textContent?.includes(status);
    },
    expectedStatus,
    { timeout }
  );
}
```

---

## Page Object Examples

### tests/E2E/helpers/page-objects/LoginPage.ts

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message, .text-red-500');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible();
    if (!isVisible) return null;
    return await this.errorMessage.textContent();
  }
}
```

### tests/E2E/helpers/page-objects/CheckoutPage.ts

```typescript
import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly paymentMethodSelect: Locator;
  readonly payUploadProofOption: Locator;
  readonly chapaOption: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentMethodSelect = page.locator('[name="payment_method"]');
    this.payUploadProofOption = page.locator('input[value="offline"], input[value="pay_upload"]');
    this.chapaOption = page.locator('input[value="chapa"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(orderId?: string): Promise<void> {
    if (orderId) {
      await this.page.goto(`/checkout?order_id=${orderId}`);
    } else {
      await this.page.goto('/checkout');
    }
  }

  async selectPaymentMethod(method: 'offline' | 'chapa'): Promise<void> {
    if (method === 'offline') {
      await this.payUploadProofOption.check();
    } else {
      await this.chapaOption.check();
    }
  }

  async fillOfflinePaymentDetails(data: {
    paymentReference?: string;
    paymentNotes?: string;
    screenshotPath: string;
  }): Promise<void> {
    if (data.paymentReference) {
      await this.page.fill('[name="payment_reference"]', data.paymentReference);
    }
    if (data.paymentNotes) {
      await this.page.fill('[name="payment_notes"]', data.paymentNotes);
    }
    
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(data.screenshotPath);
  }

  async fillChapaDetails(data: { phoneNumber: string }): Promise<void> {
    await this.page.fill('[name="phone_number"]', data.phoneNumber);
  }

  async submitPayment(): Promise<void> {
    await this.submitButton.click();
  }

  async waitForSuccess(): Promise<void> {
    await this.page.waitForSelector('.payment-success, [data-payment-success]', {
      state: 'visible',
      timeout: 15000,
    });
  }
}
```

### tests/E2E/helpers/page-objects/AdminDashboardPage.ts

```typescript
import { Page, Locator } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly paymentsLink: Locator;
  readonly productRequestsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentsLink = page.locator('a[href*="payment"], a:has-text("Payments")');
    this.productRequestsLink = page.locator('a[href*="product-request"], a:has-text("Product Requests")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin-dashboard');
  }

  async navigateToPayments(): Promise<void> {
    await this.paymentsLink.click();
    await this.page.waitForURL('**/admin/payment**');
  }

  async navigateToProductRequests(): Promise<void> {
    await this.productRequestsLink.click();
    await this.page.waitForURL('**/admin/product-requests**');
  }
}
```

### tests/E2E/helpers/page-objects/PaymentPage.ts

```typescript
import { Page, Locator } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly notesInput: Locator;
  readonly rejectionReasonSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.approveButton = page.locator('button:has-text("Approve"), [data-action="approve"]');
    this.rejectButton = page.locator('button:has-text("Reject"), [data-action="reject"]');
    this.notesInput = page.locator('[name="notes"], textarea[name="admin_notes"]');
    this.rejectionReasonSelect = page.locator('[name="rejection_reason_code"]');
  }

  async goto(paymentId: string): Promise<void> {
    await this.page.goto(`/admin/payments/${paymentId}`);
  }

  async approve(notes?: string): Promise<void> {
    if (notes) {
      await this.notesInput.fill(notes);
    }
    await this.approveButton.click();
    await this.page.waitForSelector('.success-message, [data-success]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async reject(reasonCode: string, notes?: string): Promise<void> {
    await this.rejectButton.click();
    await this.page.waitForSelector('[name="rejection_reason_code"]', { state: 'visible' });
    
    await this.rejectionReasonSelect.selectOption(reasonCode);
    
    if (notes) {
      await this.notesInput.fill(notes);
    }
    
    await this.page.locator('button:has-text("Confirm Reject"), button[type="submit"]').click();
    await this.page.waitForSelector('.success-message, [data-success]', {
      state: 'visible',
      timeout: 5000,
    });
  }

  async getPaymentStatus(): Promise<string | null> {
    const statusElement = this.page.locator('[data-payment-status], .payment-status');
    if (await statusElement.isVisible()) {
      return await statusElement.textContent();
    }
    return null;
  }
}
```

---

## Flow Implementation Examples

### Flow 1: Customer Buy Product (Pay & Upload Proof)

```typescript
// tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsCustomer, createTestCustomer, TestUser } from '../fixtures/auth';
import { createTestProduct } from '../fixtures/database';
import { createTestImage, cleanupTestFiles, extractOrderId } from '../helpers/test-helpers';
import { LoginPage } from '../helpers/page-objects/LoginPage';
import { CheckoutPage } from '../helpers/page-objects/CheckoutPage';

test.describe('Flow 1: Customer Buy Product (Pay & Upload Proof)', () => {
  let customer: TestUser;
  let product: any;
  let testImagePath: string;

  test.beforeAll(async () => {
    customer = await createTestCustomer();
    product = await createTestProduct({
      name: 'Test Product for E2E',
      price: 1000,
      stock_quantity: 10,
    });
    testImagePath = createTestImage();
  });

  test.afterAll(async () => {
    cleanupTestFiles([testImagePath]);
  });

  test('should complete purchase with pay & upload proof', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Login as customer
    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);
    await expect(page).toHaveURL(/.*dashboard/);

    // Step 2: Browse and add product to cart
    await page.goto(`/products/${product.id}`);
    await page.click('button:has-text("Add to Cart"), [data-add-to-cart]');
    
    // Wait for cart update
    await page.waitForTimeout(500);

    // Step 3: Proceed to checkout
    await page.goto('/checkout');
    await expect(page).toHaveURL(/.*checkout/);

    // Step 4: Select payment method
    await checkoutPage.selectPaymentMethod('offline');

    // Step 5: Fill payment details
    await checkoutPage.fillOfflinePaymentDetails({
      paymentReference: 'TEST-REF-' + Date.now(),
      paymentNotes: 'E2E test payment',
      screenshotPath: testImagePath,
    });

    // Step 6: Submit payment
    await checkoutPage.submitPayment();

    // Step 7: Verify success
    await checkoutPage.waitForSuccess();
    
    // Step 8: Verify payment status
    const orderId = await extractOrderId(page);
    expect(orderId).not.toBeNull();

    // Verify in database via API
    const paymentResponse = await page.request.get(
      `http://localhost:8000/api/test/payments/by-order/${orderId}`
    );
    const payment = await paymentResponse.json();
    
    expect(payment.gateway_status).toBe('proof_uploaded');
    expect(payment.admin_status).toBe('unseen');
  });
});
```

### Flow 2: Customer Buy Product (Chapa)

```typescript
// tests/E2E/flows/flow-02-customer-buy-chapa.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsCustomer, createTestCustomer, TestUser } from '../fixtures/auth';
import { createTestProduct } from '../fixtures/database';
import { mockChapaPayment, simulateChapaCheckout } from '../fixtures/chapa';
import { extractOrderId } from '../helpers/test-helpers';
import { LoginPage } from '../helpers/page-objects/LoginPage';
import { CheckoutPage } from '../helpers/page-objects/CheckoutPage';

test.describe('Flow 2: Customer Buy Product (Chapa)', () => {
  let customer: TestUser;
  let product: any;

  test.beforeAll(async () => {
    customer = await createTestCustomer();
    product = await createTestProduct({
      name: 'Test Product for Chapa E2E',
      price: 1500,
      stock_quantity: 10,
    });
  });

  test('should complete purchase with Chapa payment', async ({ page }) => {
    // Mock Chapa payment
    await mockChapaPayment(page, { success: true });

    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Step 1: Login
    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);

    // Step 2: Add to cart and checkout
    await page.goto(`/products/${product.id}`);
    await page.click('button:has-text("Add to Cart")');
    await page.goto('/checkout');

    // Step 3: Select Chapa payment
    await checkoutPage.selectPaymentMethod('chapa');

    // Step 4: Fill Chapa details
    await checkoutPage.fillChapaDetails({
      phoneNumber: '+251911223344',
    });

    // Step 5: Submit payment
    await checkoutPage.submitPayment();

    // Step 6: Handle Chapa redirect (mocked)
    await simulateChapaCheckout(page, true);

    // Step 7: Wait for return from Chapa
    await page.waitForURL('**/payment/return**', { timeout: 10000 });

    // Step 8: Verify success
    await expect(page.locator('.payment-success, [data-payment-success]')).toBeVisible();

    // Step 9: Verify payment status
    const orderId = await extractOrderId(page);
    expect(orderId).not.toBeNull();

    // Verify payment in database
    const paymentResponse = await page.request.get(
      `http://localhost:8000/api/test/payments/by-order/${orderId}`
    );
    const payment = await paymentResponse.json();
    
    expect(payment.gateway_status).toBe('processing');
    expect(payment.payment_method).toBe('chapa');
  });
});
```

### Flow 3: Admin Approve Payment

```typescript
// tests/E2E/flows/flow-03-admin-approve-payment.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsAdmin, createTestAdmin, TestUser } from '../fixtures/auth';
import { AdminDashboardPage } from '../helpers/page-objects/AdminDashboardPage';
import { PaymentPage } from '../helpers/page-objects/PaymentPage';

test.describe('Flow 3: Admin Approve Payment', () => {
  let admin: TestUser;
  let paymentId: string;

  // This test assumes a payment exists (from Flow 1 or Flow 2)
  // In a real suite, this would be chained with previous flows
  test.beforeAll(async ({ browser }) => {
    admin = await createTestAdmin();
    
    // Create a test payment via API
    const context = await browser.newContext();
    const page = await context.newPage();
    const response = await page.request.post('http://localhost:8000/api/test/payments/create', {
      data: {
        order_id: 1, // Would come from previous flow
        amount: 1000,
        gateway_status: 'proof_uploaded',
        admin_status: 'unseen',
      },
    });
    const payment = await response.json();
    paymentId = payment.id.toString();
    await context.close();
  });

  test('should approve customer payment', async ({ page }) => {
    const adminDashboard = new AdminDashboardPage(page);
    const paymentPage = new PaymentPage(page);

    // Step 1: Login as admin
    await loginAsAdmin(page, admin);

    // Step 2: Navigate to payments
    await adminDashboard.goto();
    await adminDashboard.navigateToPayments();

    // Step 3: Find and view payment
    await paymentPage.goto(paymentId);

    // Step 4: Verify payment details
    const statusBefore = await paymentPage.getPaymentStatus();
    expect(statusBefore).toContain('unseen');

    // Step 5: Approve payment
    await paymentPage.approve('Payment approved via E2E test');

    // Step 6: Verify success message
    await expect(page.locator('.success-message, [data-success]')).toBeVisible();

    // Step 7: Verify payment status updated
    const statusAfter = await paymentPage.getPaymentStatus();
    expect(statusAfter).toContain('approved');

    // Step 8: Verify in database
    const paymentResponse = await page.request.get(
      `http://localhost:8000/api/test/payments/${paymentId}`
    );
    const payment = await paymentResponse.json();
    
    expect(payment.admin_status).toBe('approved');
    expect(payment.admin_id).toBe(admin.id);
  });
});
```

---

## Test Suite Examples

### Regular Purchase Suite

```typescript
// tests/E2E/suites/regular-purchase.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsCustomer, createTestCustomer, TestUser } from '../fixtures/auth';
import { loginAsAdmin, createTestAdmin } from '../fixtures/auth';
import { createTestProduct } from '../fixtures/database';
import { mockChapaPayment } from '../fixtures/chapa';
import { createTestImage, cleanupTestFiles, extractOrderId } from '../helpers/test-helpers';
import { LoginPage } from '../helpers/page-objects/LoginPage';
import { CheckoutPage } from '../helpers/page-objects/CheckoutPage';
import { AdminDashboardPage } from '../helpers/page-objects/AdminDashboardPage';
import { PaymentPage } from '../helpers/page-objects/PaymentPage';

test.describe('Regular Purchase Suite', () => {
  let customer: TestUser;
  let admin: TestUser;
  let product: any;
  let orderId: string | null = null;
  let paymentId: string | null = null;
  let testImagePath: string;

  test.beforeAll(async () => {
    customer = await createTestCustomer();
    admin = await createTestAdmin();
    product = await createTestProduct({
      name: 'Suite Test Product',
      price: 2000,
      stock_quantity: 10,
    });
    testImagePath = createTestImage();
  });

  test.afterAll(async () => {
    cleanupTestFiles([testImagePath]);
  });

  test('Flow 1: Customer buys product with pay & upload', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(customer.email, customer.password);

    await page.goto(`/products/${product.id}`);
    await page.click('button:has-text("Add to Cart")');
    await page.goto('/checkout');

    await checkoutPage.selectPaymentMethod('offline');
    await checkoutPage.fillOfflinePaymentDetails({
      paymentReference: 'SUITE-TEST-' + Date.now(),
      screenshotPath: testImagePath,
    });
    await checkoutPage.submitPayment();
    await checkoutPage.waitForSuccess();

    orderId = await extractOrderId(page);
    expect(orderId).not.toBeNull();

    // Get payment ID
    const paymentResponse = await page.request.get(
      `http://localhost:8000/api/test/payments/by-order/${orderId}`
    );
    const payment = await paymentResponse.json();
    paymentId = payment.id.toString();
  });

  test('Flow 3: Admin approves payment', async ({ page }) => {
    // This test depends on Flow 1
    test.skip(!paymentId, 'Payment ID not available from Flow 1');

    const adminDashboard = new AdminDashboardPage(page);
    const paymentPage = new PaymentPage(page);

    await loginAsAdmin(page, admin);
    await adminDashboard.goto();
    await adminDashboard.navigateToPayments();
    await paymentPage.goto(paymentId!);
    await paymentPage.approve('Approved in E2E suite test');

    const status = await paymentPage.getPaymentStatus();
    expect(status).toContain('approved');
  });
});
```

### Full Product Request Lifecycle Suite

```typescript
// tests/E2E/suites/full-product-request-lifecycle.spec.ts
import { test, expect } from '@playwright/test';
// ... imports similar to above

test.describe('Full Product Request Lifecycle', () => {
  let customer: TestUser;
  let admin: TestUser;
  let productRequestId: string | null = null;
  let advancePaymentId: string | null = null;
  let finalPaymentId: string | null = null;

  test.beforeAll(async () => {
    customer = await createTestCustomer();
    admin = await createTestAdmin();
  });

  test('Flow 4: Customer requests product', async ({ page }) => {
    // Implementation for product request
    // Store productRequestId for next flows
  });

  test('Flow 5: Admin approves request', async ({ page }) => {
    test.skip(!productRequestId, 'Product request not available');
    // Implementation for admin approval
  });

  test('Flow 7: Customer pays advance (upload)', async ({ page }) => {
    test.skip(!productRequestId, 'Product request not available');
    // Implementation for advance payment
    // Store advancePaymentId
  });

  test('Flow 9: Admin approves advance', async ({ page }) => {
    test.skip(!advancePaymentId, 'Advance payment not available');
    // Implementation for advance approval
  });

  // ... continue with procurement and final payment flows
});
```

---

## Laravel Test API Routes

You'll need to create these API routes for E2E testing (only enabled in testing environment):

```php
// routes/test-api.php
<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use App\Models\Product;
use App\Models\PaymentTransaction;
use App\Models\ProductRequest;

if (app()->environment('testing')) {
    Route::prefix('api/test')->group(function () {
        // User creation
        Route::post('/users/customer', function () {
            $user = User::factory()->customer()->create();
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password', // Factory default
                'name' => $user->name,
                'role' => 'customer',
            ]);
        });

        Route::post('/users/admin', function () {
            $user = User::factory()->admin()->create();
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password',
                'name' => $user->name,
                'role' => 'admin',
            ]);
        });

        // Database management
        Route::post('/database/reset', function () {
            Artisan::call('migrate:fresh', ['--seed' => true]);
            return response()->json(['status' => 'success']);
        });

        Route::post('/database/seed', function () {
            Artisan::call('db:seed');
            return response()->json(['status' => 'success']);
        });

        // Product creation
        Route::post('/products', function (Request $request) {
            $product = Product::factory()->create($request->all());
            return response()->json($product);
        });

        // Payment helpers
        Route::get('/payments/by-order/{orderId}', function ($orderId) {
            $payment = PaymentTransaction::where('order_id', $orderId)->first();
            return response()->json($payment);
        });

        Route::get('/payments/{id}', function ($id) {
            $payment = PaymentTransaction::findOrFail($id);
            return response()->json($payment);
        });

        Route::post('/payments/create', function (Request $request) {
            $payment = PaymentTransaction::create($request->all());
            return response()->json($payment);
        });
    });
}
```

Register in `routes/web.php`:
```php
if (app()->environment('testing')) {
    require __DIR__.'/test-api.php';
}
```

---

This provides a solid foundation for implementing all 13 flows. Each flow can be implemented following these patterns.

