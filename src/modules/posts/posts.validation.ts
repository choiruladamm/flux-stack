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
  content: z.string().min(1, 'Content cannot be empty'),
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
  content: z.string().min(1, 'Content cannot be empty').optional(),
});

/**
 * Schema for pagination query parameters
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

/**
 * Schema for post ID parameter
 */
export const postIdSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PostIdParam = z.infer<typeof postIdSchema>;
