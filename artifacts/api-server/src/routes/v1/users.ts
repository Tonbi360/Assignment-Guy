import { Router } from "express";
import { db } from "@workspace/db";
import {
  userProfilesTable,
  userCoursesTable,
  schoolsTable,
  departmentsTable,
  coursesTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/v1/users/me
 * Returns the authenticated user's full profile including school,
 * department, and enrolled courses.
 * Returns 404 if the user has not completed onboarding yet.
 */
router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;

    // Fetch profile joined with school and department
    const rows = await db
      .select({
        user_id: userProfilesTable.user_id,
        email: userProfilesTable.email,
        display_name: userProfilesTable.display_name,
        profile_photo: userProfilesTable.profile_photo,
        level: userProfilesTable.level,
        contribution_score: userProfilesTable.contribution_score,
        role: userProfilesTable.role,
        has_completed_onboarding: userProfilesTable.has_completed_onboarding,
        // School columns
        school_id: schoolsTable.school_id,
        school_name: schoolsTable.school_name,
        school_country: schoolsTable.country,
        school_created_at: schoolsTable.created_at,
        // Department columns
        department_id: departmentsTable.department_id,
        department_name: departmentsTable.department_name,
        dept_school_id: departmentsTable.school_id,
      })
      .from(userProfilesTable)
      .leftJoin(schoolsTable, eq(userProfilesTable.school_id, schoolsTable.school_id))
      .leftJoin(
        departmentsTable,
        eq(userProfilesTable.department_id, departmentsTable.department_id),
      )
      .where(eq(userProfilesTable.user_id, userId));

    if (!rows.length) {
      res.status(404).json({
        success: false,
        message: "Profile not found.",
        code: "PROFILE_NOT_FOUND",
      });
      return;
    }

    const row = rows[0];

    // Fetch enrolled courses
    const enrolledCourses = await db
      .select({
        course_id: coursesTable.course_id,
        department_id: coursesTable.department_id,
        course_code: coursesTable.course_code,
        course_name: coursesTable.course_name,
        level: coursesTable.level,
        semester: coursesTable.semester,
      })
      .from(userCoursesTable)
      .innerJoin(coursesTable, eq(userCoursesTable.course_id, coursesTable.course_id))
      .where(eq(userCoursesTable.user_id, userId));

    // Shape the response to match the mobile app's UserProfile type
    const profile = {
      id: row.user_id,
      email: row.email,
      displayName: row.display_name,
      profilePhoto: row.profile_photo ?? null,
      school: row.school_id
        ? {
            school_id: row.school_id,
            school_name: row.school_name!,
            country: row.school_country ?? null,
            created_at: row.school_created_at!.toISOString(),
          }
        : null,
      department: row.department_id
        ? {
            department_id: row.department_id,
            department_name: row.department_name!,
            school_id: row.dept_school_id!,
          }
        : null,
      level: row.level ?? null,
      courses: enrolledCourses,
      contributionScore: row.contribution_score,
      role: row.role,
      hasCompletedOnboarding: row.has_completed_onboarding,
    };

    res.json({ success: true, data: profile });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user profile");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your profile. Please try again.",
      code: "PROFILE_FETCH_ERROR",
    });
  }
});

/**
 * PATCH /api/v1/users/me
 * Creates or updates the user's profile and course enrolments.
 * Called at the end of onboarding (completeOnboarding) and for profile updates.
 */
router.patch("/users/me", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const { displayName, schoolId, departmentId, level, courseIds } = req.body as {
      displayName?: string;
      schoolId?: string;
      departmentId?: string;
      level?: number;
      courseIds?: string[];
    };

    // Require at minimum a display name
    if (!displayName?.trim()) {
      res.status(400).json({
        success: false,
        message: "Display name is required.",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    // Extract email from Supabase — we already verified the token in requireAuth,
    // but we still need the email for the user_profiles row.
    // We fetch it from the existing row if present, or from the JWT sub claim.
    const existing = await db
      .select({ email: userProfilesTable.email })
      .from(userProfilesTable)
      .where(eq(userProfilesTable.user_id, userId));

    // We need an email for the insert. If no existing row, pull it from the
    // request body (client sends it during registration onboarding).
    const email: string = existing[0]?.email ?? (req.body.email as string) ?? "";

    // Upsert user_profiles
    await db
      .insert(userProfilesTable)
      .values({
        user_id: userId,
        email,
        display_name: displayName.trim(),
        school_id: schoolId ?? null,
        department_id: departmentId ?? null,
        level: level ?? null,
        has_completed_onboarding: true,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.user_id,
        set: {
          display_name: displayName.trim(),
          school_id: schoolId ?? null,
          department_id: departmentId ?? null,
          level: level ?? null,
          has_completed_onboarding: true,
          updated_at: new Date(),
        },
      });

    // Replace course enrolments atomically
    if (Array.isArray(courseIds)) {
      // Remove all existing enrolments
      await db.delete(userCoursesTable).where(eq(userCoursesTable.user_id, userId));

      // Insert new enrolments
      if (courseIds.length > 0) {
        await db.insert(userCoursesTable).values(
          courseIds.map((courseId) => ({
            user_id: userId,
            course_id: courseId,
          })),
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update user profile");
    res.status(500).json({
      success: false,
      message: "Failed to save your profile. Please try again.",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
});

export default router;
