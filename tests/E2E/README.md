# E2E Testing with Playwright

This directory contains end-to-end tests for the Laravel e-commerce application using Playwright.

## Directory Structure

```
tests/E2E/
├── flows/              # Individual flow tests (F1-F13)
├── suites/             # Test suites (chained flows)
├── fixtures/           # Test fixtures and helpers
│   ├── auth.ts         # Authentication helpers
│   ├── database.ts     # Database helpers
│   ├── chapa.ts        # Chapa payment mocking
│   └── payments.ts      # Payment helpers
├── helpers/            # Utility functions
│   ├── page-objects/   # Page Object Model classes
│   ├── test-helpers.ts # General test utilities
│   └── flow-chaining.ts # Flow context management
├── config/             # Test configuration
│   └── test-setup.ts    # Shared test setup
└── example.spec.ts     # Example test file
```

## Quick Start

### 1. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 2. Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### 3. Run Example Test

```bash
npx playwright test tests/E2E/example.spec.ts
```

## Test API Routes

The test API routes are available at `/api/test/*` and are only enabled in the testing environment. These routes provide helpers for:

- Creating test users (customer/admin)
- Managing test database
- Creating test products
- Managing test payments
- Storing test state for flow chaining

See `routes/test-api.php` for full documentation.

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createTestCustomer, loginAsCustomer } from './fixtures/auth';
import { createTestProduct } from './fixtures/database';

test('my test', async ({ page }) => {
  // Your test code here
});
```

### Using Fixtures

```typescript
import { createTestCustomer } from './fixtures/auth';
import { createTestProduct } from './fixtures/database';
import { mockChapaPayment } from './fixtures/chapa';

// Create test user
const customer = await createTestCustomer();

// Create test product
const product = await createTestProduct({ name: 'Test Product', price: 1000 });

// Mock Chapa payment
await mockChapaPayment(page, { success: true });
```

### Flow Chaining

```typescript
import { createFlowContext } from './helpers/flow-chaining';

const context = createFlowContext();

// Store data from one flow
await context.set('orderId', orderId);

// Retrieve in another flow
const orderId = await context.require('orderId');
```

## Configuration

Configuration is in `playwright.config.ts` at the project root. Key settings:

- **Base URL**: `http://localhost:8000` (or `APP_URL` env var)
- **Browsers**: Chromium (Chrome)
- **Test Directory**: `./tests/E2E`
- **Web Server**: Automatically starts Laravel server with `--env=testing`

## Environment Setup

Make sure you have:

1. `.env.testing` file configured
2. Test database set up
3. Migrations run: `php artisan migrate --env=testing`
4. Roles seeded: `php artisan db:seed --class=RoleAndPermissionSeeder --env=testing`

## Next Steps

1. Review the comprehensive plan: `docs/E2E_TESTING_PLAN.md`
2. Check examples: `docs/E2E_TESTING_EXAMPLES.md`
3. Understand flow sequencing: `docs/E2E_FLOW_SEQUENCING.md`
4. Start implementing flows in `flows/` directory

## Troubleshooting

### Tests can't connect to server

- Make sure Laravel server is running or `webServer` is configured in `playwright.config.ts`
- Check that `APP_URL` matches your server URL

### Database errors

- Ensure `.env.testing` is configured
- Run migrations: `php artisan migrate --env=testing`
- Check database connection settings

### Authentication fails

- Verify test API routes are registered (check `routes/web.php`)
- Check that UserFactory has `customer()` and `admin()` methods
- Ensure roles exist in database

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Laravel Testing](https://laravel.com/docs/testing)
- [E2E Testing Plan](../../docs/E2E_TESTING_PLAN.md)

