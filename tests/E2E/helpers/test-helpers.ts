import { Page } from '@playwright/test';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a test image file for upload (payment screenshot)
 * Returns a valid PNG image file path
 * 
 * Note: This creates a minimal valid PNG file (1x1 pixel) that will pass
 * Laravel's image validation. The validation accepts: PNG, JPG, GIF up to 5MB.
 * This PNG has MIME type image/png and will be accepted as payment proof.
 */
export function createTestImage(filename: string = 'test-payment-proof.png'): string {
  const dir = join(__dirname, '../fixtures');
  const path = join(dir, filename);
  
  // Create directory if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Create a minimal valid PNG file (1x1 pixel, transparent)
  // This is a real PNG file with proper headers that will pass image validation
  // MIME type: image/png
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
      if (existsSync(path)) {
        unlinkSync(path);
      }
    } catch (e) {
      // Ignore errors during cleanup
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
    '[data-order-number]',
  ];

  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      const value = await element.getAttribute('data-order-id') || 
                   await element.getAttribute('data-order-number') ||
                   await element.textContent() ||
                   await element.inputValue();
      if (value) return value.trim();
    }
  }

  // Try to extract from URL
  const url = page.url();
  const match = url.match(/order[_-]?id[=:](\d+)/i) || 
               url.match(/orders\/(\d+)/) ||
               url.match(/order_id=(\d+)/);
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
    '[data-payment-transaction-id]',
  ];

  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      const value = await element.getAttribute('data-payment-id') || 
                   await element.getAttribute('data-payment-transaction-id') ||
                   await element.textContent() ||
                   await element.inputValue();
      if (value) return value.trim();
    }
  }

  // Try to extract from URL
  const url = page.url();
  const match = url.match(/payment[_-]?id[=:](\d+)/i) || 
               url.match(/payments\/(\d+)/) ||
               url.match(/payment_id=(\d+)/);
  if (match) return match[1];

  return null;
}

/**
 * Extract product request ID from page
 */
export async function extractProductRequestId(page: Page): Promise<string | null> {
  const selectors = [
    '[data-product-request-id]',
    '.product-request-id',
    'input[name="product_request_id"]',
  ];

  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      const value = await element.getAttribute('data-product-request-id') || 
                   await element.textContent() ||
                   await element.inputValue();
      if (value) return value.trim();
    }
  }

  // Try to extract from URL
  const url = page.url();
  const match = url.match(/product[_-]?request[_-]?id[=:](\d+)/i) || 
               url.match(/product-requests\/(\d+)/) ||
               url.match(/product_request_id=(\d+)/);
  if (match) return match[1];

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
      const statusElement = document.querySelector('[data-payment-status], .payment-status');
      return statusElement?.textContent?.toLowerCase().includes(status.toLowerCase());
    },
    expectedStatus,
    { timeout }
  );
}

/**
 * Get payment by order ID via API
 */
export async function getPaymentByOrderId(orderId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/payments/by-order/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get payment: ${error}`);
  }

  return await response.json();
}

/**
 * Get payment by ID via API
 */
export async function getPaymentById(paymentId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/payments/${paymentId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get payment: ${error}`);
  }

  return await response.json();
}

/**
 * Store test state (for flow chaining)
 */
export async function storeTestState(key: string, value: any): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test/state/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to store test state: ${error}`);
  }
}

/**
 * Get test state (for flow chaining)
 */
export async function getTestState(key: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/state/${key}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get test state: ${error}`);
  }

  const data = await response.json();
  return data.value;
}

/**
 * Clear test state
 */
export async function clearTestState(key: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test/state/${key}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to clear test state: ${error}`);
  }
}

