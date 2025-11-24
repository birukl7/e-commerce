import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email, [name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('#password, [name="password"], input[type="password"]').first();
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message, .text-red-500, [role="alert"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string): Promise<void> {
    await this.goto();
    
    // Wait for form to be visible
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    
    // Wait for navigation away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
  }

  async getErrorMessage(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible();
    if (!isVisible) return null;
    return await this.errorMessage.textContent();
  }
}

