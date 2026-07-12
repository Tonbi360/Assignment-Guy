# Assignment Guy — Project State

> **Last updated:** Milestone 1 complete
> **Version:** 1.0.1

---

## Current Milestone

**Milestone 1 — Authentication, Onboarding & Navigation Shell**

---

## Completed Features

### Navigation Architecture
- Root layout with auth-based route guard (no user → auth, no onboarding → onboarding, ready → tabs)
- `(auth)` group: Welcome, Login, Register screens
- `(onboarding)` group: School, Department, Level, Courses screens (4-step flow)
- `(tabs)` group: Home, Courses, Notifications, Profile (4-tab bottom navigation)
- Liquid glass NativeTabs on iOS 26+; BlurView classic tabs on Android/older iOS

### Design System
- Full Assignment Guy color palette (Design Tokens doc) applied to `constants/colors.ts`
- 8px spacing grid exported as `SPACING` constants
- Border radius constants: 8 (small), 12 (inputs/buttons), 16 (cards), 24 (dialogs)
- Reusable components: `Button`, `Input`, `Card`, `Badge`, `EmptyState`, `LoadingSkeleton`
- Inter font (400/500/600/700) loaded and applied throughout

### Auth Context (Pre-Supabase)
- `AuthContext` provides: `user`, `loading`, `isAuthenticated`, `signIn`, `signUp`, `signOut`
- `updateOnboarding` and `completeOnboarding` persist to AsyncStorage
- Interface is Supabase-ready: replacing AsyncStorage calls with Supabase does not change the context API

### Onboarding Flow
- School selection: fetches from `/api/v1/schools` with search
- Department selection: fetches from `/api/v1/schools/:id/departments`
- Level selection: static list (Year 1–4, Postgraduate, Other)
- Course selection: fetches from `/api/v1/departments/:id/courses`, multi-select
- All screens have loading skeletons, error states with retry, and proper empty states

### Backend — Database Schema
Tables created (PostgreSQL via Drizzle ORM):
- `schools` (school_id, school_name, country, created_at)
- `departments` (department_id, school_id→schools, department_name)
- `courses` (course_id, department_id→departments, course_code, course_name, level, semester)
- `user_profiles` (user_id, email, display_name, school_id, department_id, level, contribution_score, role, has_completed_onboarding, timestamps)
- `user_courses` (user_id, course_id, joined_at) — composite PK

### Backend — API Routes
- `GET /api/v1/schools?search=` — list all schools (empty array if none)
- `GET /api/v1/schools/:schoolId/departments` — list departments for school
- `GET /api/v1/departments/:departmentId/courses?level=` — list courses

### OpenAPI + Codegen
- OpenAPI spec updated with schools, departments, courses endpoints
- React Query hooks generated: `useListSchools`, `useListDepartmentsBySchool`, `useListCoursesByDepartment`

---

## Pending Work

### Milestone 1 — Supabase Integration
- Supabase credentials not yet provided
- When credentials are provided:
  1. Install `@supabase/supabase-js` and `expo-secure-store`
  2. Replace `AuthContext` `signIn`/`signUp`/`signOut` with Supabase calls
  3. Add PATCH `/api/v1/users/me` to sync onboarding data to backend
  4. Add Supabase JWT middleware to protect backend routes
  5. Run `pnpm --filter @workspace/db run push` after user_profiles table is confirmed
- **Auth is structurally complete — only the Supabase wiring is missing**

### Milestone 2 — Assignment Feed & Details
- Assignment Feed with cards (title, course, due date, status, discussion count)
- Assignment Detail page (question, attachments, context, discussion, status, AI Help, Emergency Answer)
- Search and filter
- Assignment lifecycle (Active → Closed → Archived → Deleted)

### Milestone 3 — Uploads, Attachments, Context
- Assignment upload flow (text, image, PDF)
- Context sections on Assignment Detail
- File storage integration

### Milestone 4 — Discussion, Notifications, Status
- In-app discussion threads per assignment
- Push notifications (FCM via Expo Notifications)
- Assignment status tracking (Not Started / In Progress / Finished / Submitted)

### Milestone 5 — AI Help, Emergency Answer, Reporting, Feedback
- AI Help: clipboard-copy formatted context + external AI launcher
- Emergency Answer: eligibility gating (backend-controlled)
- Reporting system
- Feedback system

### Milestone 6 — Polish, Performance, Deployment
- Performance optimization
- Final UI polish and accessibility pass
- Production deployment

---

## Known Bugs

_None discovered in Milestone 1 yet. Will be updated during testing._

---

## Suggestions (Out of Scope for Version 1)

These ideas arose during Milestone 1 development. Per project rules, they are recorded here and NOT implemented.

- **"Course Guardian" role**: Trusted contributors who moderate a specific course's content. Mentioned in V2 Roadmap.
- **School request form**: A way for students to request their school be added to the platform when it's not found in the list.
- **Onboarding progress persistence**: If the user closes the app mid-onboarding, restore their progress. Currently they restart from School.
- **Quick re-onboarding**: Allow changing school/department/level after initial setup without a full sign-out.

---

## Next Milestone

**Milestone 2 — Assignment Feed & Assignment Details**

Primary goals:
1. Complete DB schema for assignments (assignments, assignment_attachments, assignment_context)
2. OpenAPI endpoints for assignment CRUD
3. Assignment Feed screen with cards and empty state
4. Assignment Detail page
5. Floating Action Button navigates to upload (placeholder form)
6. Verification states (Unverified, Community Confirmed, Trusted Contributor Verified)

_Start Milestone 2 after Supabase credentials are confirmed and Milestone 1 auth is wired up._
