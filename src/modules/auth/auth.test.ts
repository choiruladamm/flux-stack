import { describe, expect, it } from 'bun:test';
import { app } from '../../index';
import type { SuccessResponse } from '../../utils/response';

/**
 * Authentication Integration Tests
 *
 * NOTE: These tests assume a clean database or at least a way to handle
 * existing data. In a production test suite, we would use a separate
 * test database and migrations.
 */
describe('Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Test Man',
  };

  it('should successfully signup a new user', async () => {
    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify(testUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const json = (await res.json()) as SuccessResponse<any>;
    // console.log('Signup Response:', json);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    // Better Auth returns { user, session } directly on signup/signin, now wrapped in .data
    expect(json.data.user.email).toBe(testUser.email);
  });

  it('should successfully signin', async () => {
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const json = (await res.json()) as SuccessResponse<any>;
    // console.log('Signin Response:', json);

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.user).toBeDefined();
  });

  it('should get current user after signin', async () => {
    // 1. Sign in to get cookie
    const loginRes = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const cookie = loginRes.headers.get('set-cookie');

    // 2. Get me
    const meRes = await app.request('/api/auth/me', {
      method: 'GET',
      headers: {
        Cookie: cookie || '',
      },
    });

    const json = (await meRes.json()) as SuccessResponse<any>;

    expect(meRes.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.user.email).toBe(testUser.email);
  });

  it('should fail to signin with wrong password', async () => {
    const res = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(401);
  });
});
