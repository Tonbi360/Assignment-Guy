/**
 * Shared TypeScript types for Assignment Guy
 * These mirror the database schema defined in lib/db/src/schema/
 */

export interface School {
  school_id: string;
  school_name: string;
  country?: string | null;
  created_at: string;
}

export interface Department {
  department_id: string;
  school_id: string;
  department_name: string;
}

export interface Course {
  course_id: string;
  department_id: string;
  course_code: string;
  course_name: string;
  level?: number | null;
  semester?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePhoto?: string | null;
  school?: School | null;
  department?: Department | null;
  level?: number | null;
  courses: Course[];
  contributionScore: number;
  role: 'student' | 'contributor' | 'trusted_contributor' | 'admin';
  hasCompletedOnboarding: boolean;
}

// Academic level labels
export const LEVEL_LABELS: Record<number, string> = {
  1: 'Year 1',
  2: 'Year 2',
  3: 'Year 3',
  4: 'Year 4',
  5: 'Postgraduate',
  0: 'Other',
};

// ─── Assignment types ─────────────────────────────────────────────────────────

export type VerificationStatus =
  | 'unverified'
  | 'community_confirmed'
  | 'trusted_contributor_verified';

export type AssignmentStatus = 'active' | 'closed' | 'archived';

export type AssignmentType =
  | 'assignment'
  | 'exam'
  | 'quiz'
  | 'lab'
  | 'project';

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  assignment: 'Assignment',
  exam: 'Exam',
  quiz: 'Quiz',
  lab: 'Lab',
  project: 'Project',
};

export interface AssignmentAttachment {
  attachment_id: string;
  assignment_id: string;
  attachment_type: 'image' | 'pdf' | 'text';
  url: string | null;
  filename: string | null;
  file_size: number | null;
  sort_order: number;
}

export interface AssignmentContextSection {
  context_id: string;
  assignment_id: string;
  section_title: string;
  content: string;
  sort_order: number;
}

/** Summary shape returned by GET /assignments (list view). */
export interface AssignmentSummary {
  assignment_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  verification_status: VerificationStatus;
  discussion_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  course_id: string;
  course_name: string;
  course_code: string;
  uploader_display_name: string;
}

/** Full shape returned by GET /assignments/:id (detail view). */
export interface AssignmentDetail extends AssignmentSummary {
  attachments: AssignmentAttachment[];
  context: AssignmentContextSection[];
}

// ─── API response wrapper types ───────────────────────────────────────────────

// API response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
}
