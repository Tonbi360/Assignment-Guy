import { Router } from "express";
import { db } from "@workspace/db";
import {
  assignmentsTable,
  assignmentAttachmentsTable,
  assignmentContextTable,
  coursesTable,
  departmentsTable,
  userProfilesTable,
  userCoursesTable,
} from "@workspace/db/schema";
import { eq, and, ilike, inArray, ne, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/v1/assignments
 * Lists assignments. Supports optional filters:
 *   ?courseId=   — restrict to a single course
 *   ?search=     — partial title match
 *   ?status=     — active (default) | closed | archived
 *   ?limit=      — max results (default 30, max 100)
 *   ?offset=     — pagination offset (default 0)
 */
router.get("/assignments", async (req, res) => {
  try {
    const {
      courseId,
      search,
      status = "active",
      limit: limitStr = "30",
      offset: offsetStr = "0",
    } = req.query as Record<string, string | undefined>;

    const limit = Math.min(parseInt(limitStr ?? "30", 10) || 30, 100);
    const offset = parseInt(offsetStr ?? "0", 10) || 0;

    // Build where conditions
    const conditions = [ne(assignmentsTable.status, "deleted")];

    if (status && ["active", "closed", "archived"].includes(status)) {
      conditions.push(eq(assignmentsTable.status, status));
    }
    if (courseId) {
      conditions.push(eq(assignmentsTable.course_id, courseId));
    }
    if (search?.trim()) {
      conditions.push(ilike(assignmentsTable.title, `%${search.trim()}%`));
    }

    const rows = await db
      .select({
        assignment_id: assignmentsTable.assignment_id,
        title: assignmentsTable.title,
        description: assignmentsTable.description,
        due_date: assignmentsTable.due_date,
        assignment_type: assignmentsTable.assignment_type,
        status: assignmentsTable.status,
        verification_status: assignmentsTable.verification_status,
        discussion_count: assignmentsTable.discussion_count,
        created_at: assignmentsTable.created_at,
        updated_at: assignmentsTable.updated_at,
        // Course
        course_id: coursesTable.course_id,
        course_name: coursesTable.course_name,
        course_code: coursesTable.course_code,
        // Uploader
        uploader_display_name: userProfilesTable.display_name,
      })
      .from(assignmentsTable)
      .innerJoin(
        coursesTable,
        eq(assignmentsTable.course_id, coursesTable.course_id),
      )
      .leftJoin(
        userProfilesTable,
        eq(assignmentsTable.uploader_id, userProfilesTable.user_id),
      )
      .where(and(...conditions))
      .orderBy(desc(assignmentsTable.created_at))
      .limit(limit)
      .offset(offset);

    const assignments = rows.map((r) => ({
      assignment_id: r.assignment_id,
      title: r.title,
      description: r.description ?? null,
      due_date: r.due_date ? r.due_date.toISOString() : null,
      assignment_type: r.assignment_type,
      status: r.status,
      verification_status: r.verification_status,
      discussion_count: r.discussion_count,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
      course_id: r.course_id,
      course_name: r.course_name,
      course_code: r.course_code,
      uploader_display_name: r.uploader_display_name ?? "Unknown",
    }));

    res.json({ success: true, data: assignments, total: assignments.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch assignments");
    res.status(500).json({
      success: false,
      message: "Failed to load assignments. Please try again.",
      code: "ASSIGNMENTS_FETCH_ERROR",
    });
  }
});

/**
 * GET /api/v1/assignments/:assignmentId
 * Returns a single assignment with attachments and context sections.
 */
router.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const rows = await db
      .select({
        assignment_id: assignmentsTable.assignment_id,
        title: assignmentsTable.title,
        description: assignmentsTable.description,
        due_date: assignmentsTable.due_date,
        assignment_type: assignmentsTable.assignment_type,
        status: assignmentsTable.status,
        verification_status: assignmentsTable.verification_status,
        discussion_count: assignmentsTable.discussion_count,
        created_at: assignmentsTable.created_at,
        updated_at: assignmentsTable.updated_at,
        course_id: coursesTable.course_id,
        course_name: coursesTable.course_name,
        course_code: coursesTable.course_code,
        course_level: coursesTable.level,
        course_semester: coursesTable.semester,
        uploader_id: assignmentsTable.uploader_id,
        uploader_display_name: userProfilesTable.display_name,
      })
      .from(assignmentsTable)
      .innerJoin(
        coursesTable,
        eq(assignmentsTable.course_id, coursesTable.course_id),
      )
      .leftJoin(
        userProfilesTable,
        eq(assignmentsTable.uploader_id, userProfilesTable.user_id),
      )
      .where(
        and(
          eq(assignmentsTable.assignment_id, assignmentId),
          ne(assignmentsTable.status, "deleted"),
        ),
      );

    if (!rows.length) {
      res.status(404).json({
        success: false,
        message: "Assignment not found.",
        code: "ASSIGNMENT_NOT_FOUND",
      });
      return;
    }

    const row = rows[0];

    // Fetch attachments and context in parallel
    const [attachments, context] = await Promise.all([
      db
        .select()
        .from(assignmentAttachmentsTable)
        .where(eq(assignmentAttachmentsTable.assignment_id, assignmentId))
        .orderBy(assignmentAttachmentsTable.sort_order),
      db
        .select()
        .from(assignmentContextTable)
        .where(eq(assignmentContextTable.assignment_id, assignmentId))
        .orderBy(assignmentContextTable.sort_order),
    ]);

    const assignment = {
      assignment_id: row.assignment_id,
      title: row.title,
      description: row.description ?? null,
      due_date: row.due_date ? row.due_date.toISOString() : null,
      assignment_type: row.assignment_type,
      status: row.status,
      verification_status: row.verification_status,
      discussion_count: row.discussion_count,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      course_id: row.course_id,
      course_name: row.course_name,
      course_code: row.course_code,
      uploader_display_name: row.uploader_display_name ?? "Unknown",
      attachments: attachments.map((a) => ({
        attachment_id: a.attachment_id,
        attachment_type: a.attachment_type,
        url: a.url ?? null,
        filename: a.filename ?? null,
        file_size: a.file_size ?? null,
        sort_order: a.sort_order,
      })),
      context: context.map((c) => ({
        context_id: c.context_id,
        section_title: c.section_title,
        content: c.content,
        sort_order: c.sort_order,
      })),
    };

    res.json({ success: true, data: assignment });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch assignment");
    res.status(500).json({
      success: false,
      message: "Failed to load assignment. Please try again.",
      code: "ASSIGNMENT_FETCH_ERROR",
    });
  }
});

