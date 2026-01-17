import { and, count, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { ERROR_CODES, HTTP_STATUS } from '../../constants';
import { db } from '../../core/db';
import { post } from '../../db/schema';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { validate } from '../../middleware/validate';
import { error, paginated, success } from '../../utils/response';
import {
  createPostSchema,
  paginationQuerySchema,
  postIdSchema,
  updatePostSchema,
  type CreatePostInput,
  type PaginationQuery,
  type PostIdParam,
  type UpdatePostInput,
} from './posts.schema';

export const postRoutes = new Hono<AppEnv>();

/**
 * List all posts for the authenticated user (paginated)
 */
postRoutes.get('/', requireAuth, validate(paginationQuerySchema, 'query'), async (c) => {
  const user = c.get('user')!;
  const { page, limit } = c.get('validatedData') as PaginationQuery;

  const offset = (page - 1) * limit;

  const [posts, [{ count: total }]] = await Promise.all([
    db
      .select()
      .from(post)
      .where(eq(post.userId, user.id))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(post.createdAt)),
    db.select({ count: count() }).from(post).where(eq(post.userId, user.id)),
  ]);

  const totalPages = Math.ceil(Number(total) / limit);

  return paginated(
    c,
    posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      is_published: p.isPublished,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    })),
    {
      page,
      limit,
      total: Number(total),
      total_pages: totalPages,
    }
  );
});

/**
 * Create a new post
 */
postRoutes.post('/', requireAuth, validate(createPostSchema), async (c) => {
  const user = c.get('user')!;
  const body = c.get('validatedData') as CreatePostInput;

  const newPost = await db
    .insert(post)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      title: body.title,
      content: body.content,
      isPublished: false,
    })
    .returning();

  return success(
    c,
    {
      id: newPost[0].id,
      title: newPost[0].title,
      content: newPost[0].content,
      is_published: newPost[0].isPublished,
      created_at: newPost[0].createdAt,
      updated_at: newPost[0].updatedAt,
    },
    HTTP_STATUS.CREATED
  );
});

/**
 * Get a single post by ID
 */
postRoutes.get('/:id', requireAuth, validate(postIdSchema, 'params'), async (c) => {
  const user = c.get('user')!;
  const { id } = c.get('validatedData') as PostIdParam;

  const [foundPost] = await db
    .select()
    .from(post)
    .where(and(eq(post.id, id), eq(post.userId, user.id)))
    .limit(1);

  if (!foundPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  return success(c, {
    id: foundPost.id,
    title: foundPost.title,
    content: foundPost.content,
    is_published: foundPost.isPublished,
    created_at: foundPost.createdAt,
    updated_at: foundPost.updatedAt,
  });
});

/**
 * Update a post
 */
postRoutes.patch(
  '/:id',
  requireAuth,
  validate(postIdSchema, 'params'),
  validate(updatePostSchema),
  async (c) => {
    const user = c.get('user')!;
    const id = c.req.param('id');
    const body = c.get('validatedData') as UpdatePostInput;

    const [existingPost] = await db
      .select()
      .from(post)
      .where(and(eq(post.id, id), eq(post.userId, user.id)))
      .limit(1);

    if (!existingPost) {
      return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
    }

    const [updatedPost] = await db
      .update(post)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
      })
      .where(eq(post.id, id))
      .returning();

    return success(c, {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      is_published: updatedPost.isPublished,
      created_at: updatedPost.createdAt,
      updated_at: updatedPost.updatedAt,
    });
  }
);

/**
 * Delete a post
 */
postRoutes.delete('/:id', requireAuth, validate(postIdSchema, 'params'), async (c) => {
  const user = c.get('user')!;
  const { id } = c.get('validatedData') as PostIdParam;

  const [existingPost] = await db
    .select()
    .from(post)
    .where(and(eq(post.id, id), eq(post.userId, user.id)))
    .limit(1);

  if (!existingPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  await db.delete(post).where(eq(post.id, id));

  return success(c, {
    message: 'Post deleted successfully',
  });
});
