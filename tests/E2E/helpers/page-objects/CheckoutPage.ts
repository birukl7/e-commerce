import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly payNowButton: Locator;
  readonly onlinePaymentOption: Locator;
  readonly offlinePaymentOption: Locator;
  readonly proceedButton: Locator;
  readonly paymentDialog: Locator;
  readonly offlinePaymentDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    // More flexible selectors for Pay Now button (handles translations)
    this.payNowButton = page.locator('button:has-text("Pay Now"), button:has-text("Pay"), button[class*="Button"]:not([disabled])').first();
    this.onlinePaymentOption = page.locator('input[value="online"], input[value="chapa"], [data-payment="online"]').first();
    this.offlinePaymentOption = page.locator('input[value="offline"], [data-payment="offline"]').first();
    this.proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")').first();
    this.paymentDialog = page.locator('[role="dialog"]:has-text("Payment"), .payment-dialog').first();
    this.offlinePaymentDialog = page.locator('[role="dialog"]:has-text("Offline"), .offline-payment-dialog').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for CartProvider to initialize and read from localStorage
    // The cart context reads from localStorage on mount
    await this.page.waitForTimeout(2000);
    
    // Wait for the page to render (check if empty cart message or cart items appear)
    await Promise.race([
      this.page.waitForSelector('text=Your cart is empty', { timeout: 3000 }).catch(() => null),
      this.page.waitForSelector('[data-cart-item], .cart-item, img[alt*="product" i]', { timeout: 3000 }).catch(() => null),
      this.page.waitForSelector('button:has-text("Pay"), button:has-text("Pay Now")', { timeout: 3000 }).catch(() => null),
    ]);
  }

  async clickPayNow(): Promise<void> {
    // Wait for checkout page to fully load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Check if cart has items first
    const hasItems = await this.hasItems();
    if (!hasItems) {
      throw new Error('Cannot click Pay Now: cart is empty');
    }
    
    // Try multiple selectors for Pay Now button
    const payNowSelectors = [
      'button:has-text("Pay Now")',
      'button:has-text("Pay")',
      'button[class*="Button"]:not([disabled])',
      'button[type="button"]:not([disabled])',
    ];
    
    let buttonFound = false;
    for (const selector of payNowSelectors) {
      const button = this.page.locator(selector).first();
      const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
      const isEnabled = isVisible ? await button.isEnabled().catch(() => false) : false;
      
      if (isVisible && isEnabled) {
        await button.scrollIntoViewIfNeeded();
        await button.click();
        buttonFound = true;
        break;
      }
    }
    
    if (!buttonFound) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: 'test-results/checkout-debug.png' });
      throw new Error('Pay Now button not found or disabled on checkout page');
    }
    
    // Wait for payment method selection to appear
    await this.page.waitForTimeout(1000);
    
    // Check if payment methods are now visible
    const paymentMethodsVisible = await this.page.locator('text=Choose Payment Method, text=Payment Method, h3').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!paymentMethodsVisible) {
      // Wait a bit more
      await this.page.waitForTimeout(1000);
    }
  }

  async selectPaymentMethod(method: 'online' | 'offline'): Promise<void> {
    // Wait for payment method options to be visible
    await this.page.waitForTimeout(500);
    
    if (method === 'offline') {
      // Try multiple selectors for offline payment
      const offlineSelectors = [
        'button:has-text("Offline")',
        'button:has-text("Pay & Upload")',
        '[data-method="offline"]',
        'input[value="offline"]',
        'div:has-text("Offline"):has-text("Payment")',
      ];
      
      for (const selector of offlineSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await this.page.waitForTimeout(500);
          return;
        }
      }
    } else {
      // Try multiple selectors for online payment
      const onlineSelectors = [
        'button:has-text("Online")',
        'button:has-text("Chapa")',
        '[data-method="online"]',
        'input[value="online"]',
        'input[value="chapa"]',
      ];
      
      for (const selector of onlineSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await this.page.waitForTimeout(500);
          return;
        }
      }
    }
  }

  async waitForOfflinePaymentDialog(): Promise<void> {
    // Wait for offline payment dialog to open
    await this.offlinePaymentDialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  async hasItems(): Promise<boolean> {
    // Wait for page to load
    await this.page.waitForLoadState('networkidle');
    
    // Check for empty cart message
    const emptyCartSelectors = [
      'text=Your cart is empty',
      'text=Cart is empty',
      'text=No items',
      '[data-empty-cart]',
    ];
    
    for (const selector of emptyCartSelectors) {
      const isEmpty = await this.page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false);
      if (isEmpty) {
        return false;
      }
    }
    
    // Check for cart items (product names, images, etc.)
    const hasItemsSelectors = [
      '[data-cart-item]',
      '.cart-item',
      'img[alt*="product" i]',
      'text=/Product|Item/i',
    ];
    
    for (const selector of hasItemsSelectors) {
      const hasItems = await this.page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (hasItems) {
        return true;
      }
    }
    
    // Default to true if we can't determine (assume items exist)
    return true;
  }
}