/**
 * POST /api/v1/assignments
 * Creates a new assignment. Protected — requires a valid Supabase JWT.
 */
router.post("/assignments", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const { courseId, title, description, dueDate, assignmentType } =
      req.body as {
        courseId?: string;
        title?: string;
        description?: string;
        dueDate?: string;
        assignmentType?: string;
      };

    // Validate required fields
    if (!courseId?.trim()) {
      res.status(400).json({
        success: false,
        message: "courseId is required.",
        code: "VALIDATION_ERROR",
      });
      return;
    }
    if (!title?.trim()) {
      res.status(400).json({
        success: false,
        message: "title is required.",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const validTypes = ["assignment", "exam", "quiz", "lab", "project"];
    const type = validTypes.includes(assignmentType ?? "")
      ? assignmentType!
      : "assignment";

    const [created] = await db
      .insert(assignmentsTable)
      .values({
        course_id: courseId.trim(),
        uploader_id: userId,
        title: title.trim(),
        description: description?.trim() ?? null,
        due_date: dueDate ? new Date(dueDate) : null,
        assignment_type: type,
      })
      .returning();

    res.status(201).json({ success: true, data: { assignment_id: created.assignment_id } });
  } catch (err) {
    req.log.error({ err }, "Failed to create assignment");
    res.status(500).json({
      success: false,
      message: "Failed to create assignment. Please try again.",
      code: "ASSIGNMENT_CREATE_ERROR",
    });
  }
});

export default router;
