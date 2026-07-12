import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable } from "@workspace/db/schema";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

/**
 * GET /api/v1/departments/:departmentId/courses
 * Returns courses for a department. Optional ?level= filter.
 * Returns empty array if none exist — handled by client empty state.
 */
router.get("/departments/:departmentId/courses", async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { level } = req.query;

    const levelNum =
      typeof level === "string" && level.trim() !== ""
        ? parseInt(level, 10)
        : null;

    const conditions = [eq(coursesTable.department_id, departmentId)];
    if (levelNum !== null && !isNaN(levelNum)) {
      conditions.push(eq(coursesTable.level, levelNum));
    }

    const courses = await db
      .select()
      .from(coursesTable)
      .where(and(...conditions))
      .orderBy(asc(coursesTable.course_code));

    res.json({ success: true, data: courses });
  } catch (err) {
    req.log.error({ err }, "Failed to list courses");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve courses. Please try again.",
      code: "COURSES_FETCH_ERROR",
    });
  }
});

export default router;
