import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const schoolsTable = pgTable("schools", {
  school_id: uuid("school_id").primaryKey().defaultRandom(),
  school_name: text("school_name").notNull(),
  country: text("country"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({
  school_id: true,
  created_at: true,
});

export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schoolsTable.$inferSelect;
