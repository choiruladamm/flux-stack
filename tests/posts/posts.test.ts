import { describe, it, expect, beforeAll } from 'bun:test';
import { app } from '../../src/index';
import type { SuccessResponse } from '../../src/utils/response';

/**
 * Posts CRUD Integration Tests
 */
describe('Posts CRUD', () => {
  const testUser = {
    email: `post-test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Post Test User',
  };

  let cookie: string;
  let postId: string;

  beforeAll(async () => {
    // Sign up
    await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify(testUser),
      headers: { 'Content-Type': 'application/json' },
    });

    // Sign in to get cookie
    const loginRes = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    cookie = loginRes.headers.get('set-cookie') || '';
  });

  it('should create a new post', async () => {
    const res = await app.request('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: 'My First Post',
        content: 'This is the content of my first post.',
      }),
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('My First Post');
    expect(json.data.content).toBe('This is the content of my first post.');
    expect(json.data.is_published).toBe(false);
    expect(json.data.id).toBeDefined();

    postId = json.data.id;
  });

  it('should list posts with pagination', async () => {
    const res = await app.request('/api/posts?page=1&limit=10', {
      headers: { Cookie: cookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.meta?.pagination).toBeDefined();
    expect(json.meta?.pagination?.page).toBe(1);
    expect(json.meta?.pagination?.limit).toBe(10);
  });

  it('should get a single post by ID', async () => {
    const res = await app.request(`/api/posts/${postId}`, {
      headers: { Cookie: cookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(postId);
    expect(json.data.title).toBe('My First Post');
  });

  it('should update a post', async () => {
    const res = await app.request(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: 'Updated Post Title',
      }),
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('Updated Post Title');
    expect(json.data.content).toBe('This is the content of my first post.');
  });

  it('should delete a post', async () => {
    const res = await app.request(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message).toBe('Post deleted successfully');
  });

  it('should return 404 for non-existent post', async () => {
    const res = await app.request(`/api/posts/${postId}`, {
      headers: { Cookie: cookie },
    });

    expect(res.status).toBe(404);
  });

  it('should  reject unauthenticated requests', async () => {
    const res = await app.request('/api/posts');

    expect(res.status).toBe(401);
  });
});
