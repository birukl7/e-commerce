const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

export interface FlowContext {
  customerId?: number;
  adminId?: number;
  productId?: number;
  orderId?: string;
  paymentId?: string;
  productRequestId?: string;
  advancePaymentId?: string;
  finalPaymentId?: string;
}

/**
 * Flow Context Manager
 * 
 * Manages shared state between test flows using Laravel's cache API.
 * This allows flows to share data when chained together in test suites.
 */
export class FlowContextManager {
  private prefix: string;

  constructor(prefix: string = 'e2e_flow') {
    this.prefix = prefix;
  }

  /**
   * Set a context value
   */
  async set(key: keyof FlowContext, value: any): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/test/state/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: `${this.prefix}_${key}`,
        value: value,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set context key '${key}': ${error}`);
    }
  }

  /**
   * Get a context value
   */
  async get(key: keyof FlowContext): Promise<any> {
    const response = await fetch(`${BASE_URL}/api/test/state/${this.prefix}_${key}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      const error = await response.text();
      throw new Error(`Failed to get context key '${key}': ${error}`);
    }

    const data = await response.json();
    return data.value;
  }

  /**
   * Check if a context key exists
   */
  async has(key: keyof FlowContext): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Get a context value, throwing if not found
   */
  async require(key: keyof FlowContext): Promise<any> {
    const value = await this.get(key);
    if (value === undefined) {
      throw new Error(`Required context key '${key}' not found`);
    }
    return value;
  }

  /**
   * Clear a specific context key
   */
  async clear(key: keyof FlowContext): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/test/state/${this.prefix}_${key}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to clear context key '${key}': ${error}`);
    }
  }

  /**
   * Clear all context
   */
  async clearAll(): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/test/state/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to clear all context: ${error}`);
    }
  }

  /**
   * Get all context as an object
   */
  async getAll(): Promise<Partial<FlowContext>> {
    const keys: (keyof FlowContext)[] = [
      'customerId',
      'adminId',
      'productId',
      'orderId',
      'paymentId',
      'productRequestId',
      'advancePaymentId',
      'finalPaymentId',
    ];

    const context: Partial<FlowContext> = {};
    
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== undefined) {
        context[key] = value;
      }
    }

    return context;
  }
}

/**
 * Create a new FlowContextManager instance
 */
export function createFlowContext(prefix?: string): FlowContextManager {
  return new FlowContextManager(prefix);
}

