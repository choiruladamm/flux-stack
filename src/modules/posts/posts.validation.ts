import { z } from 'zod';
import { STRING_LIMITS, PAGINATION } from '../../constants';

/**
 * Schema for creating a new post
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(
      STRING_LIMITS.TEXT_MEDIUM,
      `Title must not exceed ${STRING_LIMITS.TEXT_MEDIUM} characters`
    ),
  description: z
    .string()
    .max(
      STRING_LIMITS.DESCRIPTION_MAX,
      `Description must not exceed ${STRING_LIMITS.DESCRIPTION_MAX} characters`
    )
    .optional(),
  content: z.string().min(1, 'Content cannot be empty'),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

/**
 * Schema for updating an existing post
 */
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(STRING_LIMITS.TEXT_MEDIUM, `Title must not exceed ${STRING_LIMITS.TEXT_MEDIUM} characters`)
    .optional(),
  description: z
    .string()
    .max(
      STRING_LIMITS.DESCRIPTION_MAX,
      `Description must not exceed ${STRING_LIMITS.DESCRIPTION_MAX} characters`
    )
    .optional(),
  content: z.string().min(1, 'Content cannot be empty').optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

/**
 * Schema for filtering and searching posts
 */
export const filterPostsSchema = z.object({
  tag: z.string().optional(),
  author: z.string().optional(),
  favorited: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Schema for pagination query parameters (legacy support)
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

/**
 * Schema for post slug parameter
 */
export const postSlugSchema = z.object({
  slug: z.string().min(1, 'Post slug is required'),
});

/**
 * Legacy ID schema for backward compatibility
 */
export const postIdSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type FilterPostsQuery = z.infer<typeof filterPostsSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PostSlugParam = z.infer<typeof postSlugSchema>;
export type PostIdParam = z.infer<typeof postIdSchema>;
