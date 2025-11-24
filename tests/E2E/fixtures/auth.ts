import { Page } from '@playwright/test';

export interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin';
}

const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

/**
 * Create a test customer user via Laravel API
 */
export async function createTestCustomer(): Promise<TestUser> {
  const response = await fetch(`${BASE_URL}/api/test/users/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create test customer: ${error}`);
  }
  
  return await response.json();
}

/**
 * Create a test admin user via Laravel API
 */
export async function createTestAdmin(): Promise<TestUser> {
  const response = await fetch(`${BASE_URL}/api/test/users/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create test admin: ${error}`);
  }
  
  return await response.json();
}

/**
 * Login as a user via the UI
 */
export async function loginAsUser(page: Page, email: string, password: string, verbose: boolean = false): Promise<void> {
  if (verbose) console.log('[LOGIN] Navigating to login page...');
  await page.goto('/login');
  
  if (verbose) console.log('[LOGIN] Waiting for login form...');
  // Wait for the login form to be visible
  await page.waitForSelector('#email, [name="email"], input[type="email"]', { timeout: 10000 });
  
  if (verbose) console.log('[LOGIN] Filling email field...');
  // Try multiple selectors for email field (React/Inertia uses id, not name)
  const emailSelectors = ['#email', '[name="email"]', 'input[type="email"]'];
  let emailFilled = false;
  for (const selector of emailSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await element.fill(email);
      if (verbose) console.log(`[LOGIN] Email filled using selector: ${selector}`);
      emailFilled = true;
      break;
    }
  }
  if (!emailFilled && verbose) console.warn('[LOGIN] Warning: Could not fill email field');
  
  if (verbose) console.log('[LOGIN] Filling password field...');
  // Try multiple selectors for password field
  const passwordSelectors = ['#password', '[name="password"]', 'input[type="password"]'];
  let passwordFilled = false;
  for (const selector of passwordSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await element.fill(password);
      if (verbose) console.log(`[LOGIN] Password filled using selector: ${selector}`);
      passwordFilled = true;
      break;
    }
  }
  if (!passwordFilled && verbose) console.warn('[LOGIN] Warning: Could not fill password field');
  
  if (verbose) console.log('[LOGIN] Clicking submit button...');
  // Click submit button
  await page.click('button[type="submit"]');
  
  if (verbose) console.log('[LOGIN] Waiting for redirect...');
  // Wait for redirect - customers go to home (/), admins go to /admin-dashboard
  // Wait for navigation away from login page (any URL that's not /login)
  await page.waitForURL((url) => {
    const pathname = url.pathname;
    // Accept if we're not on login page anymore
    return !pathname.includes('/login');
  }, { timeout: 10000 });
  
  const currentUrl = page.url();
  if (verbose) console.log(`[LOGIN] Redirected to: ${currentUrl}`);
  
  // If we're still on login page, something went wrong
  if (currentUrl.includes('/login')) {
    const errorMsg = 'Login failed - still on login page';
    if (verbose) {
      const pageContent = await page.textContent('body');
      console.error('[LOGIN] Error:', errorMsg);
      console.error('[LOGIN] Page content snippet:', pageContent?.substring(0, 500));
    }
    throw new Error(errorMsg);
  }
  
  if (verbose) console.log('[LOGIN] Login successful!');
}

/**
 * Login as customer (quick helper)
 */
export async function loginAsCustomer(page: Page, user?: TestUser, verbose: boolean = false): Promise<TestUser> {
  const customer = user || await createTestCustomer();
  await loginAsUser(page, customer.email, customer.password, verbose);
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

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  // Try to find logout button/link
  const logoutSelectors = [
    'a[href*="logout"]',
    'button:has-text("Logout")',
    'button:has-text("Sign Out")',
    '[data-logout]',
  ];

  for (const selector of logoutSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await element.click();
      await page.waitForURL(/\/(login|home)/, { timeout: 5000 });
      return;
    }
  }

  // If no logout button found, navigate to logout route
  await page.goto('/logout');
  await page.waitForURL(/\/(login|home)/, { timeout: 5000 });
}

