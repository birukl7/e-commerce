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
  await page.route('**/payment/callback**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const txRefParam = url.searchParams.get('tx_ref') || options.txRef || txRef;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        tx_ref: txRefParam,
        data: {
          status: 'successful',
          tx_ref: txRefParam,
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
  try {
    await page.waitForURL('**/checkout.chapa.co/**', { timeout: 5000 });
    
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
  } catch (e) {
    // If not redirected (mocked), continue
    // This is expected when we mock the API calls
  }
}

/**
 * Unroute all Chapa mocks
 */
export async function unmockChapaPayment(page: Page): Promise<void> {
  await page.unroute('**/transaction/initialize');
  await page.unroute('**/payment/callback**');
  await page.unroute('**/payment/return**');
}

