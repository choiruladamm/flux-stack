import { ROUTES, HTTP_STATUS } from '../../constants';

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
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
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
          description: 'Profile updated',
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
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
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
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
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  stats: {
                    type: 'object',
                    properties: {
                      totalPosts: { type: 'number' },
                      totalViews: { type: 'number' },
                      totalComments: { type: 'number' },
                    },
                  },
                  lastActivity: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
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
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
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
        },
        [HTTP_STATUS.UNAUTHORIZED]: {
          description: 'Not authenticated',
        },
      },
    },
  },
};
