import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { userProfilesTable } from "./userProfiles";
import { coursesTable } from "./courses";

/**
 * Many-to-many: users ↔ courses
 * One student can join multiple courses across departments.
 */
export const userCoursesTable = pgTable(
  "user_courses",
  {
    user_id: uuid("user_id")
      .notNull()
      .references(() => userProfilesTable.user_id, { onDelete: "cascade" }),
    course_id: uuid("course_id")
      .notNull()
      .references(() => coursesTable.course_id, { onDelete: "cascade" }),
    joined_at: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.course_id] })],
);

export type UserCourse = typeof userCoursesTable.$inferSelect;
