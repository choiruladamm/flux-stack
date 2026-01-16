import { describe, it, expect } from 'bun:test';
import { Hono } from 'hono';
import {
  success,
  error,
  paginated,
  type SuccessResponse,
  type ErrorResponse,
} from '../../src/utils/response';
import { HTTP_STATUS, ERROR_CODES } from '../../src/constants';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

describe('Response Utilities', () => {
  describe('success()', () => {
    it('should return success format with data', async () => {
      const app = new Hono();
      app.get('/success', (c) => success(c, { message: 'Hello' }));

      const res = await app.request('/success');
      const json = (await res.json()) as SuccessResponse;

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(json).toEqual({
        success: true,
        data: { message: 'Hello' },
      });
    });

    it('should include meta when provided', async () => {
      const app = new Hono();
      app.get('/success-meta', (c) =>
        success(c, { id: 1 }, HTTP_STATUS.OK as ContentfulStatusCode, {
          timestamp: '2026-01-16T00:00:00Z',
        })
      );

      const res = await app.request('/success-meta');
      const json = (await res.json()) as SuccessResponse;

      expect(json.meta?.timestamp).toBe('2026-01-16T00:00:00Z');
    });

    it('should automatically convert data keys to snake_case', async () => {
      const app = new Hono();
      app.get('/snake-case', (c) =>
        success(c, { myUserId: 1, nestedObject: { someValue: 'test' } })
      );

      const res = await app.request('/snake-case');
      const json = (await res.json()) as any;

      expect(json.data.my_user_id).toBe(1);
      expect(json.data.nested_object.some_value).toBe('test');
    });
  });

  describe('error()', () => {
    it('should return error format', async () => {
      const app = new Hono();
      app.get('/error', (c) =>
        error(
          c,
          ERROR_CODES.NOT_FOUND,
          'User not found',
          HTTP_STATUS.NOT_FOUND as ContentfulStatusCode
        )
      );

      const res = await app.request('/error');
      const json = (await res.json()) as ErrorResponse;

      expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(json).toEqual({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found',
        },
      });
    });

    it('should include details when provided', async () => {
      const app = new Hono();
      app.get('/error-details', (c) =>
        error(
          c,
          ERROR_CODES.VALIDATION_ERROR,
          'Invalid email',
          HTTP_STATUS.BAD_REQUEST as ContentfulStatusCode,
          {
            field: 'email',
          }
        )
      );

      const res = await app.request('/error-details');
      const json = (await res.json()) as ErrorResponse;

      expect(json.error.details).toEqual({ field: 'email' });
    });
  });

  describe('paginated()', () => {
    it('should return paginated format', async () => {
      const app = new Hono();
      app.get('/paginated', (c) =>
        paginated(c, [{ id: 1 }], {
          page: 1,
          limit: 10,
          total: 100,
          total_pages: 10,
        })
      );

      const res = await app.request('/paginated');
      const json = (await res.json()) as SuccessResponse<any[]>;

      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.meta?.pagination?.total).toBe(100);
      expect(json.meta?.timestamp).toBeDefined();
    });
  });
});
