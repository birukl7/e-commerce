import { test, expect } from '@playwright/test';
import { createTestCustomer, loginAsCustomer } from './fixtures/auth';
import { createTestProduct } from './fixtures/database';

/**
 * Example E2E Test
 * 
 * This is a simple example test to verify the E2E setup is working correctly.
 * You can use this as a template for creating your flow tests.
 */
test.describe('E2E Setup Verification', () => {
  test('should be able to create test user and product', async ({ page }) => {
    // Test that we can create a test customer
    const customer = await createTestCustomer();
    expect(customer).toBeDefined();
    expect(customer.email).toBeTruthy();
    expect(customer.role).toBe('customer');

    // Test that we can create a test product
    const product = await createTestProduct({
      name: 'Test Product',
      price: 1000,
      stock_quantity: 10,
    });
    expect(product).toBeDefined();
    expect(product.id).toBeTruthy();
  });

  test('should be able to login as customer', async ({ page }) => {
    // Enable verbose logging for this test
    const verbose = process.env.VERBOSE === 'true' || process.env.DEBUG === 'true';
    
    // Create and login as customer
    const customer = await createTestCustomer();
    if (verbose) console.log('Created test customer:', customer.email);
    
    await loginAsCustomer(page, customer, verbose);

    // Verify we're logged in - customers redirect to home (/)
    const currentUrl = page.url();
    if (verbose) console.log('Current URL after login:', currentUrl);
    
    // Should not be on login page anymore
    expect(currentUrl).not.toContain('/login');
    
    // Should be on home page (/) or dashboard
    const isValidRedirect = currentUrl.endsWith('/') || 
                           currentUrl.includes('/home') || 
                           currentUrl.includes('/dashboard');
    expect(isValidRedirect).toBeTruthy();
  });

  test('should be able to access home page', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads
    await expect(page).toHaveTitle(/./); // Any title is fine
    
    // Check that page is not an error page
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});

