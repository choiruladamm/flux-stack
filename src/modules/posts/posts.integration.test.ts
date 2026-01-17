import { describe, it, expect, beforeAll } from 'bun:test';
import { app } from '../../index';
import type { SuccessResponse } from '../../utils/response';

/**
 * RealWorld Posts Integration Tests
 *
 * Tests cover: CRUD with tags, slugs, favorites, filtering, and search
 */
describe('RealWorld Posts CRUD', () => {
  const testUser = {
    email: `post-test-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Post Test User',
  };

  const secondUser = {
    email: `post-test-2-${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    name: 'Second User',
  };

  let cookie: string;
  let secondCookie: string;
  let postSlug: string;

  beforeAll(async () => {
    await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify(testUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const loginRes = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    cookie = loginRes.headers.get('set-cookie') || '';

    await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      body: JSON.stringify(secondUser),
      headers: { 'Content-Type': 'application/json' },
    });

    const secondLoginRes = await app.request('/api/auth/sign-in/email', {
      method: 'POST',
      body: JSON.stringify({
        email: secondUser.email,
        password: secondUser.password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    secondCookie = secondLoginRes.headers.get('set-cookie') || '';
  });

  it('should create a post with tags and generate slug', async () => {
    const res = await app.request('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: 'My First RealWorld Post',
        description: 'A short description of the post',
        content: 'This is the content of my first post.',
        tags: ['javascript', 'typescript', 'testing'],
      }),
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.slug).toBeDefined();
    expect(json.data.slug).toContain('my-first-realworld-post');
    expect(json.data.title).toBe('My First RealWorld Post');
    expect(json.data.description).toBe('A short description of the post');
    expect(json.data.tags).toEqual(['javascript', 'typescript', 'testing']);
    expect(json.data.favorites_count).toBe(0);
    expect(json.data.favorited).toBe(false);
    expect(json.data.author.email).toBe(testUser.email);

    postSlug = json.data.slug;
  });

  it('should get post by slug', async () => {
    const res = await app.request(`/api/posts/${postSlug}`);

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe(postSlug);
    expect(json.data.tags).toEqual(['javascript', 'typescript', 'testing']);
  });

  it('should list posts with author and tags', async () => {
    const res = await app.request('/api/posts?page=1&limit=10');

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].author).toBeDefined();
    expect(json.data[0].tags).toBeDefined();
    expect(json.data[0].slug).toBeDefined();
  });

  it('should filter posts by tag', async () => {
    const res = await app.request('/api/posts?tag=javascript');

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.every((p: any) => p.tags.includes('javascript'))).toBe(true);
  });

  it('should search posts by title', async () => {
    const res = await app.request('/api/posts?search=RealWorld');

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].title).toContain('RealWorld');
  });

  it('should update post and regenerate slug when title changes', async () => {
    const res = await app.request(`/api/posts/${postSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: 'Updated RealWorld Post Title',
        tags: ['javascript', 'bun'],
      }),
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.slug).not.toBe(postSlug);
    expect(json.data.slug).toContain('updated-realworld-post-title');
    expect(json.data.tags).toEqual(['javascript', 'bun']);

    postSlug = json.data.slug;
  });

  it('should favorite a post', async () => {
    const res = await app.request(`/api/posts/${postSlug}/favorite`, {
      method: 'POST',
      headers: { Cookie: secondCookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.favorited).toBe(true);
    expect(json.data.favorites_count).toBe(1);
  });

  it('should show favorited status for user who favorited', async () => {
    const res = await app.request(`/api/posts/${postSlug}`, {
      headers: { Cookie: secondCookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.data.favorited).toBe(true);
    expect(json.data.favorites_count).toBe(1);
  });

  it('should not show favorited for user who did not favorite', async () => {
    const res = await app.request(`/api/posts/${postSlug}`, {
      headers: { Cookie: cookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.data.favorited).toBe(false);
    expect(json.data.favorites_count).toBe(1);
  });

  it('should handle favorite idempotency', async () => {
    const res = await app.request(`/api/posts/${postSlug}/favorite`, {
      method: 'POST',
      headers: { Cookie: secondCookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.data.favorites_count).toBe(1);
  });

  it('should unfavorite a post', async () => {
    const res = await app.request(`/api/posts/${postSlug}/favorite`, {
      method: 'DELETE',
      headers: { Cookie: secondCookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.data.favorited).toBe(false);
    expect(json.data.favorites_count).toBe(0);
  });

  it('should filter posts by favorited user', async () => {
    await app.request(`/api/posts/${postSlug}/favorite`, {
      method: 'POST',
      headers: { Cookie: secondCookie },
    });

    const res = await app.request(`/api/posts?favorited=${secondUser.email}`);

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.some((p: any) => p.slug === postSlug)).toBe(true);
  });

  it('should get all tags with usage counts', async () => {
    const res = await app.request('/api/posts/tags/all');

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.tags)).toBe(true);
    expect(json.data.tags.length).toBeGreaterThan(0);
    expect(json.data.tags[0]).toHaveProperty('name');
    expect(json.data.tags[0]).toHaveProperty('posts_count');
  });

  it('should delete a post by slug', async () => {
    const res = await app.request(`/api/posts/${postSlug}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });

    const json = (await res.json()) as SuccessResponse<any>;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message).toBe('Post deleted successfully');
  });

  it('should return 404 for deleted post', async () => {
    const res = await app.request(`/api/posts/${postSlug}`);

    expect(res.status).toBe(404);
  });

  it('should prevent non-owner from updating post', async () => {
    const createRes = await app.request('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        title: 'Owner Test Post',
        content: 'Content',
        tags: [],
      }),
    });

    const createJson = (await createRes.json()) as SuccessResponse<any>;
    const slug = createJson.data.slug;

    const updateRes = await app.request(`/api/posts/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: secondCookie,
      },
      body: JSON.stringify({
        title: 'Hacked Title',
      }),
    });

    expect(updateRes.status).toBe(403);
  });

  it('should require authentication for creating posts', async () => {
    const res = await app.request('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test',
        content: 'Test',
      }),
    });

    expect(res.status).toBe(401);
  });
});
