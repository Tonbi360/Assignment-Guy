import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const schoolsTable = pgTable("schools", {
  school_id: uuid("school_id").primaryKey().defaultRandom(),
  school_name: text("school_name").notNull(),
  country: text("country"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type School = typeof schoolsTable.$inferSelect;
