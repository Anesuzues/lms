# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (Vite)
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No test runner is configured. Playwright is installed as a dev dependency but no test files exist yet.

## Environment Variables

Create a `.env` file at the project root with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The Supabase client (`src/lib/supabase.ts`) throws on startup if either is missing.

## Architecture

**NobzLearn** is a React + TypeScript LMS (Learning Management System) built with Vite, Tailwind CSS, and shadcn/ui. The backend is entirely Supabase (auth + Postgres + RLS).

### Routing (`src/App.tsx`)

All pages are lazy-loaded. Key routes:

| Path | Page | Notes |
|------|------|-------|
| `/` | `Index` | Marketing landing page |
| `/login` | `Login` | Auth (email/password + Google OAuth) |
| `/courses` | `Courses` | Course catalogue |
| `/courses/:id` | `CourseDetail` | Enroll & prerequisites gate |
| `/dashboard` | `Dashboard` | Student progress, XP, streak |
| `/learn/:id` | `LessonViewer` | Main learning experience |
| `/admin` | `AdminDashboard` | Admin-only |
| `/verify/:id` | `VerifyCertificate` | Public certificate lookup |

### Auth (`src/contexts/AuthContext.tsx`)

`AuthProvider` wraps the whole app. It:
- Sets user from Supabase session on mount, then enriches with DB profile + enrollments in the background (non-blocking)
- Manages a 28-minute idle timeout with a 2-minute countdown warning (`SessionTimeoutModal`)
- Exposes `useAuth()` hook — the single source of truth for `user`, `isAuthenticated`, `enrolledCourses`

Roles: `student` | `instructor` | `admin`. Role is stored in `profiles.role`.

### Data Layer (`src/services/`)

All Supabase queries are in service files — no inline queries in components:

- **`courseService.ts`** — courses, lessons, enrollments, `user_progress`, quiz pass-check
- **`quizService.ts`** — quiz questions, submitting attempts, fetching best scores. Pass mark is `PASS_MARK = 80%`
- **`certificateService.ts`** — save + retrieve certificate records
- **`profileService.ts`** — XP, streak (gamification), level calculation, onboarding flag
- **`adminService.ts`** — student detail, role management, bulk operations

### Programme Structure (`src/lib/programmeConfig.ts`)

Courses are grouped into 4 certificates (defined as a static config, not in the DB):

1. **Cert 1** – Certified AI Digital Professional (Beginner)
2. **Cert 2** – Certified Junior Software Developer (Intermediate)
3. **Cert 3** – Certified AI-Enhanced Developer (Intermediate)
4. **Cert 4** – Certified AI Application Developer (Advanced)

`getCertForCourse(title)` and `isFinalExam(title)` use title-string matching to map a DB course to its certificate. Prerequisites are enforced by checking if the student has passed the quiz for all non-final-exam courses in the same certificate before unlocking the final exam.

### Database Schema

Core tables (see `supabase-schema.sql`):
- `profiles` — extends `auth.users`, stores role/XP/streak/onboarded
- `courses` / `modules` / `lessons` — content hierarchy
- `enrollments` — user ↔ course, with `progress` (0–100) and `completed_at`
- `user_progress` — per-lesson completion + time spent
- `quiz_questions` / `quiz_attempts` — per-module quizzes, scoped by `course_id` + `module_id`
- `certificates` — issued certificate records (UUID as verifiable ID)

Module IDs are `TEXT` (not UUID), allowing slug-style IDs. Lesson IDs are UUID.

### Gamification (`src/services/profileService.ts`)

XP and streaks are stored in `profiles`. `LEVELS` maps XP thresholds to level names (Newcomer → Graduate). `updateStreakAndXP` is called when a lesson is marked complete. Users created before 2026-06-05 are treated as already onboarded to skip the welcome modal.

### Certificate Generation (`src/lib/generateCertificate.ts`)

Certificates are generated client-side as PDFs using `jspdf`. A record is saved to Supabase via `certificateService.ts`. The verifiable URL is `/verify/:uuid`.
