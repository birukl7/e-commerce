const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

/**
 * Get payment by order ID
 */
export async function getPaymentByOrderId(orderId: string | number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/payments/by-order/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.text();
    throw new Error(`Failed to get payment by order ID: ${error}`);
  }

  return await response.json();
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string | number): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/payments/${paymentId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get payment by ID: ${error}`);
  }

  return await response.json();
}

/**
 * Get payments by product request ID
 */
export async function getPaymentsByProductRequestId(productRequestId: string | number): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/api/test/payments/by-product-request/${productRequestId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get payments by product request ID: ${error}`);
  }

  return await response.json();
}

/**
 * Create a test payment
 */
export async function createTestPayment(data: Record<string, any>): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/test/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create test payment: ${error}`);
  }

  return await response.json();
}

