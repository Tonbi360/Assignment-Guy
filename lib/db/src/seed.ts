/**
 * Seed script — populates schools, departments, and courses with realistic data.
 *
 * Run with:
 *   pnpm --filter @workspace/db run seed
 *
 * Safe to run multiple times: uses INSERT ... ON CONFLICT DO NOTHING via
 * onConflictDoNothing() so existing rows are preserved.
 *
 * ── Admin note ────────────────────────────────────────────────────────────────
 * There is no admin UI in v1. New schools, departments, and courses are added by:
 *   1. Running or extending this seed script, OR
 *   2. Direct SQL via the Replit DB query tool, OR
 *   3. The future admin panel (v2 roadmap).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Schools ────────────────────────────────────────────────────────────────
  const schoolRows = await db
    .insert(schema.schoolsTable)
    .values([
      { school_name: "University of Lagos", country: "Nigeria" },
      { school_name: "University of Ghana", country: "Ghana" },
      { school_name: "University of Cape Town", country: "South Africa" },
      { school_name: "Makerere University", country: "Uganda" },
      { school_name: "University of Nairobi", country: "Kenya" },
      { school_name: "Covenant University", country: "Nigeria" },
      { school_name: "Obafemi Awolowo University", country: "Nigeria" },
      { school_name: "University of Ibadan", country: "Nigeria" },
      { school_name: "Ahmadu Bello University", country: "Nigeria" },
      { school_name: "University of Benin", country: "Nigeria" },
      { school_name: "University of Education, Winneba", country: "Ghana" },
      { school_name: "Kwame Nkrumah University of Science and Technology", country: "Ghana" },
      { school_name: "University of the Witwatersrand", country: "South Africa" },
    ])
    .onConflictDoNothing()
    .returning();

  console.log(`  ✓ ${schoolRows.length} schools inserted`);

  // Re-fetch all schools (in case some were skipped due to conflicts)
  const allSchools = await db.select().from(schema.schoolsTable);
  const schoolByName = (name: string) =>
    allSchools.find((s) => s.school_name === name);

  // ── Departments ───────────────────────────────────────────────────────────
  const uniLagos = schoolByName("University of Lagos");
  const covenantUni = schoolByName("Covenant University");
  const knust = schoolByName("Kwame Nkrumah University of Science and Technology");

  const deptValues: (typeof schema.departmentsTable.$inferInsert)[] = [];

  if (uniLagos) {
    deptValues.push(
      { school_id: uniLagos.school_id, department_name: "Computer Science" },
      { school_id: uniLagos.school_id, department_name: "Electrical Engineering" },
      { school_id: uniLagos.school_id, department_name: "Civil Engineering" },
      { school_id: uniLagos.school_id, department_name: "Business Administration" },
      { school_id: uniLagos.school_id, department_name: "Medicine and Surgery" },
      { school_id: uniLagos.school_id, department_name: "Law" },
      { school_id: uniLagos.school_id, department_name: "Mathematics" },
      { school_id: uniLagos.school_id, department_name: "Physics" },
    );
  }

  if (covenantUni) {
    deptValues.push(
      { school_id: covenantUni.school_id, department_name: "Computer Science" },
      { school_id: covenantUni.school_id, department_name: "Information Technology" },
      { school_id: covenantUni.school_id, department_name: "Accounting" },
      { school_id: covenantUni.school_id, department_name: "Economics" },
      { school_id: covenantUni.school_id, department_name: "Architecture" },
    );
  }

  if (knust) {
    deptValues.push(
      { school_id: knust.school_id, department_name: "Computer Science" },
      { school_id: knust.school_id, department_name: "Electrical Engineering" },
      { school_id: knust.school_id, department_name: "Chemical Engineering" },
      { school_id: knust.school_id, department_name: "Civil Engineering" },
      { school_id: knust.school_id, department_name: "Mechanical Engineering" },
    );
  }

  const deptRows = deptValues.length
    ? await db
        .insert(schema.departmentsTable)
        .values(deptValues)
        .onConflictDoNothing()
        .returning()
    : [];

  console.log(`  ✓ ${deptRows.length} departments inserted`);

  // Re-fetch all departments
  const allDepts = await db.select().from(schema.departmentsTable);
  const deptByName = (schoolId: string, name: string) =>
    allDepts.find(
      (d) => d.school_id === schoolId && d.department_name === name,
    );

  // ── Courses ───────────────────────────────────────────────────────────────
  const courseValues: (typeof schema.coursesTable.$inferInsert)[] = [];

  if (uniLagos) {
    const cs = deptByName(uniLagos.school_id, "Computer Science");
    if (cs) {
      courseValues.push(
        { department_id: cs.department_id, course_code: "COS101", course_name: "Introduction to Computing", level: 1, semester: "First" },
        { department_id: cs.department_id, course_code: "COS102", course_name: "Programming Fundamentals", level: 1, semester: "Second" },
        { department_id: cs.department_id, course_code: "COS201", course_name: "Data Structures and Algorithms", level: 2, semester: "First" },
        { department_id: cs.department_id, course_code: "COS202", course_name: "Discrete Mathematics", level: 2, semester: "Second" },
        { department_id: cs.department_id, course_code: "COS301", course_name: "Operating Systems", level: 3, semester: "First" },
        { department_id: cs.department_id, course_code: "COS302", course_name: "Database Systems", level: 3, semester: "Second" },
        { department_id: cs.department_id, course_code: "COS401", course_name: "Software Engineering", level: 4, semester: "First" },
        { department_id: cs.department_id, course_code: "COS402", course_name: "Computer Networks", level: 4, semester: "Second" },
        { department_id: cs.department_id, course_code: "COS403", course_name: "Artificial Intelligence", level: 4, semester: "First" },
      );
    }

    const ee = deptByName(uniLagos.school_id, "Electrical Engineering");
    if (ee) {
      courseValues.push(
        { department_id: ee.department_id, course_code: "EEG101", course_name: "Circuit Theory I", level: 1, semester: "First" },
        { department_id: ee.department_id, course_code: "EEG201", course_name: "Electronics I", level: 2, semester: "First" },
        { department_id: ee.department_id, course_code: "EEG301", course_name: "Power Systems", level: 3, semester: "First" },
        { department_id: ee.department_id, course_code: "EEG401", course_name: "Control Systems", level: 4, semester: "First" },
      );
    }
  }

  if (covenantUni) {
    const cs = deptByName(covenantUni.school_id, "Computer Science");
    if (cs) {
      courseValues.push(
        { department_id: cs.department_id, course_code: "CSC111", course_name: "Introduction to Computer Science", level: 1, semester: "First" },
        { department_id: cs.department_id, course_code: "CSC112", course_name: "Fundamentals of Programming", level: 1, semester: "Second" },
        { department_id: cs.department_id, course_code: "CSC211", course_name: "Object-Oriented Programming", level: 2, semester: "First" },
        { department_id: cs.department_id, course_code: "CSC311", course_name: "Software Design Patterns", level: 3, semester: "First" },
        { department_id: cs.department_id, course_code: "CSC312", course_name: "Web Application Development", level: 3, semester: "Second" },
        { department_id: cs.department_id, course_code: "CSC411", course_name: "Machine Learning", level: 4, semester: "First" },
      );
    }

    const it = deptByName(covenantUni.school_id, "Information Technology");
    if (it) {
      courseValues.push(
        { department_id: it.department_id, course_code: "IFT111", course_name: "IT Fundamentals", level: 1, semester: "First" },
        { department_id: it.department_id, course_code: "IFT211", course_name: "Systems Analysis and Design", level: 2, semester: "First" },
        { department_id: it.department_id, course_code: "IFT311", course_name: "Network Administration", level: 3, semester: "First" },
      );
    }
  }

  const courseRows = courseValues.length
    ? await db
        .insert(schema.coursesTable)
        .values(courseValues)
        .onConflictDoNothing()
        .returning()
    : [];

  console.log(`  ✓ ${courseRows.length} courses inserted`);
  console.log("✅ Seeding complete.");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
