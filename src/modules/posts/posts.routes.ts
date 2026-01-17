import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { ERROR_CODES, HTTP_STATUS } from '../../constants';
import { db } from '../../core/db';
import { requireAuth, type AppEnv } from '../../middleware/session';
import { validate } from '../../middleware/validate';
import { error, paginated, success } from '../../utils/response';
import {
  createPostSchema,
  filterPostsSchema,
  postSlugSchema,
  updatePostSchema,
  type CreatePostInput,
  type FilterPostsQuery,
  type PostSlugParam,
  type UpdatePostInput,
} from './posts.validation';
import { post, postFavorite, postTag, tag } from './db/posts.schema';
import { user } from '../auth/db/auth.schema';
import { ensureUniqueSlug, generateSlug, syncPostTags } from './posts.utils';

export const postRoutes = new Hono<AppEnv>();

/**
 * List posts with optional filtering and search
 */
postRoutes.get('/', validate(filterPostsSchema, 'query'), async (c) => {
  const filters = c.get('validatedData') as FilterPostsQuery;
  const currentUser = c.get('user');

  const { page, limit, offset, tag: tagFilter, author, favorited, search } = filters;

  const effectiveOffset = offset ?? (page - 1) * limit;

  const conditions: (ReturnType<typeof eq> | ReturnType<typeof or> | ReturnType<typeof sql>)[] = [];

  if (tagFilter) {
    const tagQuery = await db
      .select({ id: tag.id })
      .from(tag)
      .where(eq(tag.name, tagFilter.toLowerCase()));
    if (tagQuery.length > 0) {
      const postsWithTag = await db
        .select({ postId: postTag.postId })
        .from(postTag)
        .where(eq(postTag.tagId, tagQuery[0].id));
      const postIds = postsWithTag.map((pt) => pt.postId);
      if (postIds.length > 0) {
        conditions.push(sql`${post.id} IN ${postIds}`);
      } else {
        return paginated(c, [], { page, limit, total: 0, total_pages: 0 });
      }
    } else {
      return paginated(c, [], { page, limit, total: 0, total_pages: 0 });
    }
  }

  if (author) {
    const authorUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, author))
      .limit(1);
    if (authorUser.length > 0) {
      conditions.push(eq(post.userId, authorUser[0].id));
    } else {
      return paginated(c, [], { page, limit, total: 0, total_pages: 0 });
    }
  }

  if (favorited) {
    const favoritedByUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, favorited))
      .limit(1);
    if (favoritedByUser.length > 0) {
      const favoritedPosts = await db
        .select({ postId: postFavorite.postId })
        .from(postFavorite)
        .where(eq(postFavorite.userId, favoritedByUser[0].id));
      const postIds = favoritedPosts.map((pf) => pf.postId);
      if (postIds.length > 0) {
        conditions.push(sql`${post.id} IN ${postIds}`);
      } else {
        return paginated(c, [], { page, limit, total: 0, total_pages: 0 });
      }
    } else {
      return paginated(c, [], { page, limit, total: 0, total_pages: 0 });
    }
  }

  if (search) {
    conditions.push(or(ilike(post.title, `%${search}%`), ilike(post.content, `%${search}%`)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [posts, [{ count: total }]] = await Promise.all([
    db
      .select({
        post,
        author: user,
      })
      .from(post)
      .leftJoin(user, eq(post.userId, user.id))
      .where(whereClause)
      .limit(limit)
      .offset(effectiveOffset)
      .orderBy(desc(post.createdAt)),
    db.select({ count: count() }).from(post).where(whereClause),
  ]);

  const postsWithDetails = await Promise.all(
    posts.map(async (p) => {
      const postTags = await db
        .select({ tag })
        .from(postTag)
        .leftJoin(tag, eq(postTag.tagId, tag.id))
        .where(eq(postTag.postId, p.post.id));

      const isFavorited = currentUser
        ? await db
            .select()
            .from(postFavorite)
            .where(and(eq(postFavorite.postId, p.post.id), eq(postFavorite.userId, currentUser.id)))
            .limit(1)
        : [];

      return {
        slug: p.post.slug,
        title: p.post.title,
        description: p.post.description,
        content: p.post.content,
        is_published: p.post.isPublished,
        favorites_count: p.post.favoritesCount,
        favorited: isFavorited.length > 0,
        tags: postTags.map((pt) => pt.tag?.name).filter(Boolean) as string[],
        author: {
          id: p.author!.id,
          name: p.author!.name,
          email: p.author!.email,
          image: p.author!.image,
        },
        created_at: p.post.createdAt,
        updated_at: p.post.updatedAt,
      };
    })
  );

  const totalPages = Math.ceil(Number(total) / limit);

  return paginated(c, postsWithDetails, {
    page,
    limit,
    total: Number(total),
    total_pages: totalPages,
  });
});

/**
 * Create a new post with tags
 */
postRoutes.post('/', requireAuth, validate(createPostSchema), async (c) => {
  const currentUser = c.get('user')!;
  const body = c.get('validatedData') as CreatePostInput;

  const baseSlug = generateSlug(body.title);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  const [newPost] = await db
    .insert(post)
    .values({
      id: crypto.randomUUID(),
      slug: uniqueSlug,
      userId: currentUser.id,
      title: body.title,
      description: body.description,
      content: body.content,
      isPublished: false,
      favoritesCount: 0,
    })
    .returning();

  if (body.tags && body.tags.length > 0) {
    await syncPostTags(newPost.id, body.tags);
  }

  const postTags = await db
    .select({ tag })
    .from(postTag)
    .leftJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, newPost.id));

  return success(
    c,
    {
      slug: newPost.slug,
      title: newPost.title,
      description: newPost.description,
      content: newPost.content,
      is_published: newPost.isPublished,
      favorites_count: newPost.favoritesCount,
      favorited: false,
      tags: postTags.map((pt) => pt.tag?.name).filter(Boolean) as string[],
      author: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
      },
      created_at: newPost.createdAt,
      updated_at: newPost.updatedAt,
    },
    HTTP_STATUS.CREATED
  );
});

