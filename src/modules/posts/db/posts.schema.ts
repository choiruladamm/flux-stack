import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, integer, index, primaryKey } from 'drizzle-orm/pg-core';
import { user } from '../../auth/db/auth.schema';

export const post = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    content: text('content').notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    favoritesCount: integer('favorites_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('posts_user_id_idx').on(table.userId), index('posts_slug_idx').on(table.slug)]
);

export const tag = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postTag = pgTable(
  'post_tags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

export const postFavorite = pgTable(
  'post_favorites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  postTags: many(postTag),
  favorites: many(postFavorite),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  postTags: many(postTag),
}));

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));

export const postFavoriteRelations = relations(postFavorite, ({ one }) => ({
  user: one(user, {
    fields: [postFavorite.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postFavorite.postId],
    references: [post.id],
  }),
}));
