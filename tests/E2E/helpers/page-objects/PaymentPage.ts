import { Page, Locator } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;
  readonly offlineMethodSelect: Locator;
  readonly paymentReferenceInput: Locator;
  readonly paymentNotesInput: Locator;
  readonly screenshotInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.offlineMethodSelect = page.locator('[name="offline_payment_method_id"], select[name*="method"]').first();
    this.paymentReferenceInput = page.locator('[name="payment_reference"], input[placeholder*="reference" i]').first();
    this.paymentNotesInput = page.locator('[name="payment_notes"], textarea[name*="notes" i]').first();
    this.screenshotInput = page.locator('input[type="file"]').first();
    this.submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Upload")').first();
    this.successMessage = page.locator('.success, [data-success], .payment-success').first();
  }

  async goto(orderId?: string): Promise<void> {
    if (orderId) {
      await this.page.goto(`/payment/process?order_id=${orderId}`);
    } else {
      await this.page.goto('/payment/process');
    }
    await this.page.waitForLoadState('networkidle');
  }

  async selectOfflineMethod(methodId?: string | number): Promise<void> {
    // If methodId not provided, select first available method
    if (!methodId) {
      // Try to get first method from radio group or select
      const firstMethod = this.page.locator('input[type="radio"][name*="method"], input[type="radio"][value]').first();
      if (await firstMethod.isVisible()) {
        await firstMethod.click();
        await this.page.waitForTimeout(300);
        return;
      }
      
      // Try select dropdown
      if (await this.offlineMethodSelect.isVisible()) {
        const options = this.page.locator(`${this.offlineMethodSelect.selector} option`).nth(1); // Skip first (usually "Select...")
        if (await options.isVisible()) {
          await this.offlineMethodSelect.selectOption({ index: 1 });
          return;
        }
      }
      return;
    }

    // Try multiple ways to select the method
    const selectors = [
      `input[value="${methodId}"]`,
      `input[type="radio"][value="${methodId}"]`,
      `[data-method-id="${methodId}"]`,
      `button:has-text("${methodId}")`,
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        await this.page.waitForTimeout(300);
        return;
      }
    }

    // Fallback: use select dropdown
    if (await this.offlineMethodSelect.isVisible()) {
      await this.offlineMethodSelect.selectOption(methodId.toString());
    }
  }

  async fillPaymentReference(reference: string): Promise<void> {
    if (await this.paymentReferenceInput.isVisible()) {
      await this.paymentReferenceInput.fill(reference);
    }
  }

  async fillPaymentNotes(notes: string): Promise<void> {
    if (await this.paymentNotesInput.isVisible()) {
      await this.paymentNotesInput.fill(notes);
    }
  }

  async uploadScreenshot(filePath: string): Promise<void> {
    if (await this.screenshotInput.isVisible()) {
      await this.screenshotInput.setInputFiles(filePath);
    } else {
      // Try drag and drop area
      const dropZone = this.page.locator('[data-dropzone], .dropzone, [role="button"]:has-text("Upload")').first();
      if (await dropZone.isVisible()) {
        await dropZone.setInputFiles(filePath);
      }
    }
  }

  async submitPayment(): Promise<void> {
    // Listen for navigation and responses
    const navigationPromise = this.page.waitForNavigation({ timeout: 30000 }).catch(() => null);
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/payment/offline/submit') && response.status() < 500,
      { timeout: 30000 }
    ).catch(() => null);
    
    await this.submitButton.click();
    
    // Wait for either navigation or response
    await Promise.race([navigationPromise, responsePromise]);
    
    // Wait a bit for any redirects
    await this.page.waitForTimeout(2000);
  }

  async waitForSuccess(): Promise<void> {
    const currentUrl = this.page.url();
    console.log('Current URL before waiting for success:', currentUrl);
    
    // Check if we're already on a success page
    if (currentUrl.includes('/payment/offline/success') || currentUrl.includes('/payment/success')) {
      console.log('Already on success page');
      return;
    }
    
    // Wait for redirect to success page or success message
    try {
      await Promise.race([
        this.page.waitForURL('**/payment/offline/success**', { timeout: 20000 }),
        this.page.waitForURL('**/payment/success**', { timeout: 20000 }),
        this.page.waitForURL((url) => url.pathname.includes('success'), { timeout: 20000 }),
        this.successMessage.waitFor({ state: 'visible', timeout: 20000 }),
      ]);
      
      const finalUrl = this.page.url();
      console.log('Success! Final URL:', finalUrl);
    } catch (error) {
      // If timeout, check what page we're on and if there are any errors
      const finalUrl = this.page.url();
      const pageContent = await this.page.textContent('body').catch(() => '');
      const hasError = pageContent?.toLowerCase().includes('error') || 
                      pageContent?.toLowerCase().includes('failed') ||
                      await this.page.locator('.error, [role="alert"]').isVisible().catch(() => false);
      
      console.error('Failed to reach success page. Current URL:', finalUrl);
      console.error('Page has error:', hasError);
      
      if (hasError) {
        const errorText = await this.page.locator('.error, [role="alert"]').first().textContent().catch(() => '');
        throw new Error(`Payment submission failed. Error: ${errorText || 'Unknown error'}. Current URL: ${finalUrl}`);
      }
      
      throw new Error(`Payment submission timeout. Expected redirect to success page but stayed on: ${finalUrl}`);
    }
  }

  async getOrderId(): Promise<string | null> {
    // Try to extract from URL
    const url = this.page.url();
    const match = url.match(/order[_-]?id[=:](\w+)/i);
    if (match) return match[1];

    // Try to find in page
    const orderIdElement = this.page.locator('[data-order-id], .order-id').first();
    if (await orderIdElement.isVisible()) {
      return await orderIdElement.getAttribute('data-order-id') || await orderIdElement.textContent();
    }

    return null;
  }
}