/**
 * Get a single post by slug
 */
postRoutes.get('/:slug', validate(postSlugSchema, 'params'), async (c) => {
  const { slug } = c.get('validatedData') as PostSlugParam;
  const currentUser = c.get('user');

  const [foundPost] = await db
    .select({
      post,
      author: user,
    })
    .from(post)
    .leftJoin(user, eq(post.userId, user.id))
    .where(eq(post.slug, slug))
    .limit(1);

  if (!foundPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const postTags = await db
    .select({ tag })
    .from(postTag)
    .leftJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, foundPost.post.id));

  const isFavorited = currentUser
    ? await db
        .select()
        .from(postFavorite)
        .where(
          and(eq(postFavorite.postId, foundPost.post.id), eq(postFavorite.userId, currentUser.id))
        )
        .limit(1)
    : [];

  return success(c, {
    slug: foundPost.post.slug,
    title: foundPost.post.title,
    description: foundPost.post.description,
    content: foundPost.post.content,
    is_published: foundPost.post.isPublished,
    favorites_count: foundPost.post.favoritesCount,
    favorited: isFavorited.length > 0,
    tags: postTags.map((pt) => pt.tag?.name).filter(Boolean) as string[],
    author: {
      id: foundPost.author!.id,
      name: foundPost.author!.name,
      email: foundPost.author!.email,
      image: foundPost.author!.image,
    },
    created_at: foundPost.post.createdAt,
    updated_at: foundPost.post.updatedAt,
  });
});

/**
 * Update a post by slug
 */
