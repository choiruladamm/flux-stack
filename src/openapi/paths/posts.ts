import { ROUTES, HTTP_STATUS } from '../../constants';
import { successResponseSchema, errorResponseSchema, errorExamples } from '../schemas/responses';

/**
 * Enhanced Post schema with RealWorld features
 */
const postSchema = {
  type: 'object',
  properties: {
    slug: { type: 'string', example: 'my-awesome-post-abc123' },
    title: { type: 'string', minLength: 3, maxLength: 255 },
    description: { type: 'string', nullable: true },
    content: { type: 'string', minLength: 1 },
    is_published: { type: 'boolean' },
    favorites_count: { type: 'integer', minimum: 0 },
    favorited: { type: 'boolean' },
    tags: { type: 'array', items: { type: 'string' } },
    author: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        image: { type: 'string', nullable: true },
      },
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

/**
 * OpenAPI-compliant path (uses {slug} instead of :slug)
 */
const POSTS_DETAIL_OPENAPI = '/api/posts/{slug}';
const POSTS_FAVORITE_OPENAPI = '/api/posts/{slug}/favorite';
const POSTS_TAGS_OPENAPI = '/api/posts/tags/all';

export const postPaths = {
  [ROUTES.POSTS.BASE]: {
    get: {
      summary: 'List Posts',
      description:
        'Get paginated list of posts with advanced filtering and search. Optionally requires authentication for favorited status.',
      tags: ['Posts'],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number for pagination',
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Items per page',
        },
        {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', minimum: 0 },
          description: 'Offset for pagination (alternative to page)',
        },
        {
          in: 'query',
          name: 'tag',
          schema: { type: 'string' },
          description: 'Filter by tag name',
        },
        {
          in: 'query',
          name: 'author',
          schema: { type: 'string' },
          description: 'Filter by author email',
        },
        {
          in: 'query',
          name: 'favorited',
          schema: { type: 'string' },
          description: 'Filter by user email who favorited',
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Search in title and content',
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
                { includeMeta: true, includePagination: true }
              ),
              example: {
                success: true,
                data: [
                  {
                    slug: 'my-first-post-abc123',
                    title: 'My First Post',
                    description: 'A short description',
                    content: 'This is the content of my first post.',
                    is_published: false,
                    favorites_count: 5,
                    favorited: true,
                    tags: ['javascript', 'typescript'],
                    author: {
                      id: '550e8400-e29b-41d4-a716-446655440000',
                      name: 'John Doe',
                      email: 'john@example.com',
                      image: null,
                    },
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
      },
    },
    post: {
      summary: 'Create Post',
      description: 'Create a new post with optional tags and description',
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
                description: {
                  type: 'string',
                  maxLength: 500,
                  example: 'A short description of the post',
                },
                content: {
                  type: 'string',
                  minLength: 1,
                  example: 'This is the content of my first post.',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string', maxLength: 50 },
                  maxItems: 10,
                  example: ['javascript', 'typescript', 'bun'],
                  default: [],
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
                  slug: 'my-first-post-abc123',
                  title: 'My First Post',
                  description: 'A short description of the post',
                  content: 'This is the content of my first post.',
                  is_published: false,
                  favorites_count: 0,
                  favorited: false,
                  tags: ['javascript', 'typescript', 'bun'],
                  author: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                  },
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
      summary: 'Get Post by Slug',
      description: 'Get a single post by its slug. Returns favorited status if authenticated.',
      tags: ['Posts'],
      parameters: [
        {
          in: 'path',
          name: 'slug',
          required: true,
          schema: { type: 'string' },
          description: 'Post slug (URL-friendly identifier)',
          example: 'my-awesome-post-abc123',
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
                  slug: 'my-first-post-abc123',
                  title: 'My First Post',
                  description: 'A short description',
                  content: 'This is the content of my first post.',
                  is_published: false,
                  favorites_count: 5,
                  favorited: true,
                  tags: ['javascript', 'typescript'],
                  author: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                  },
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
      },
    },
    patch: {
      summary: 'Update Post',
      description:
        'Update an existing post. Can update title (regenerates slug), description, content, and tags. Must be post owner.',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'slug',
          required: true,
          schema: { type: 'string' },
          description: 'Post slug',
          example: 'my-awesome-post-abc123',
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
                description: {
                  type: 'string',
                  maxLength: 500,
                  nullable: true,
                  example: 'Updated description',
                },
                content: {
                  type: 'string',
                  minLength: 1,
                  example: 'Updated content.',
                },
                is_published: {
                  type: 'boolean',
                  example: true,
                  description: 'Publish or unpublish the post',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string', maxLength: 50 },
                  maxItems: 10,
                  example: ['javascript', 'bun'],
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
                  slug: 'updated-post-title-xyz789',
                  title: 'Updated Post Title',
                  description: 'Updated description',
                  content: 'Updated content.',
                  is_published: false,
                  favorites_count: 5,
                  favorited: false,
                  tags: ['javascript', 'bun'],
                  author: {
                    id: '550e8400-e29b-41d4-a716-446655440000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: null,
                  },
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
        [HTTP_STATUS.FORBIDDEN]: {
          description: 'Not the owner of the post',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to update this post',
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
    delete: {
      summary: 'Delete Post',
      description: 'Delete a post by slug. Must be post owner.',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'slug',
          required: true,
          schema: { type: 'string' },
          description: 'Post slug',
          example: 'my-awesome-post-abc123',
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
        [HTTP_STATUS.FORBIDDEN]: {
          description: 'Not the owner of the post',
          content: {
            'application/json': {
              schema: errorResponseSchema,
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to delete this post',
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
  },
  [POSTS_FAVORITE_OPENAPI]: {
    post: {
      summary: 'Favorite Post',
      description: 'Add post to favorites. Idempotent operation.',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'slug',
          required: true,
          schema: { type: 'string' },
          description: 'Post slug',
          example: 'my-awesome-post-abc123',
        },
      ],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Post favorited successfully',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    slug: { type: 'string' },
                    favorited: { type: 'boolean', example: true },
                    favorites_count: { type: 'integer', example: 6 },
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
    delete: {
      summary: 'Unfavorite Post',
      description: 'Remove post from favorites. Idempotent operation.',
      tags: ['Posts'],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'slug',
          required: true,
          schema: { type: 'string' },
          description: 'Post slug',
          example: 'my-awesome-post-abc123',
        },
      ],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'Post unfavorited successfully',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    slug: { type: 'string' },
                    favorited: { type: 'boolean', example: false },
                    favorites_count: { type: 'integer', example: 5 },
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
  [POSTS_TAGS_OPENAPI]: {
    get: {
      summary: 'List All Tags',
      description: 'Get all tags with their usage counts across all posts',
      tags: ['Posts'],
      responses: {
        [HTTP_STATUS.OK]: {
          description: 'List of tags with usage counts',
          content: {
            'application/json': {
              schema: successResponseSchema(
                {
                  type: 'object',
                  properties: {
                    tags: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', example: 'javascript' },
                          posts_count: { type: 'integer', example: 15 },
                        },
                      },
                    },
                  },
                },
                { includeMeta: false }
              ),
              example: {
                success: true,
                data: {
                  tags: [
                    { name: 'javascript', posts_count: 15 },
                    { name: 'typescript', posts_count: 12 },
                    { name: 'bun', posts_count: 8 },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};
