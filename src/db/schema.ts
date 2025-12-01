import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { v7 as uuidv7 } from 'uuid';

// ==================================================
// Samples Table
// ==================================================
// Table Definition
export const samples = pgTable('samples', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Validation Schemas
export const sampleSelectSchema = createSelectSchema(samples);
export const sampleInsertSchema = createInsertSchema(samples);
export const sampleUpdateSchema = createUpdateSchema(samples);

// Type Inferences
export type Sample = typeof samples.$inferSelect;
export type NewSample = typeof samples.$inferInsert;
