import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { assignmentsTable } from "./assignments";

/**
 * Files attached to an assignment (images, PDFs, text snippets).
 * Upload to object storage happens in Milestone 3. The schema is here now so
 * the DB is set up ahead of the UI.
 *
 * Attachment types: "image" | "pdf" | "text"
 */
export const assignmentAttachmentsTable = pgTable("assignment_attachments", {
  attachment_id: uuid("attachment_id").primaryKey().defaultRandom(),
  assignment_id: uuid("assignment_id")
    .notNull()
    .references(() => assignmentsTable.assignment_id, { onDelete: "cascade" }),
  /** image | pdf | text */
  attachment_type: text("attachment_type").notNull(),
  /** Storage URL or path (populated after upload in M3). */
  url: text("url"),
  filename: text("filename"),
  /** File size in bytes. */
  file_size: integer("file_size"),
  /** Ordering within the assignment's attachment list. */
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type AssignmentAttachment = typeof assignmentAttachmentsTable.$inferSelect;
