import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { schoolsTable } from "./schools";

export const departmentsTable = pgTable("departments", {
  department_id: uuid("department_id").primaryKey().defaultRandom(),
  school_id: uuid("school_id")
    .notNull()
    .references(() => schoolsTable.school_id, { onDelete: "cascade" }),
  department_name: text("department_name").notNull(),
});

export type Department = typeof departmentsTable.$inferSelect;
