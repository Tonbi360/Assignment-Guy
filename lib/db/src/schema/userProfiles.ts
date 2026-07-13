import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { schoolsTable } from "./schools";
import { departmentsTable } from "./departments";

/**
 * User profiles extend Supabase auth users.
 * user_id references auth.users.id (managed by Supabase).
 * Role values: student | contributor | trusted_contributor | admin
 */
export const userProfilesTable = pgTable("user_profiles", {
  user_id: uuid("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  display_name: text("display_name").notNull(),
  profile_photo: text("profile_photo"),
  school_id: uuid("school_id").references(() => schoolsTable.school_id, {
    onDelete: "set null",
  }),
  department_id: uuid("department_id").references(
    () => departmentsTable.department_id,
    { onDelete: "set null" },
  ),
  /** Academic level: 1=Year1, 2=Year2, 3=Year3, 4=Year4, 5=Postgrad, 0=Other */
  level: integer("level"),
  contribution_score: integer("contribution_score").notNull().default(0),
  role: text("role").notNull().default("student"),
  has_completed_onboarding: boolean("has_completed_onboarding")
    .notNull()
    .default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type UserProfile = typeof userProfilesTable.$inferSelect;
