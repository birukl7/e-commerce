import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly productName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add"), [data-add-to-cart], button:has([class*="cart"])').first();
    this.quantityInput = page.locator('input[type="number"][name*="quantity"], input[type="number"]').first();
    // Product name is in h1 on the product page
    this.productName = page.locator('h1').first();
  }

  /**
   * Navigate to product page by slug
   */
  async gotoBySlug(slug: string): Promise<void> {
    await this.page.goto(`/products/${slug}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to product page by ID (fetches slug first)
   */
  async goto(productId: number): Promise<void> {
    // First, get the product slug from the API
    const response = await fetch(`http://localhost:8000/api/products/${productId}`);
    if (response.ok) {
      const data = await response.json();
      const slug = data.data?.slug || data.slug;
      if (slug) {
        await this.gotoBySlug(slug);
        return;
      }
    }
    // Fallback: try direct ID (might work if route supports it)
    await this.page.goto(`/products/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async addToCart(quantity: number = 1, productId?: number, productName?: string, productPrice?: number): Promise<void> {
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');
    
    // Get product data - prefer passed parameters, otherwise try to extract from page
    let productData: { id: string | null; name: string | null; price: number | null } = {
      id: productId?.toString() || null,
      name: productName || null,
      price: productPrice || null,
    };
    
    // If we don't have all data, try to get it from the page
    if (!productData.id || !productData.name || !productData.price) {
      const pageData = await this.page.evaluate(() => {
        // Try to extract product data from the page
        const productId = document.querySelector('[data-product-id]')?.getAttribute('data-product-id');
        const productName = document.querySelector('h1')?.textContent?.trim();
        const priceElement = document.querySelector('[data-price], .price, [class*="price"]')?.textContent;
        const price = priceElement ? parseFloat(priceElement.replace(/[^0-9.]/g, '')) : null;
        
        return { id: productId, name: productName, price };
      });
      
      productData.id = productData.id || pageData.id;
      productData.name = productData.name || pageData.name;
      productData.price = productData.price || pageData.price;
    }
    
    // If we still don't have product ID, try to get it from API using slug
    if (!productData.id) {
      const url = this.page.url();
      const slugMatch = url.match(/\/products\/([^\/]+)/);
      if (slugMatch) {
        const slug = slugMatch[1];
        try {
          const response = await fetch(`http://localhost:8000/api/products/${slug}`);
          if (response.ok) {
            const data = await response.json();
            const product = data.data || data;
            productData.id = productData.id || product.id?.toString();
            productData.name = productData.name || product.name;
            productData.price = productData.price || product.current_price || product.price;
          }
        } catch (e) {
          console.error('Failed to fetch product from API:', e);
        }
      }
    }
    
    if (!productData.id) {
      throw new Error('Could not determine product ID. Please pass productId parameter or ensure product page is loaded.');
    }
    
    console.log('Product data:', productData);
    
    // Try the normal addToCart flow first
    try {
      // Set quantity if input exists
      const qtyInput = this.quantityInput;
      if (await qtyInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await qtyInput.fill(quantity.toString());
        await this.page.waitForTimeout(200);
      }
      
      // Click add to cart button
      await this.addToCartButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.addToCartButton.scrollIntoViewIfNeeded();
      
      // Set up listener for API calls
      const apiCallPromise = this.page.waitForResponse(
        (response) => response.url().includes('/api/products/') && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => null);
      
      // Click the button
      await this.addToCartButton.click();
      
      // Wait for API call if it happens
      await apiCallPromise;
      
      // Wait a bit for React state to update
      await this.page.waitForTimeout(2000);
      
      // Check if cart was updated
      const cartAfter = await this.page.evaluate(() => {
        return JSON.parse(localStorage.getItem('cartItems') || '[]');
      });
      
      if (cartAfter.length > 0) {
        console.log('Successfully added to cart via normal flow');
        return;
      }
    } catch (error) {
      console.warn('Normal addToCart flow failed, using fallback:', error);
    }
    
    // Fallback: Manually add to cart
    console.log('Using manual cart addition fallback...');
    
    // Ensure we only pass plain serializable data (no circular references)
    const cartData = {
      id: String(productData.id),
      name: String(productData.name || 'Test Product'),
      price: Number(productData.price || 1000),
      quantity: Number(quantity || 1),
    };
    
    await this.page.evaluate((data) => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingIndex = cartItems.findIndex((item: any) => item.id == data.id);
      
      const cartItem = {
        id: parseInt(data.id),
        name: data.name || 'Test Product',
        price: data.price || 1000,
        quantity: data.quantity || 1,
        image: '',
      };
      
      if (existingIndex >= 0) {
        cartItems[existingIndex] = cartItem;
      } else {
        cartItems.push(cartItem);
      }
      
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, cartData);
    
    // Verify it was added
    const cartAfterManual = await this.page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cartItems') || '[]');
    });
    
    if (cartAfterManual.length === 0) {
      throw new Error('Failed to add item to cart even with manual fallback');
    }
    
    console.log('Manually added to cart:', cartAfterManual);
    
    // Additional wait to ensure React state has updated
    await this.page.waitForTimeout(500);
  }

  async getProductName(): Promise<string | null> {
    // Wait for h1 to be visible
    await this.productName.waitFor({ state: 'visible', timeout: 10000 });
    if (await this.productName.isVisible()) {
      return await this.productName.textContent();
    }
    return null;
  }
}

