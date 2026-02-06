import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// Users table for authentication
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const userRelations = relations(users, ({ many }) => ({
  websites: many(websites),
  articles: many(articles),
  batches: many(uploadBatches),
  logs: many(activityLogs),
}));

// Websites table for storing WordPress sites
export const websites = sqliteTable('websites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  username: text('username').notNull(),
  appPassword: text('password').notNull(), // Store encrypted
  apiKey: text('api_key'),
  status: text('status').default('active'), // active, inactive, error
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const websiteRelations = relations(websites, ({ one, many }) => ({
  user: one(users, {
    fields: [websites.userId],
    references: [users.id],
  }),
  articles: many(articles),
}));

// Articles main table
export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  originalTitle: text('original_title').notNull(),
  originalContent: text('original_content').notNull(),
  spunTitle: text('spun_title'),
  spunContent: text('spun_content'),
  keywords: text('keywords'), // JSON string array
  status: text('status').default('pending'), // pending, spinning, ready, publishing, published, failed
  websiteId: integer('website_id').references(() => websites.id),
  batchId: integer('batch_id').references(() => uploadBatches.id),
  liveLink: text('live_url'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  publishAttempts: integer('publish_attempts').default(0),
  errorLog: text('error_log'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const articleRelations = relations(articles, ({ one }) => ({
  website: one(websites, {
    fields: [articles.websiteId],
    references: [websites.id],
  }),
}));

// Excel upload batches
export const uploadBatches = sqliteTable('upload_batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  totalArticles: integer('total_articles'),
  processedArticles: integer('processed_articles').default(0),
  status: text('status').default('processing'), // processing, completed, failed
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const uploadBatchRelations = relations(uploadBatches, ({ one }) => ({
  user: one(users, {
    fields: [uploadBatches.userId],
    references: [users.id],
  }),
}));

// Activity logs
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // upload, spin, publish, error
  message: text('message').notNull(),
  details: text('details'), // JSON string
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
