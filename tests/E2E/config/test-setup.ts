/**
 * Test Setup Configuration
 * 
 * This file contains shared setup and teardown logic for E2E tests.
 */

import { test as base } from '@playwright/test';

/**
 * Extended test context with custom fixtures
 */
export const test = base.extend({
  // Add custom fixtures here if needed in the future
  // For example: authenticatedPage, testUser, etc.
});

export { expect } from '@playwright/test';

