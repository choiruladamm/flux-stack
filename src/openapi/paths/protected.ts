import { ROUTES, HTTP_STATUS } from '../../constants';
import { successResponseSchema, errorResponseSchema, errorExamples } from '../schemas/responses';

export const userPaths = {
  [ROUTES.USER.PROFILE]: {
    get: {
      summary: 'Get User Profile',
      description: 'Get current authenticated user profile information',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'User profile data',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    email_verified: { type: 'boolean' },
                    created_at: { type: 'string', format: 'date-time' },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
      },
    },
    patch: {
      summary: 'Update User Profile',
      description: 'Update current user profile information',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Profile updated success',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
        [HTTP_STATUS.BAD_REQUEST]: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[400],
            },
          },
        },
      },
    },
  },
  [ROUTES.USER.ACCOUNT]: {
    delete: {
      summary: 'Delete Account',
      description: 'Schedule user account for deletion',
      tags: ['User'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Account deletion scheduled',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
      },
    },
  },
};

export const dashboardPaths = {
  [ROUTES.DASHBOARD.STATS]: {
    get: {
      summary: 'Get Dashboard Statistics',
      description: 'Get user dashboard statistics',
      tags: ['Dashboard'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Dashboard statistics',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    user_id: { type: 'string' },
                    stats: {
                      type: 'object',
                      properties: {
                        total_posts: { type: 'number' },
                        total_views: { type: 'number' },
                        total_comments: { type: 'number' },
                      },
                    },
                    last_activity: { type: 'string', format: 'date-time' },
                  },
                },
                { includeMeta: true, includePagination: true }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
        [HTTP_STATUS.BAD_REQUEST]: {
          description: 'Invalid pagination parameters',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[400],
            },
          },
        },
      },
    },
  },
  [ROUTES.DASHBOARD.ACTIVITY]: {
    get: {
      summary: 'Get Activity Feed',
      description: 'Get user activity feed',
      tags: ['Dashboard'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Activity feed',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    user_id: { type: 'string' },
                    activities: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          timestamp: { type: 'string', format: 'date-time' },
                          details: { type: 'string' },
                        },
                      },
                    },
                  },
                },
                { includeMeta: true, includePagination: true }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
        [HTTP_STATUS.BAD_REQUEST]: {
          description: 'Invalid pagination parameters',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[400],
            },
          },
        },
      },
    },
  },
  [ROUTES.DASHBOARD.OVERVIEW]: {
    get: {
      summary: 'Get Dashboard Overview',
      description: 'Get dashboard overview with quick stats',
      tags: ['Dashboard'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Dashboard overview',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    welcome: { type: 'string' },
                    quick_stats: {
                      type: 'object',
                      properties: {
                        new_notifications: { type: 'number' },
                        pending_tasks: { type: 'number' },
                        recent_activity: { type: 'number' },
                      },
                    },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[401],
            },
          },
        },
      },
    },
  },
};
