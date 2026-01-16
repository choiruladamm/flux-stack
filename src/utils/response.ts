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
  totalPages: number;
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
  status: ContentfulStatusCode = HTTP_STATUS.OK as ContentfulStatusCode,
  meta?: ResponseMeta
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
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
  status: ContentfulStatusCode = HTTP_STATUS.BAD_REQUEST as ContentfulStatusCode,
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
    response.error.details = details;
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
