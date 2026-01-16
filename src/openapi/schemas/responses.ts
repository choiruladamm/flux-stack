import { ERROR_CODES } from '../../constants';

/**
 * Standard success response schema factory
 *
 * @param dataSchema - Schema for the data property
 * @param options - Configuration for meta and pagination
 * @returns OpenAPI schema for success response
 */
export const successResponseSchema = (
  dataSchema: object,
  options: { includeMeta?: boolean; includePagination?: boolean } = {
    includeMeta: true,
    includePagination: false,
  }
) => {
  const properties: Record<string, unknown> = {
    success: {
      type: 'boolean',
      enum: [true],
      description: 'Indicates successful response',
    },
    data: dataSchema,
  };

  if (options.includeMeta) {
    const metaProperties: Record<string, unknown> = {
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Response timestamp',
      },
    };

    if (options.includePagination) {
      metaProperties.pagination = {
        type: 'object',
        description: 'Pagination metadata',
        properties: {
          page: { type: 'number', description: 'Current page number' },
          limit: { type: 'number', description: 'Items per page' },
          total: { type: 'number', description: 'Total items' },
          total_pages: { type: 'number', description: 'Total pages' },
        },
      };
    }

    properties.meta = {
      type: 'object',
      description: 'Optional metadata',
      properties: metaProperties,
    };
  }

  return {
    type: 'object',
    required: ['success', 'data'],
    properties,
  };
};

/**
 * Standard error response schema
 */
export const errorResponseSchema = {
  type: 'object',
  required: ['success', 'error'],
  properties: {
    success: {
      type: 'boolean',
      enum: [false],
      description: 'Indicates error response',
    },
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: {
          type: 'string',
          enum: Object.values(ERROR_CODES),
          description: 'Error code constant',
        },
        message: {
          type: 'string',
          description: 'Human-readable error message',
        },
        details: {
          type: 'object',
          description: 'Additional error details',
        },
      },
    },
  },
};

/**
 * Example error responses by status code
 */
export const errorExamples = {
  400: {
    value: {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Invalid input data',
        details: {
          errors: [
            { path: 'email', message: 'Invalid email format' },
            { path: 'password', message: 'Password too short' },
          ],
        },
      },
    },
  },
  401: {
    value: {
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Authentication required',
      },
    },
  },
  404: {
    value: {
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'Resource not found',
      },
    },
  },
  429: {
    value: {
      success: false,
      error: {
        code: ERROR_CODES.ACCOUNT_LOCKED,
        message: 'Too many failed attempts. Try again in 900 seconds.',
      },
    },
  },
  500: {
    value: {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER,
        message: 'Internal server error',
      },
    },
  },
};
