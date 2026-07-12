import { Router } from "express";
import { db } from "@workspace/db";
import { schoolsTable } from "@workspace/db/schema";
import { ilike, asc } from "drizzle-orm";

const router = Router();

/**
 * GET /api/v1/schools
 * Returns all schools, with optional search query.
 * Returns empty array if no schools exist — handled by client empty state.
 */
router.get("/schools", async (req, res) => {
  try {
    const { search } = req.query;

    const schools =
      typeof search === "string" && search.trim()
        ? await db
            .select()
            .from(schoolsTable)
            .where(ilike(schoolsTable.school_name, `%${search.trim()}%`))
            .orderBy(asc(schoolsTable.school_name))
        : await db
            .select()
            .from(schoolsTable)
            .orderBy(asc(schoolsTable.school_name));

    res.json({ success: true, data: schools });
  } catch (err) {
    req.log.error({ err }, "Failed to list schools");
    res.status(500).json({
      success: false,
      message: "Failed to retrieve schools. Please try again.",
      code: "SCHOOLS_FETCH_ERROR",
    });
  }
});

export default router;
