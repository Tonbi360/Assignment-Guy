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