postRoutes.patch(
  '/:slug',
  requireAuth,
  validate(postSlugSchema, 'params'),
  validate(updatePostSchema),
  async (c) => {
    const currentUser = c.get('user')!;
    const slug = c.req.param('slug');
    const body = c.get('validatedData') as UpdatePostInput;

    const [existingPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

    if (!existingPost) {
      return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
    }

    if (existingPost.userId !== currentUser.id) {
      return error(
        c,
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to update this post',
        HTTP_STATUS.FORBIDDEN
      );
    }

    let newSlug = existingPost.slug;
    if (body.title && body.title !== existingPost.title) {
      const baseSlug = generateSlug(body.title);
      newSlug = await ensureUniqueSlug(baseSlug);
    }

    const [updatedPost] = await db
      .update(post)
      .set({
        ...(body.title && { title: body.title, slug: newSlug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content && { content: body.content }),
        ...(body.is_published !== undefined && { isPublished: body.is_published }),
      })
      .where(eq(post.id, existingPost.id))
      .returning();

    if (body.tags !== undefined) {
      await syncPostTags(updatedPost.id, body.tags);
    }

    const postTags = await db
      .select({ tag })
      .from(postTag)
      .leftJoin(tag, eq(postTag.tagId, tag.id))
      .where(eq(postTag.postId, updatedPost.id));

    return success(c, {
      slug: updatedPost.slug,
      title: updatedPost.title,
      description: updatedPost.description,
      content: updatedPost.content,
      is_published: updatedPost.isPublished,
      favorites_count: updatedPost.favoritesCount,
      favorited: false,
      tags: postTags.map((pt) => pt.tag?.name).filter(Boolean) as string[],
      author: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
      },
      created_at: updatedPost.createdAt,
      updated_at: updatedPost.updatedAt,
    });
  }
);

/**
 * Delete a post by slug
 */
postRoutes.delete('/:slug', requireAuth, validate(postSlugSchema, 'params'), async (c) => {
  const currentUser = c.get('user')!;
  const { slug } = c.get('validatedData') as PostSlugParam;

  const [existingPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

  if (!existingPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  if (existingPost.userId !== currentUser.id) {
    return error(
      c,
      ERROR_CODES.FORBIDDEN,
      'You do not have permission to delete this post',
      HTTP_STATUS.FORBIDDEN
    );
  }

  await db.delete(post).where(eq(post.id, existingPost.id));

  return success(c, {
    message: 'Post deleted successfully',
  });
});

/**
 * Favorite a post
 */
postRoutes.post('/:slug/favorite', requireAuth, validate(postSlugSchema, 'params'), async (c) => {
  const currentUser = c.get('user')!;
  const { slug } = c.get('validatedData') as PostSlugParam;

  const [foundPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

  if (!foundPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const [existing] = await db
    .select()
    .from(postFavorite)
    .where(and(eq(postFavorite.postId, foundPost.id), eq(postFavorite.userId, currentUser.id)))
    .limit(1);

  if (!existing) {
    await db.insert(postFavorite).values({
      postId: foundPost.id,
      userId: currentUser.id,
    });

    await db
      .update(post)
      .set({ favoritesCount: sql`${post.favoritesCount} + 1` })
      .where(eq(post.id, foundPost.id));
  }

  const [updatedPost] = await db.select().from(post).where(eq(post.id, foundPost.id)).limit(1);

  return success(c, {
    slug: updatedPost!.slug,
    favorited: true,
    favorites_count: updatedPost!.favoritesCount,
  });
});

/**
 * Unfavorite a post
 */
postRoutes.delete('/:slug/favorite', requireAuth, validate(postSlugSchema, 'params'), async (c) => {
  const currentUser = c.get('user')!;
  const { slug } = c.get('validatedData') as PostSlugParam;

  const [foundPost] = await db.select().from(post).where(eq(post.slug, slug)).limit(1);

  if (!foundPost) {
    return error(c, ERROR_CODES.NOT_FOUND, 'Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const deleted = await db
    .delete(postFavorite)
    .where(and(eq(postFavorite.postId, foundPost.id), eq(postFavorite.userId, currentUser.id)))
    .returning();

  if (deleted.length > 0) {
    await db
      .update(post)
      .set({ favoritesCount: sql`${post.favoritesCount} - 1` })
      .where(eq(post.id, foundPost.id));
  }

  const [updatedPost] = await db.select().from(post).where(eq(post.id, foundPost.id)).limit(1);

  return success(c, {
    slug: updatedPost!.slug,
    favorited: false,
    favorites_count: updatedPost!.favoritesCount,
  });
});

/**
 * Get all tags
 */
postRoutes.get('/tags/all', async (c) => {
  const tags = await db
    .select({
      name: tag.name,
      count: count(postTag.postId),
    })
    .from(tag)
    .leftJoin(postTag, eq(tag.id, postTag.tagId))
    .groupBy(tag.name)
    .orderBy(desc(count(postTag.postId)));

  return success(c, {
    tags: tags.map((t) => ({
      name: t.name,
      posts_count: Number(t.count),
    })),
  });
});
