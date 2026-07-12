import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { schoolsTable } from "./schools";

export const departmentsTable = pgTable("departments", {
  department_id: uuid("department_id").primaryKey().defaultRandom(),
  school_id: uuid("school_id")
    .notNull()
    .references(() => schoolsTable.school_id, { onDelete: "cascade" }),
  department_name: text("department_name").notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({
  department_id: true,
});

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;
