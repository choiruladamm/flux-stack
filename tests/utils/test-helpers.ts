import { app } from '../../src/index';

/**
 * Make an authenticated request using mock credentials
 *
 * @param method - HTTP method
 * @param path - API path
 * @param data - Request body data
 * @returns Response object
 */
export const makeAuthRequest = async (method: string, path: string, data?: unknown) => {
  // 1. First, we need to sign in to get the session cookie
  // Note: In a real test, we might use a predefined test user
  const loginRes = await app.request('/api/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPass123!',
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  const cookies = loginRes.headers.get('set-cookie');

  // 2. Make the actual request with session cookies
  return app.request(path, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies || '',
    },
  });
};

/**
 * Create a test user via signup
 *
 * @returns Response object
 */
export const createTestUser = async () => {
  return app.request('/api/auth/sign-up/email', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
    }),
    headers: { 'Content-Type': 'application/json' },
  });
};
