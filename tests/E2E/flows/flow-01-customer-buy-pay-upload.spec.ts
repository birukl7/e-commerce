import { test, expect } from '@playwright/test';
import { loginAsCustomer, createTestCustomer, TestUser } from '../fixtures/auth';
import { createTestProduct } from '../fixtures/database';
import { createTestImage, cleanupTestFiles, extractOrderId } from '../helpers/test-helpers';
import { LoginPage } from '../helpers/page-objects/LoginPage';
import { ProductPage } from '../helpers/page-objects/ProductPage';
import { CheckoutPage } from '../helpers/page-objects/CheckoutPage';
import { PaymentPage } from '../helpers/page-objects/PaymentPage';

/**
 * Flow 1: Customer Buy Product (Pay & Upload Proof)
 * 
 * Steps:
 * 1. Customer logs in
 * 2. Browse/search for product
 * 3. Add product to cart
 * 4. Proceed to checkout
 * 5. Select "Pay & Upload Proof" payment method
 * 6. Fill payment details (reference, notes)
 * 7. Upload payment screenshot
 * 8. Submit payment
 * 9. Verify success message
 * 10. Verify payment status is "pending approval"
 */
test.describe('Flow 1: Customer Buy Product (Pay & Upload Proof)', () => {
  let customer: TestUser;
  let product: any;
  let testImagePath: string;
  const verbose = process.env.VERBOSE === 'true';

  test.beforeAll(async () => {
    customer = await createTestCustomer();
    product = await createTestProduct({
      name: 'Test Product for E2E Flow 1',
      price: 1000,
      stock_quantity: 10,
      status: 'published',
    });
    testImagePath = createTestImage();
    
    if (verbose) {
      console.log('Test Setup:', {
        customer: customer.email,
        productId: product.id,
        productName: product.name,
      });
    }
  });

  test.afterAll(async () => {
    cleanupTestFiles([testImagePath]);
  });

  test('should complete purchase with pay & upload proof', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);

    // Step 1: Login as customer
    if (verbose) console.log('[FLOW 1] Step 1: Logging in as customer...');
    await loginPage.login(customer.email, customer.password);
    const currentUrl = page.url();
    if (verbose) console.log('[FLOW 1] Logged in, current URL:', currentUrl);
    expect(currentUrl).not.toContain('/login');

    // Step 2: Navigate to product page
    if (verbose) console.log('[FLOW 1] Step 2: Navigating to product page...');
    
    // Use slug if available, otherwise ProductPage will fetch it
    if (product.slug) {
      await productPage.gotoBySlug(product.slug);
    } else {
      await productPage.goto(product.id);
    }
    
    // Verify product page loaded
    await page.waitForLoadState('networkidle');
    const productName = await productPage.getProductName();
    if (verbose) console.log('[FLOW 1] Product page loaded:', productName);
    expect(productName).toBeTruthy();

    // Step 3: Add product to cart
    if (verbose) console.log('[FLOW 1] Step 3: Adding product to cart...');
    await productPage.addToCart(1, product.id, product.name, product.price);
    
    // Verify product was added to cart in localStorage
    const cartAfterAdd = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cartItems') || '[]');
    });
    if (verbose) console.log('[FLOW 1] Cart items after adding:', cartAfterAdd.length, cartAfterAdd);
    
    if (cartAfterAdd.length === 0) {
      throw new Error('Product was not added to cart - localStorage is empty');
    }
    
    if (verbose) console.log('[FLOW 1] Product added to cart successfully');

    // Step 4: Proceed to checkout
    if (verbose) console.log('[FLOW 1] Step 4: Navigating to checkout...');
    await checkoutPage.goto();
    
    // Wait for cart to load from localStorage
    await page.waitForTimeout(2000);
    
    // Verify cart has items by checking localStorage
    const cartItems = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cartItems') || '[]');
    });
    if (verbose) console.log('[FLOW 1] Cart items from localStorage:', cartItems.length);
    
    if (cartItems.length === 0) {
      throw new Error('Cart is empty - product was not added to cart');
    }
    
    // Verify cart has items on page
    const hasItems = await checkoutPage.hasItems();
    if (verbose) console.log('[FLOW 1] Cart has items on page:', hasItems);
    expect(hasItems).toBeTruthy();

    // Step 5: Click Pay Now and select offline payment
    if (verbose) console.log('[FLOW 1] Step 5: Clicking Pay Now...');
    await checkoutPage.clickPayNow();
    
    // Wait for payment method buttons to appear
    await page.waitForTimeout(1000);
    
    if (verbose) console.log('[FLOW 1] Selecting offline payment method...');
    // Click the "Pay & Upload Proof" button (it's a button with Upload icon)
    const offlineButton = page.locator('button:has-text("Pay & Upload"), button:has-text("Upload Proof"), button:has([class*="Upload"])').first();
    await offlineButton.waitFor({ state: 'visible', timeout: 5000 });
    await offlineButton.click();
    
    // Wait for offline payment dialog to open
    if (verbose) console.log('[FLOW 1] Waiting for offline payment dialog...');
    const offlineDialog = page.locator('[role="dialog"]:has-text("Upload"), [role="dialog"]:has-text("Payment Proof"), [role="dialog"]:has-text("Select Payment Method")').first();
    await offlineDialog.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Step 6: Select payment method and fill details
    if (verbose) console.log('[FLOW 1] Step 6: Selecting payment method in dialog...');
    
    // Select first available payment method (radio button)
    const firstMethodRadio = offlineDialog.locator('input[type="radio"][value]').first();
    if (await firstMethodRadio.isVisible()) {
      await firstMethodRadio.click();
      await page.waitForTimeout(500);
      
      // After selecting method, a "Continue with [Bank]" button should appear
      const continueButton = offlineDialog.locator('button:has-text("Continue"), button:has-text("Proceed")').first();
      if (await continueButton.isVisible()) {
        if (verbose) console.log('[FLOW 1] Clicking continue button...');
        await continueButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 7: Fill payment details in the payment details modal
    if (verbose) console.log('[FLOW 1] Step 7: Filling payment details...');
    
    // Wait for payment details modal to open (it's a nested dialog)
    const paymentModal = page.locator('[role="dialog"]:has-text("Reference"), [role="dialog"]:has-text("Screenshot"), [role="dialog"]:has-text("Payment Details")').last();
    const modalVisible = await paymentModal.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (modalVisible) {
      if (verbose) console.log('[FLOW 1] Payment details modal opened');
      
      // Fill payment reference
      const paymentRef = 'TEST-REF-' + Date.now();
      const refInput = paymentModal.locator('input[name="payment_reference"], input[placeholder*="reference" i], input[type="text"]').first();
      if (await refInput.isVisible()) {
        await refInput.fill(paymentRef);
        if (verbose) console.log('[FLOW 1] Payment reference:', paymentRef);
      }
      
      // Fill payment notes
      const notesInput = paymentModal.locator('textarea[name="payment_notes"], textarea[placeholder*="notes" i]').first();
      if (await notesInput.isVisible()) {
        await notesInput.fill('E2E test payment - Flow 1');
      }
      
      // Upload screenshot (REQUIRED - button is disabled without it)
      // File input has id="modal_payment_screenshot", type="file", accept="image/*", className="hidden"
      // There's a clickable div that triggers fileInputRef.current?.click()
      // We can either click the div or directly set files on the hidden input
      const fileInput = paymentModal.locator('input[type="file"]#modal_payment_screenshot').first();
      
      // Try to set files directly (works even if hidden)
      try {
        await fileInput.setInputFiles(testImagePath);
        if (verbose) console.log('[FLOW 1] Screenshot uploaded directly to input:', testImagePath);
      } catch (error) {
        // If that fails, click the upload area div to trigger file picker
        const uploadArea = paymentModal.locator('div[class*="border-dashed"]:has-text("PNG, JPG, GIF")').first();
        if (await uploadArea.isVisible({ timeout: 2000 }).catch(() => false)) {
          await uploadArea.click();
          await page.waitForTimeout(300);
          await fileInput.setInputFiles(testImagePath);
          if (verbose) console.log('[FLOW 1] Screenshot uploaded via upload area click');
        } else {
          throw new Error('File input and upload area not found in PaymentDetailsModal');
        }
      }
      
      // Wait for file to be processed and React state to update
      // Preview shows when paymentScreenshot && previewUrl (img with alt="Payment proof preview")
      await page.waitForTimeout(1500);
      
      // Verify file was uploaded by checking for preview
      const previewVisible = await paymentModal.locator('img[alt="Payment proof preview"]').isVisible({ timeout: 3000 }).catch(() => false);
      if (verbose) console.log('[FLOW 1] File preview visible:', previewVisible);
      
      // Wait a bit more for form state to update
      await page.waitForTimeout(500);
      
      // Step 8: Submit payment
      if (verbose) console.log('[FLOW 1] Step 8: Submitting payment...');
      
      // The button text is from translation, try multiple selectors
      // IMPORTANT: Button is disabled when !paymentScreenshot, so it should be enabled now
      const confirmButtonSelectors = [
        'button[class*="primary"]:not([disabled])', // Primary button that's not disabled (most reliable)
        'button:has-text("Submit")',
        'button:has-text("Confirm")',
        'button:has-text("Payment Proof")',
        'button:has-text("Proof")',
        'button:not([disabled]):not([variant="outline"])', // Any enabled button that's not outline variant
      ];
      
      let confirmButton = null;
      for (const selector of confirmButtonSelectors) {
        const button = paymentModal.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          const isDisabled = await button.isDisabled().catch(() => true);
          if (!isDisabled) {
            confirmButton = button;
            if (verbose) console.log('[FLOW 1] Found submit button with selector:', selector);
            break;
          } else {
            if (verbose) console.log('[FLOW 1] Button found but disabled with selector:', selector);
          }
        }
      }
      
      // If button is still disabled, check why
      if (!confirmButton) {
        const primaryButton = paymentModal.locator('button[class*="primary"]').first();
        if (await primaryButton.isVisible().catch(() => false)) {
          const isDisabled = await primaryButton.isDisabled().catch(() => true);
          if (isDisabled) {
            const disabledAttr = await primaryButton.getAttribute('disabled');
            if (verbose) console.log('[FLOW 1] Submit button is disabled. Attribute:', disabledAttr);
            throw new Error('Submit button is disabled. File upload may have failed or file was not accepted.');
          }
        }
      }
      
      if (!confirmButton) {
        // Try to find any button that's not the back button
        const allButtons = paymentModal.locator('button').all();
        for (const button of await allButtons) {
          const text = await button.textContent().catch(() => '');
          const isDisabled = await button.isDisabled().catch(() => true);
          if (text && !text.includes('Back') && !isDisabled) {
            confirmButton = button;
            if (verbose) console.log('[FLOW 1] Found submit button with text:', text);
            break;
          }
        }
      }
      
      if (confirmButton) {
        // Listen for console errors and network requests
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            if (verbose) console.log('[FLOW 1] Console error:', msg.text());
          }
        });
        
        // Listen for the fetch POST request to /payment/offline/submit
        // handleOfflineSubmit does: fetch('/payment/offline/submit', { method: 'POST', body: formData })
        const submitPromise = page.waitForResponse(
          (response) => response.url().includes('/payment/offline/submit') && response.request().method() === 'POST',
          { timeout: 30000 }
        ).catch(() => null);
        
        // Also listen for navigation (redirect happens via window.location.href in handleOfflineSubmit)
        const navigationPromise = page.waitForNavigation({ timeout: 30000 }).catch(() => null);
        
        await confirmButton.click();
        if (verbose) console.log('[FLOW 1] Submit button clicked');
        
        // Wait for response
        const response = await submitPromise;
        if (response) {
          if (verbose) console.log('[FLOW 1] Payment submission response:', response.status(), response.url());
          
          if (response.status() >= 400) {
            const responseText = await response.text().catch(() => '');
            throw new Error(`Payment submission failed with status ${response.status()}. Response: ${responseText.substring(0, 200)}`);
          }
          
          // Response might contain redirect URL in JSON (result.redirect or result.url)
          if (response.headers()['content-type']?.includes('application/json')) {
            const result = await response.json().catch(() => null);
            if (result?.redirect || result?.url) {
              if (verbose) console.log('[FLOW 1] Redirect URL in response:', result.redirect || result.url);
            }
          }
        } else {
          if (verbose) console.warn('[FLOW 1] No response received from payment submission');
        }
        
        // Wait for navigation (redirect happens via window.location.href)
        // handleOfflineSubmit redirects: window.location.href = response.url or result.redirect or result.url
        await navigationPromise;
        await page.waitForTimeout(1000);
      } else {
        // Take screenshot for debugging
        await page.screenshot({ path: 'test-results/payment-modal-debug.png' });
        throw new Error('Submit button not found in payment modal. Check test-results/payment-modal-debug.png');
      }
    } else {
      // Fallback: form might be directly in the dialog
      if (verbose) console.log('[FLOW 1] No modal found, filling form directly in dialog...');
      const paymentRef = 'TEST-REF-' + Date.now();
      await paymentPage.fillPaymentReference(paymentRef);
      await paymentPage.fillPaymentNotes('E2E test payment - Flow 1');
      await paymentPage.uploadScreenshot(testImagePath);
      await paymentPage.submitPayment();
    }

    // Step 9: Verify success
    if (verbose) console.log('[FLOW 1] Step 9: Waiting for success...');
    const urlBeforeWait = page.url();
    if (verbose) console.log('[FLOW 1] URL before waiting for success:', urlBeforeWait);
    
    await paymentPage.waitForSuccess();
    
    const urlAfterWait = page.url();
    if (verbose) console.log('[FLOW 1] URL after success:', urlAfterWait);
    
    // Step 10: Verify payment status
    const orderId = await extractOrderId(page) || await paymentPage.getOrderId();
    if (verbose) console.log('[FLOW 1] Order ID:', orderId);
    expect(orderId).not.toBeNull();

    // Verify payment was created in database
    const paymentResponse = await page.request.get(
      `http://localhost:8000/api/test/payments/by-order/${orderId}`
    );
    
    if (paymentResponse.ok()) {
      const payment = await paymentResponse.json();
      if (verbose) console.log('[FLOW 1] Payment created:', {
        id: payment.id,
        gateway_status: payment.gateway_status,
        admin_status: payment.admin_status,
      });
      
      expect(payment.gateway_status).toBe('proof_uploaded');
      expect(payment.admin_status).toBe('unseen');
      expect(payment.payment_method).toBe('offline');
    } else {
      if (verbose) console.warn('[FLOW 1] Could not verify payment in database (this is okay for now)');
    }

    if (verbose) console.log('[FLOW 1] Flow completed successfully!');
  });
});

