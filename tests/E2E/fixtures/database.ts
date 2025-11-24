const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

/**
 * Reset test database
 */
export async function resetTestDatabase(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test/database/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to reset test database: ${error}`);
  }
}

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test/database/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to seed test database: ${error}`);
  }
}

/**
 * Refresh test database (migrate:refresh --seed)
 */
export async function refreshTestDatabase(): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/test/database/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh test database: ${error}`);
  }
}

/**
 * Create a test product
 */
export async function createTestProduct(data?: Record<string, any>): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create test product: ${error}`);
  }

  return await response.json();
}

/**
 * Get a product by ID
 */
export async function getTestProduct(id: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/products/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get test product: ${error}`);
  }

  return await response.json();
}

