import { ROUTES, HTTP_STATUS } from '../../constants';
import { successResponseSchema, errorResponseSchema, errorExamples } from '../schemas/responses';

/**
 * Post schema for OpenAPI documentation
 */
const postSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string', minLength: 3, maxLength: 255 },
    content: { type: 'string', minLength: 1 },
    is_published: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * OpenAPI-compliant path (uses {id} instead of :id)
 */
const POSTS_DETAIL_OPENAPI = '/api/posts/{id}';

export const postPaths = {
  [ROUTES.POSTS.BASE]: {
    get: {
      summary: 'List Posts',
      description: 'Get paginated list of posts owned by the authenticated user',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Items per page',
        },
      ],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'List of posts with pagination',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'array',
                  items: postSchema,
                },
                {
                  includeMeta: true,
                  includePagination: true,
                }
              ),
              example: {
                success: true,
                data: [
                  {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    title: 'My First Post',
                    content: 'This is the content of my first post.',
                    is_published: false,
                    created_at: '2026-01-16T12:00:00Z',
                    updated_at: '2026-01-16T12:00:00Z',
                  },
                ],
                meta: {
                  timestamp: '2026-01-16T12:00:00Z',
                  pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    total_pages: 1,
                  },
                },
              },
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
    post: {
      summary: 'Create Post',
      description: 'Create a new post for the authenticated user',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'content'],
              properties: {
                title: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 255,
                  example: 'My First Post',
                },
                content: {
                  type: 'string',
                  minLength: 1,
                  example: 'This is the content of my first post.',
                },
              },
            },
          },
        },
      },
      responses: {
        [HTTP_STATUS.CREATED]: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              schema: successResponseSchema(postSchema, { includeMeta: false }),
              example: {
                success: true,
                data: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  title: 'My First Post',
                  content: 'This is the content of my first post.',
                  is_published: false,
                  created_at: '2026-01-16T12:00:00Z',
                  updated_at: '2026-01-16T12:00:00Z',
                },
              },
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
  [POSTS_DETAIL_OPENAPI]: {
    get: {
      summary: 'Get Post',
      description: 'Get a single post by ID (must be owned by authenticated user)',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Post ID',
        },
      ],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Post details',
          content: {
            'application/json': {
              schema: successResponseSchema(postSchema, { includeMeta: false }),
              example: {
                success: true,
                data: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  title: 'My First Post',
                  content: 'This is the content of my first post.',
                  is_published: false,
                  created_at: '2026-01-16T12:00:00Z',
                  updated_at: '2026-01-16T12:00:00Z',
                },
              },
            },
          },
        },
        [HTTP_STATUS.NOT_FOUND]: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[404],
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
      summary: 'Update Post',
      description: 'Update an existing post (must be owned by authenticated user)',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Post ID',
        },
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 255,
                  example: 'Updated Post Title',
                },
                content: {
                  type: 'string',
                  minLength: 1,
                  example: 'Updated content.',
                },
              },
            },
          },
        },
      },
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Post updated successfully',
          content: {
            'application/json': {
              schema: successResponseSchema(postSchema, { includeMeta: false }),
              example: {
                success: true,
                data: {
                  id: '550e8400-e29b-41d4-a716-446655440000',
                  title: 'Updated Post Title',
                  content: 'This is the content of my first post.',
                  is_published: false,
                  created_at: '2026-01-16T12:00:00Z',
                  updated_at: '2026-01-16T12:30:00Z',
                },
              },
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
        [HTTP_STATUS.NOT_FOUND]: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[404],
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
    delete: {
      summary: 'Delete Post',
      description: 'Delete a post (must be owned by authenticated user)',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Post ID',
        },
      ],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Post deleted successfully',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Post deleted successfully' },
                  },
                },
                { includeMeta: false }
              ),
            },
          },
        },
        [HTTP_STATUS.NOT_FOUND]: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              examples: errorExamples[404],
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
