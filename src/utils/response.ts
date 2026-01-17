import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { HTTP_STATUS } from '../constants';

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  timestamp?: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Generic API response type
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Recursively converts object keys to snake_case
 *
 * @param obj - Object to convert
 * @returns Object with snake_case keys
 */
export const toSnakeCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  }

  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return {
        ...result,
        [snakeKey]: toSnakeCase((obj as Record<string, unknown>)[key]),
      };
    }, {});
  }

  return obj;
};

/**
 * Send success response
 *
 * @param c - Hono context
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param meta - Optional metadata
 */
export const success = <T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = HTTP_STATUS.OK,
  meta?: ResponseMeta
): Response => {
  const response: SuccessResponse<unknown> = {
    success: true,
    data: toSnakeCase(data),
  };

  if (meta) {
    response.meta = toSnakeCase(meta) as ResponseMeta;
  }

  return c.json(response, status);
};

/**
 * Send error response
 *
 * @param c - Hono context
 * @param code - Error code constant
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional error details
 */
export const error = (
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = HTTP_STATUS.BAD_REQUEST,
  details?: unknown
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = toSnakeCase(details);
  }

  return c.json(response, status);
};

/**
 * Send paginated success response
 *
 * @param c - Hono context
 * @param data - Response data
 * @param pagination - Pagination metadata
 * @param status - HTTP status code (default: 200)
 */
export const paginated = <T>(
  c: Context,
  data: T,
  pagination: PaginationMeta,
  status: ContentfulStatusCode = HTTP_STATUS.OK as ContentfulStatusCode
): Response => {
  return success(c, data, status, {
    timestamp: new Date().toISOString(),
    pagination,
  });
};
