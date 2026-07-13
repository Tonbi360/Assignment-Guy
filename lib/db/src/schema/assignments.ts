import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { coursesTable } from "./courses";
import { userProfilesTable } from "./userProfiles";

/**
 * Assignment statuses:
 *   active   — visible and accepting discussion
 *   closed   — due date passed; read-only
 *   archived — hidden from default feed; accessible via search
 *   deleted  — soft-deleted; not visible to users
 *
 * Verification statuses:
 *   unverified                    — newly uploaded; not yet community-reviewed
 *   community_confirmed           — upvoted/confirmed by ≥N students
 *   trusted_contributor_verified  — verified by a trusted_contributor or admin
 */
export const assignmentsTable = pgTable("assignments", {
  assignment_id: uuid("assignment_id").primaryKey().defaultRandom(),
  course_id: uuid("course_id")
    .notNull()
    .references(() => coursesTable.course_id, { onDelete: "cascade" }),
  uploader_id: uuid("uploader_id")
    .notNull()
    .references(() => userProfilesTable.user_id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  due_date: timestamp("due_date"),
  /** e.g. "assignment" | "exam" | "quiz" | "lab" | "project" */
  assignment_type: text("assignment_type").notNull().default("assignment"),
  /** active | closed | archived | deleted */
  status: text("status").notNull().default("active"),
  /** unverified | community_confirmed | trusted_contributor_verified */
  verification_status: text("verification_status")
    .notNull()
    .default("unverified"),
  /** Cached count — incremented/decremented by the discussion service. */
  discussion_count: integer("discussion_count").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type Assignment = typeof assignmentsTable.$inferSelect;
