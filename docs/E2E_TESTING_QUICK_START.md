# E2E Testing Quick Start Guide

This guide will help you get started with E2E testing using Playwright for your Laravel e-commerce application.

## Prerequisites

- Node.js 18+ installed
- PHP 8.2+ installed
- Composer installed
- MySQL/PostgreSQL database
- Laravel application running

## Step 1: Install Playwright

```bash
# Install Playwright as dev dependency
npm install --save-dev @playwright/test

# Install Playwright browsers
npx playwright install

# Install with system dependencies (Linux)
npx playwright install-deps
```

## Step 2: Create Playwright Configuration

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/E2E',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'php artisan serve --env=testing',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Step 3: Create Test Directory Structure

```bash
mkdir -p tests/E2E/{flows,suites,fixtures,helpers/page-objects,config}
```

## Step 4: Set Up Laravel Test API Routes

Create `routes/test-api.php`:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Product;

if (app()->environment('testing')) {
    Route::prefix('api/test')->group(function () {
        Route::post('/users/customer', function () {
            $user = User::factory()->customer()->create();
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password',
                'name' => $user->name,
            ]);
        });

        Route::post('/users/admin', function () {
            $user = User::factory()->admin()->create();
            return response()->json([
                'id' => $user->id,
                'email' => $user->email,
                'password' => 'password',
                'name' => $user->name,
            ]);
        });

        Route::post('/products', function (Request $request) {
            $product = Product::factory()->create($request->all());
            return response()->json($product);
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

## Step 5: Create Your First Test

Create `tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('Customer buys product with pay & upload', async ({ page }) => {
  // 1. Create test customer
  const customerResponse = await fetch('http://localhost:8000/api/test/users/customer', {
    method: 'POST',
  });
  const customer = await customerResponse.json();

  // 2. Create test product
  const productResponse = await fetch('http://localhost:8000/api/test/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Product',
      price: 1000,
      stock_quantity: 10,
    }),
  });
  const product = await productResponse.json();

  // 3. Login
  await page.goto('/login');
  await page.fill('[name="email"]', customer.email);
  await page.fill('[name="password"]', customer.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 4. Add product to cart
  await page.goto(`/products/${product.id}`);
  await page.click('button:has-text("Add to Cart")');

  // 5. Go to checkout
  await page.goto('/checkout');

  // 6. Select payment method
  await page.check('input[value="offline"]');

  // 7. Fill payment details
  await page.fill('[name="payment_reference"]', 'TEST-REF-123');
  
  // 8. Upload screenshot (create a test image first)
  const fileInput = page.locator('input[type="file"]');
  // You'll need to create a test image file
  // await fileInput.setInputFiles('path/to/test-image.png');

  // 9. Submit payment
  await page.click('button[type="submit"]');

  // 10. Verify success
  await expect(page.locator('.payment-success')).toBeVisible();
});
```

## Step 6: Run Your First Test

```bash
# Start Laravel server (or let Playwright start it automatically)
php artisan serve --env=testing

# In another terminal, run Playwright
npx playwright test tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts

# Or run with UI mode (recommended for development)
npx playwright test --ui
```

## Step 7: View Test Results

```bash
# Open HTML report
npx playwright show-report
```

## Common Commands

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/E2E/flows/flow-01-customer-buy-pay-upload.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests on specific browser
npx playwright test --project=chromium

# Generate code from actions (record test)
npx playwright codegen http://localhost:8000
```

## Next Steps

1. **Read the comprehensive plan**: `docs/E2E_TESTING_PLAN.md`
2. **Review examples**: `docs/E2E_TESTING_EXAMPLES.md`
3. **Understand flow sequencing**: `docs/E2E_FLOW_SEQUENCING.md`
4. **Implement remaining flows**: Follow the patterns in the examples

## Troubleshooting

### Issue: Tests can't connect to Laravel server

**Solution**: Make sure Laravel server is running or configure `webServer` in `playwright.config.ts`

### Issue: Database errors

**Solution**: 
- Create `.env.testing` file
- Run migrations: `php artisan migrate --env=testing`
- Seed database: `php artisan db:seed --env=testing`

### Issue: Authentication fails

**Solution**: 
- Check user factory exists
- Verify test API routes are registered
- Check middleware allows test routes

### Issue: Chapa payment mocking not working

**Solution**: 
- Use Playwright's `page.route()` to intercept Chapa API calls
- See `docs/E2E_TESTING_EXAMPLES.md` for Chapa mocking examples

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Laravel Testing](https://laravel.com/docs/testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Getting Help

- Check existing test examples in `tests/E2E/`
- Review comprehensive plan in `docs/E2E_TESTING_PLAN.md`
- Check Laravel logs: `storage/logs/laravel.log`
- Check Playwright trace: Open trace viewer after test failure

