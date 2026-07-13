import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { departmentsTable } from "./departments";

export const coursesTable = pgTable("courses", {
  course_id: uuid("course_id").primaryKey().defaultRandom(),
  department_id: uuid("department_id")
    .notNull()
    .references(() => departmentsTable.department_id, { onDelete: "cascade" }),
  course_code: text("course_code").notNull(),
  course_name: text("course_name").notNull(),
  /** Academic year/level: 1=Year1, 2=Year2, 3=Year3, 4=Year4, 5=Postgrad, 0=Other */
  level: integer("level"),
  /** e.g. "First", "Second", "Year-round" */
  semester: text("semester"),
});

export type Course = typeof coursesTable.$inferSelect;
