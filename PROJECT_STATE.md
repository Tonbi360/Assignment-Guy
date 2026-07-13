# Assignment Guy — Project State

> **Last updated:** Milestone 1 complete (Supabase integration wired, all checks passing)
> **Version:** 1.1.0

---

## Current Milestone

**Milestone 1 — Authentication, Onboarding & Navigation Shell — ✅ COMPLETE**

---

## Completed Features

### Navigation Architecture
- Root layout with auth-based route guard (loading → nothing; pendingEmailConfirmation → verify-email; no user → welcome; no onboarding → school; ready → tabs)
- `(auth)` group: Welcome, Login, Register, Verify Email screens
- `(onboarding)` group: School, Department, Level, Courses screens (4-step flow)
- `(tabs)` group: Home, Courses, Notifications, Profile (4-tab bottom navigation)
- Liquid glass NativeTabs on iOS 26+; BlurView classic tabs on Android/older iOS

### Design System
- Full Assignment Guy color palette (Design Tokens doc) applied to `constants/colors.ts`
- 8px spacing grid exported as `SPACING` constants
- Border radius constants: 8 (small), 12 (inputs/buttons), 16 (cards), 24 (dialogs)
- Reusable components: `Button`, `Input`, `Card`, `Badge`, `EmptyState`, `LoadingSkeleton`
- Inter font (400/500/600/700) loaded and applied throughout

### Authentication — Supabase (live)
- `lib/supabase.ts` — Supabase client using `expo-secure-store` with chunked adapter (2 KB chunk limit workaround); `EXPO_PUBLIC_` vars only, never SERVICE_ROLE_KEY
- `AuthContext` provides: `user`, `loading`, `isAuthenticated`, `pendingEmailConfirmation`, `signIn`, `signUp`, `signOut`, `checkEmailConfirmed`, `resendConfirmationEmail`, `cancelEmailConfirmation`, `updateOnboarding`, `completeOnboarding`
- `signIn` → `supabase.auth.signInWithPassword`
- `signUp` → `supabase.auth.signUp`; if session is null (email confirmation required), sets `pendingEmailConfirmation` and routes to verify-email screen
- `checkEmailConfirmed` → polls `supabase.auth.getSession()`; on confirmed session, clears pending state and proceeds
- `resendConfirmationEmail` → `supabase.auth.resend`
- `TOKEN_REFRESHED` events handled silently (no re-hydration that would reset mid-onboarding state)
- `completeOnboarding` → calls `PATCH /api/v1/users/me` with Supabase JWT

### Email Confirmation Flow
- `app/(auth)/verify-email.tsx` — "Check your inbox" screen with step list, "I've confirmed my email" button, resend button (with cooldown), and cancel back to welcome

### Onboarding Flow
- School selection: fetches from `/api/v1/schools` with search
- Department selection: fetches from `/api/v1/schools/:id/departments`
- Level selection: static list (Year 1–4, Postgraduate, Other)
- Course selection: fetches from `/api/v1/departments/:id/courses`, multi-select
- All screens have loading skeletons, error states with retry, and proper empty states

### Backend — Database Schema
Tables in PostgreSQL (Drizzle ORM, pushed):
- `schools` (school_id, school_name, country, created_at)
- `departments` (department_id, school_id→schools, department_name)
- `courses` (course_id, department_id→departments, course_code, course_name, level, semester)
- `user_profiles` (user_id PK = Supabase auth.users.id, email, display_name, profile_photo, school_id, department_id, level, contribution_score, role, has_completed_onboarding, timestamps)
- `user_courses` (user_id, course_id, joined_at) — composite PK

### Backend — API Routes
All routes run on the `api-server` artifact:
- `GET /api/v1/schools?search=` — list/search schools (public)
- `GET /api/v1/schools/:schoolId/departments` — list departments for school (public)
- `GET /api/v1/departments/:departmentId/courses?level=` — list courses (public)
- `GET /api/v1/users/me` — fetch current user's full profile (protected; joins user_profiles + schools + departments + user_courses + courses; 404 if no profile yet)
- `PATCH /api/v1/users/me` — upsert profile + replace course list atomically (protected)

### Backend — Auth Middleware
- `src/lib/supabase.ts` — admin Supabase client using `SUPABASE_SERVICE_ROLE_KEY`; throws on missing env vars at startup; never shipped to mobile bundle
- `src/middleware/auth.ts` — `requireAuth` Express middleware; extracts Bearer token, verifies via `supabaseAdmin.auth.getUser(token)`, attaches `req.userId`; returns `401 INVALID_TOKEN` on failure

### OpenAPI + Codegen
- Spec version 0.2.0 — includes schools, departments, courses, and users/me endpoints
- `bearerAuth` security scheme defined
- React Query hooks generated: `useListSchools`, `useListDepartmentsBySchool`, `useListCoursesByDepartment`, `useGetMyProfile`, `useUpdateMyProfile`
- Zod schemas generated for all endpoints

### Metro / Expo Configuration
- `metro.config.js` — blockList regex excludes `expo-secure-store_tmp_*` pnpm temp directories (prevents ENOENT crash); `watchFolders` set to monorepo root
- `expo-secure-store` pinned to `15.0.8` (SDK 54 compatible)

---

## Build & Runtime Status

| Check | Status |
|---|---|
| `lib/db` TypeScript (`typecheck:libs`) | ✅ Clean — 0 errors |
| `api-server` TypeScript (`tsc --noEmit`) | ✅ Clean — 0 errors |
| OpenAPI codegen | ✅ Clean — orval + typecheck pass |
| API server runtime | ✅ Running — port 8080 |
| Expo Metro bundler | ✅ Running — no crashes |
| JWT middleware (live) | ✅ Invalid token → 401 INVALID_TOKEN |
| `GET /api/v1/users/me` (live) | ✅ Valid JWT + no profile → 404 (expected) |
| `GET /api/v1/schools` (live) | ✅ 200 OK |

---

## Known Bugs

_None in Milestone 1._

---

## Suggestions (Out of Scope for Version 1)

These ideas arose during Milestone 1 development. Per project rules, they are recorded here and NOT implemented.

- **"Course Guardian" role**: Trusted contributors who moderate a specific course's content. Mentioned in V2 Roadmap.
- **School request form**: A way for students to request their school be added to the platform when it's not found in the list.
- **Onboarding progress persistence**: If the user closes the app mid-onboarding, restore their progress. Currently they restart from School.
- **Quick re-onboarding**: Allow changing school/department/level after initial setup without a full sign-out.

---

## Notes

- `expo-secure-store@57.0.0` is an orphan in the pnpm store (was installed early, replaced by 15.0.8). It does not affect the app. The metro.config.js blockList prevents Metro from stumbling on its temp directories.
- Supabase email confirmation behaviour depends on the Supabase project settings. If auto-confirm is enabled, `signUp` returns a session immediately and the verify-email screen is never shown. If confirmation is required, the full verify-email flow activates.
- `drizzle-zod` was removed from all schema files. The `drizzle-orm` `$inferSelect` type helper is sufficient for all current use cases. Add `drizzle-zod` back only when route-level Zod validation is needed and after upgrading to Zod v4 (or pinning drizzle-zod to a v3-compatible version).

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

_Start Milestone 2 only after final Milestone 1 verification is confirmed._
