import { ROUTES, PASSWORD, HTTP_STATUS } from '../../constants';

export const authPaths = {
  [ROUTES.AUTH.SIGN_UP]: {
    post: {
      summary: 'Sign Up',
      description: 'Create new user account with email and password',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: {
                  type: 'string',
                  minLength: PASSWORD.MIN_LENGTH,
                  example: 'SecurePass123',
                },
                name: { type: 'string', example: 'John Doe' },
              },
            },
          },
        },
      },
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'User created successfully',
        },
      },
    },
  },
  [ROUTES.AUTH.SIGN_IN]: {
    post: {
      summary: 'Sign In',
      description: 'Login with email and password',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', example: 'SecurePass123' },
              },
            },
          },
        },
      },
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Login successful',
        },
      },
    },
  },
  [ROUTES.AUTH.SIGN_OUT]: {
    post: {
      summary: 'Sign Out',
      description: 'Logout current user',
      tags: ['Authentication'],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Logout successful',
        },
      },
    },
  },
  [ROUTES.AUTH.ME]: {
    get: {
      summary: 'Get Current User',
      description: 'Get currently authenticated user information',
      tags: ['Authentication'],
      security: [{ cookieAuth: [] }],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'User data returned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
