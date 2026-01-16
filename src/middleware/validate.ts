import type { Context, Next } from 'hono';
import type { ZodSchema } from 'zod';
import { error } from '../utils/response';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

/**
 * Validation target type
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validate request data against Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param target - What to validate (body, query, params)
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return async (c: Context, next: Next) => {
    let data: unknown;

    try {
      switch (target) {
        case 'body':
          data = await c.req.json();
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'params':
          data = c.req.param();
          break;
      }
    } catch {
      return error(
        c,
        ERROR_CODES.VALIDATION_ERROR,
        'Invalid request format',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      return error(c, ERROR_CODES.VALIDATION_ERROR, 'Validation failed', HTTP_STATUS.BAD_REQUEST, {
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Store validated data in context for use in handler
    c.set('validatedData', result.data);
    return next();
  };
};
