import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router = Router();

/**
 * GET /api/v1/schools/:schoolId/departments
 * Returns all departments for a school.
 * Returns empty array if none exist — handled by client empty state.
 */
router.get("/schools/:schoolId/departments", async (req, res) => {
  try {
    const { schoolId } = req.params;

    const departments = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.school_id, schoolId))
      .orderBy(asc(departmentsTable.department_name));

    res.json({ success: true, data: departments });
  } catch (err) {
    req.log.error({ err }, "Failed to list departments");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve departments. Please try again.",
      code: "DEPARTMENTS_FETCH_ERROR",
    });
  }
});

export default router;
