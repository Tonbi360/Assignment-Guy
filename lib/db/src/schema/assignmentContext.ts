import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { assignmentsTable } from "./assignments";

/**
 * Context sections attached to an assignment.
 * Each section represents a named block of information about the assignment
 * (e.g. "What the lecturer said", "Relevant resources", "Previous exam notes").
 *
 * Displayed on the Assignment Detail page below the main description.
 */
export const assignmentContextTable = pgTable("assignment_context", {
  context_id: uuid("context_id").primaryKey().defaultRandom(),
  assignment_id: uuid("assignment_id")
    .notNull()
    .references(() => assignmentsTable.assignment_id, { onDelete: "cascade" }),
  section_title: text("section_title").notNull(),
  content: text("content").notNull(),
  /** Display order within the assignment's context list. */
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type AssignmentContext = typeof assignmentContextTable.$inferSelect;
