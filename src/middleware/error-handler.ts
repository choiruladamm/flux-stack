import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../core/logger';
import { env } from '../core/env';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http-status';

export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = async (err: Error, c: Context) => {
  const isProduction = env.NODE_ENV === 'production';

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error(
    {
      err,
      url: c.req.url,
      method: c.req.method,
    },
    'Request error'
  );

  return c.json(
    {
      error: {
        message,
        statusCode,
        ...(isProduction ? {} : { details: err.message, stack: err.stack }),
      },
    },
    statusCode as ContentfulStatusCode
  );
};
