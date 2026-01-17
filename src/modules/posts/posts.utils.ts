import { db } from '../../core/db';
import { eq, sql } from 'drizzle-orm';
import { post, tag, postTag } from './db/posts.schema';

/**
 * Generate URL-friendly slug from title
 *
 * @param title - Post title to convert to slug
 * @returns Lowercase slug with hyphens
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure slug is unique by appending random suffix if collision detected
 *
 * @param baseSlug - Base slug generated from title
 * @returns Unique slug that doesn't exist in database
 */
export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const existingSlugs = await db
    .select({ slug: post.slug })
    .from(post)
    .where(sql`${post.slug} LIKE ${baseSlug} || '%'`);

  if (existingSlugs.length === 0) {
    return baseSlug;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Sync post tags - remove old associations and create new ones
 *
 * @param postId - Post ID to sync tags for
 * @param tagNames - Array of tag names to associate with post
 */
export async function syncPostTags(postId: string, tagNames: string[]): Promise<void> {
  await db.delete(postTag).where(eq(postTag.postId, postId));

  if (tagNames.length === 0) {
    return;
  }

  const tagIds = await Promise.all(
    tagNames.map(async (tagName) => {
      const normalizedName = tagName.toLowerCase().trim();

      const [existingTag] = await db
        .select()
        .from(tag)
        .where(eq(tag.name, normalizedName))
        .limit(1);

      if (existingTag) {
        return existingTag.id;
      }

      const [newTag] = await db
        .insert(tag)
        .values({
          id: crypto.randomUUID(),
          name: normalizedName,
        })
        .returning({ id: tag.id });

      return newTag.id;
    })
  );

  await db.insert(postTag).values(
    tagIds.map((tagId) => ({
      postId,
      tagId,
    }))
  );
}
