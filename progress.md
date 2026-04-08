# TaskFlow — Claude Progress Log

> **Purpose:** This file is the source of truth for Claude Code across sessions.
> When a new session starts, Claude must read this file first to understand what
> has been built, what was last worked on, and what the current state is.
> Update the "Last worked on" and "Pending / Next steps" sections after every session.

---

## Project Overview

**TaskFlow** — A Next.js task management SaaS with workspaces, projects, kanban boards,
team collaboration, and a subscription/upgrade system.

| Item | Value |
|---|---|
| Framework | Next.js 16.2.0 (App Router) — **read `node_modules/next/dist/docs/` before writing any Next.js code** |
| Styling | Tailwind CSS v4.2.2 via `@tailwindcss/postcss` — dark mode uses `@custom-variant`, NOT `tailwind.config.ts` |
| Auth | Clerk (`@clerk/nextjs`) — user identity, image, session |
| Database | PostgreSQL via Drizzle ORM (`lib/db/schema.ts`, `lib/db/index.ts`) |
| Theme | `next-themes` — class-based, `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}` |
| Fonts | Inter Tight (body), Raleway (headings) |
| Payments | Mock payment modal (`PaymentModal.tsx`) — Card / UPI / Net Banking, plan saved in DB |
| Email | Resend (`lib/email.ts`) — non-blocking, used for invitations |
| Toasts | Sonner — custom styled in `globals.css` |

---

## Architecture

```
app/
  page.tsx                    — Landing page (Navbar, Hero, Features, How it works, Pricing, Footer)
  (dashboard)/
    layout.tsx                — Shared shell: AppSidebar + CommandPalette
    dashboard/page.tsx        — Main dashboard (uses DashboardClient)
    my-tasks/page.tsx         — Tasks assigned to current user
    activity/page.tsx         — Workspace activity feed
    analytics/page.tsx        — Charts & stats (uses AnalyticsClient)
    settings/page.tsx         — User & workspace settings (uses SettingsClient)
    upgrade/page.tsx          — Plan upgrade page (uses UpgradeClient)
    onboarding/page.tsx       — Post-signup onboarding wizard
    projects/[id]/page.tsx    — Project detail with kanban / list / calendar views

components/features/          — All major UI features (client components)
components/ui/                — Primitives: Button, Avatar, ThemeToggle, LogoMark, NavLinks, etc.
lib/
  db/schema.ts                — Drizzle schema (users, workspaces, projects, tasks, comments, etc.)
  actions.ts                  — Server actions (create/update/delete tasks, workspaces, names)
  session.ts                  — getSession / requireAuth
  notify.ts                   — In-app notification helpers
  notification-actions.ts     — Due date reminder checks
  invite-actions.ts           — Team invitation server actions
  comment-actions.ts          — Comment + reply server actions
  onboarding-actions.ts       — Mark onboarding complete
  email.ts                    — Resend email wrapper
  activity.ts                 — Activity log helpers
  analytics.ts                — Analytics data aggregation
```

### DB Tables (Drizzle schema)
`users` · `workspaces` · `workspaceMembers` · `projects` · `tasks` · `activities`
· `comments` · `notifications` · `notificationPreferences` · `invitations`

### Plans
`free` | `pro` | `enterprise` — stored in `users.plan`
Pro gates: Activity feed, Analytics, AI tasks button, some settings

---

## Key Technical Rules (must follow every session)

1. **Tailwind v4 dark mode** — `@custom-variant dark (&:where(.dark, .dark *));` is in
   `app/globals.css`. Never use `darkMode: "class"` in `tailwind.config.ts` — it is ignored.
   Always use `dark:` utility variants for theme-aware styles.

2. **Never hardcode dark-only colors** — any `bg-[#0d0d0d]`, `bg-indigo-950`, `text-[#555]`
   etc. must have a light mode pair: `bg-white dark:bg-[#0d0d0d]`, etc.

3. **Charts (Recharts)** — colors are inline SVG attributes, not CSS. Use `useTheme()` from
   `next-themes` to get `resolvedTheme` and pass theme-aware values at runtime.

4. **Server components can import client components** — ThemeToggle, NavLinks, etc. are fine
   to import from async server components like `app/page.tsx` Navbar.

5. **next-themes hydration** — always guard theme-dependent renders with a `mounted` state
   (`useEffect(() => setMounted(true), [])`) to avoid hydration mismatch.

6. **Next.js 16.2.0** — may have breaking changes vs training data. Read
   `node_modules/next/dist/docs/` before writing any routing, middleware, or config code.

---

## What Has Been Built (chronological)

### Core App
- [x] Clerk authentication (login / register / session)
- [x] Workspace auto-creation on signup
- [x] Project CRUD (create, list, delete)
- [x] Task CRUD with status, priority, due date, assignee
- [x] Kanban board with drag-and-drop (`TaskBoard.tsx`)
- [x] Task detail dialog with description, comments, AI improve button stub
- [x] List view and calendar view in project pages
- [x] My Tasks page (tasks assigned to current user, grouped by status)
- [x] Activity feed (workspace-level action log)
- [x] Analytics page (bar, pie, line charts via Recharts)
- [x] Settings page (display name, workspace name, notification prefs, plan info, danger zone)
- [x] Command palette (⌘K) available on all dashboard pages
- [x] Upgrade / pricing page with mock payment modal (Card / UPI / Net Banking)

### Team Features
- [x] Team invitation system — invite by email, Resend email, auto-join on accept
- [x] `@mention` support in comments with in-app notifications
- [x] Threaded comment replies with markdown support
- [x] Notification bell with unread count badge
- [x] Notification preferences in Settings (per-event toggles)
- [x] Due date reminders (checked on dashboard load)

### Onboarding
- [x] Onboarding wizard (triggered for new users via `onboardingCompleted` DB flag)
- [x] Onboarding tour overlay (step-by-step UI highlights)

### UI / Theme
- [x] Inter Tight + Raleway font stack
- [x] Full dark mode (default)
- [x] Full light mode — fixed Tailwind v4 `@custom-variant` root cause
- [x] Realistic light mode color system (backgrounds, text, borders, inputs, badges, charts)
- [x] Landing page — theme-aware product mockup in Hero section
- [x] **ThemeToggle button** — sun/moon icon button, amber glow in dark / indigo tint in light,
      spin-on-click animation. Added to all 8 page topbars + landing page navbar.
      Lag fix: transitions suppressed during theme switch via temporary `<style>` tag + double rAF
- [x] ProfileDropdown (change name, sign out)
- [x] ProGate component — locks Pro features with tooltip for free users
- [x] AppSidebar — collapsible, with project list, nav items, upgrade CTA
- [x] Sonner toasts — custom styled for light + dark mode
- [x] **8 Style Themes** — Midnight, Obsidian, Nord, Ember (dark) + Cloud, Parchment, Arctic, Blossom (light).
      `context/ThemeStyleContext.tsx` manages `data-theme` attribute + CSS var injection. `ThemePicker.tsx`
      visual 2×4 grid with mini kanban previews. Paired dark↔light toggle. Lora serif font for Parchment.
      `--tf-*` CSS custom property token system: bg-card, bg-panel, bg-overlay, bg-dropdown, bg-input,
      bg-hover, bg-immersive, border, border-subtle, accent, accent-muted, accent-text, sidebar-bg,
      sidebar-border, text-primary, text-secondary, text-tertiary. All 8 themes define every token.
      **Full coverage**: every hardcoded `dark:bg-[#...]`, `dark:text-[#...]`, `dark:border-[#...]` across
      all 48+ files replaced with CSS var tokens — ~1,200 total replacements across 3 sessions.

### Real-time Collaboration
- [x] **Presence avatars on project board** — stacked circular avatars in the topbar showing
      who is currently viewing the same board. Pulsing green dot + "N online" label.
      Each user gets a deterministic color from their userId. Your own avatar shows an indigo ring.
      Heartbeat every 20s via `POST /api/presence/[projectId]`; stale entries expire at 45s.
      `sendBeacon` fires on navigate-away for instant cleanup. Hidden when you're alone.

### Differentiation Features
- [x] **Workload Balancer** — "People" tab on the dashboard alongside the Board tab. Each member
      row shows: avatar with deterministic color, load badge (Free/Busy/Overloaded), segmented bar
      normalized to the most-loaded member (indigo=InProgress, amber=InReview, slate=Todo),
      expandable task list with priority dot + status chip. Hover any task to reassign — optimistic
      update with `reassignTask()` server action + TASK_ASSIGNED notification. Unassigned row at bottom.

- [x] **Focus Mode** — full-screen Pomodoro overlay triggered by hovering a task card and clicking ⊕.
      25-min work / 5-min break cycle with circular SVG progress ring (color shifts indigo→amber→red
      as time runs low). Space to start/pause, Esc to exit. Session notes scratchpad. "Mark as done"
      button closes the session and updates task status. Phase auto-advances with toast on timer end.
      Sessions persisted to DB (`focus_sessions` table): duration, completed flag, notes.
      Auto-saves on exit if > 10s elapsed. Manual "Save now" button mid-session.
      Session history shown in TaskDetailDialog with total focused time summary.

- [x] **Task Assignment from Board** — assign tasks directly from kanban cards without opening the detail dialog.
- [x] **Subtasks / Checklist** — checklist inside TaskDetailDialog; progress bar (X/Y + %); optimistic add/toggle/delete/rename; needs `subtasks` table in Supabase (see SQL below)
- [x] **Instant dialog open** — batch pre-fetch subtasks + labels at board mount; dialog opens with zero loading skeletons
- [x] **Bulk Actions** — multi-select cards via checkbox, floating BulkActionBar: move status / assign / delete with optimistic updates
- [x] **Subtask progress chip on cards** — mini progress bar + done/total count on kanban cards that have subtasks
- [x] **Inline task creation** — `+` button in column headers → inline input → optimistic temp card → server persist
- [x] **Gantt / Timeline view** — full pixel-per-day Gantt in project Timeline tab; month headers, day row, status-colored bars, today marker, weekend shading
- [x] **Global search** — ⌘K command palette now does live full-text search across tasks + projects with debounce; `GET /api/search?q=` endpoint
      `AssigneeButton` component: avatar (initials + deterministic color) if assigned, dashed `+` if not.
      Click opens an upward dropdown with all workspace members + unassign option + checkmark on current assignee.
      Wired into `TaskBoard.tsx` (dashboard board) with optimistic update + `reassignTask` server action.
      Wired into `ProjectClient.tsx` `BoardView` with local state optimistic update.
      Members fetched in `app/(dashboard)/projects/[id]/page.tsx` and passed down.

- [x] **Task Decay Indicators** — tasks untouched for 3+ days surface a visual decay signal.
      Level 1 (3–7d): subtle amber border + `🕐 Xd` badge. Level 2 (7–14d): stronger amber.
      Level 3 (14d+): orange border + slow pulse animation. DONE/CANCELLED excluded.
      Column headers show a stale count badge when any tasks in that column are decaying.
      Logic lives in `lib/decay.ts` (getDecayLevel, getDecayDays, Tailwind class maps).

---

## File Change Reference (most recently touched files)

| File | Last change |
|---|---|
| `components/ui/ThemeToggle.tsx` | **Created** — minimalist sun/moon toggle with spin animation |
| `app/page.tsx` | ThemeToggle added to Navbar; Hero mockup made theme-aware |
| `components/features/DashboardClient.tsx` | ThemeToggle added between NotificationBell and ProfileDropdown |
| `app/(dashboard)/my-tasks/page.tsx` | ThemeToggle added to topbar |
| `app/(dashboard)/activity/page.tsx` | ThemeToggle added to topbar |
| `components/features/SettingsClient.tsx` | ThemeToggle added to topbar |
| `components/features/AnalyticsClient.tsx` | ThemeToggle added to topbar |
| `components/features/UpgradeClient.tsx` | ThemeToggle added to topbar |
| `components/features/ProjectClient.tsx` | ThemeToggle + PresenceAvatars added to topbar; `currentUser` prop added |
| `app/(dashboard)/projects/[id]/page.tsx` | Pass `currentUser` (userId, name) to ProjectClient |
| `app/globals.css` | `@custom-variant dark` + refined CSS variables for light mode depth |
| `components/ui/ThemeToggle.tsx` | Lag fix: suppress transitions during switch via temp `<style>` + double rAF; canonical Tailwind classes |
| `lib/presenceStore.ts` | **Created** — in-memory presence store (Map + 45s TTL) |
| `app/api/presence/[projectId]/route.ts` | **Created** — POST heartbeat / DELETE leave |
| `hooks/usePresence.ts` | **Created** — heartbeat hook with sendBeacon cleanup |
| `components/features/PresenceAvatars.tsx` | **Created** — stacked avatars UI component |
| `components/features/WorkloadBalancer.tsx` | **Created** — team workload view with reassign |
| `components/features/DashboardClient.tsx` | Board/People tab toggle; WorkloadBalancer wired in |
| `lib/actions.ts` | Added `reassignTask()` server action |
| `components/features/FocusMode.tsx` | Elapsed tracking + auto-save on exit + "Save now" button |
| `components/features/TaskDetailDialog.tsx` | Added FocusSessionHistory panel |
| `app/api/focus-sessions/[taskId]/route.ts` | **Created** — GET sessions for a task |
| `lib/db/schema.ts` | Added `focusSessions` table (taskId, userId, duration, completed, notes) |
| `lib/decay.ts` | **Created** — getDecayLevel / getDecayDays / Tailwind class maps |
| `components/features/TaskBoard.tsx` | Decay border + stale badge on cards; stale count in column headers |
| `components/features/TaskBoardWrapper.tsx` | Added `updatedAt` to task type |
| `components/features/DashboardClient.tsx` | Added `updatedAt` to task type |
| `app/(dashboard)/dashboard/page.tsx` | Added `updatedAt` to tasks SELECT |
| `app/(dashboard)/projects/[id]/page.tsx` | Added `updatedAt` + members query; pass `members` to `ProjectClient` |
| `app/globals.css` | Added `animate-pulse-slow` keyframe for level-3 decay |
| `components/features/AssigneeButton.tsx` | **Created** — shared task assignee dropdown for kanban cards |
| `components/features/TaskBoard.tsx` | Wired `AssigneeButton` + `handleAssign` optimistic update |
| `components/features/ProjectClient.tsx` | Wired `AssigneeButton` into `BoardView`; added `members` prop + local state |
| `app/(dashboard)/dashboard/page.tsx` | Removed `searchParams` prop — server component no longer re-renders on URL param changes |
| `components/features/DashboardClient.tsx` | Added `useSearchParams()` for tab + invited; added inline My Tasks view (instant, client-side filter) |
| `components/features/AppSidebar.tsx` | My Tasks href changed to `/dashboard?tab=my-tasks`; `isNavActive()` helper uses `useSearchParams()` |
| `lib/db/schema.ts` | Added `subtasks` table (taskId, title, completed, position) |
| `lib/subtask-actions.ts` | **Created** — server actions: addSubtask, toggleSubtask, deleteSubtask, updateSubtaskTitle |
| `app/api/subtasks/[taskId]/route.ts` | **Created** — GET endpoint returns subtasks ordered by position/createdAt |
| `components/features/SubtaskList.tsx` | **Created** — checklist UI with progress bar, optimistic toggle/add/delete/rename |
| `components/features/TaskDetailDialog.tsx` | Added `<SubtaskList>` between description and focus sessions |
| `app/api/subtasks/batch/route.ts` | **Created** — batch GET endpoint returns subtask map keyed by taskId |
| `app/api/labels/workspace/[workspaceId]/route.ts` | **Created** — GET workspace labels |
| `app/api/labels/tasks/route.ts` | **Created** — GET task-label map for multiple task IDs |
| `components/features/SubtaskList.tsx` | Added `initialItems?` prop to skip fetch when data pre-loaded |
| `components/features/LabelPicker.tsx` | Added `initialWorkspaceLabels?` + `initialAppliedIds?` props |
| `components/features/TaskDetailDialog.tsx` | Added `initialSubtasks`, `initialWorkspaceLabels`, `initialAppliedLabelIds` props |
| `components/features/TaskBoard.tsx` | Batch pre-fetch at mount; bulk selection state + BulkActionBar; subtask progress chip; InlineTaskForm; checkbox alignment fix; drag listener moved to title `<p>` |
| `components/features/BulkActionBar.tsx` | **Created** — floating action bar for bulk move/assign/delete |
| `lib/actions.ts` | Added `bulkUpdateStatus`, `bulkAssign`, `bulkDelete` server actions |
| `components/features/ProjectClient.tsx` | `TimelineView` rebuilt as full Gantt chart (pixel-per-day, month headers, status bars, today marker) |
| `app/api/search/route.ts` | **Created** — GET `/api/search?q=` full-text search across tasks + projects |
| `components/features/CommandPalette.tsx` | Debounced live search with Tasks/Projects result groups |
| `app/layout.tsx` | Added `Inter` + `GeistSans` fonts; variables `--font-inter`, `--font-geist-sans` |
| `app/globals.css` | Marquee + float-orb keyframes; `.font-bricolage/geist/inter-landing` classes |
| `components/landing/MagneticButton.tsx` | **Created** — GSAP magnetic hover + elastic spring-back |
| `components/landing/LandingHero.tsx` | **Created** — GSAP timeline, floating orbs, magnetic CTAs, app mockup |
| `components/landing/LandingMarquee.tsx` | **Created** — infinite CSS marquee strip |
| `components/landing/LandingFeatures.tsx` | **Created** — bento grid + ScrollTrigger + 3D mouse-tilt |
| `components/landing/LandingHowItWorks.tsx` | **Created** — GSAP ScrollTrigger step reveals |
| `components/landing/LandingTestimonials.tsx` | **Created** — dual-row infinite marquee testimonials |
| `components/landing/LandingCTA.tsx` | **Created** — magnetic CTA + gradient card |
| `app/page.tsx` | Rebuilt with new landing components; Inter on nav buttons |

---

## Last Worked On

**Session:** 2026-04-08
**Changes:**

### Landing page full redesign (GSAP + new fonts)
- **Fonts** — added `Inter` (`--font-inter`) and `GeistSans` (`--font-geist-sans`) to `app/layout.tsx`; font utility classes `.font-bricolage`, `.font-geist`, `.font-inter-landing` added to `globals.css`
- **`globals.css`** — new keyframes: `marquee-left`, `marquee-right`, `float-orb-1`, `float-orb-2`; utility classes: `animate-marquee-left/right`, `animate-float-orb-1/2`
- **`components/landing/MagneticButton.tsx`** — GSAP magnetic hover effect with elastic spring-back
- **`components/landing/LandingHero.tsx`** — full hero rebuild: GSAP entrance timeline (badge→headline→sub→CTAs→stats→mockup), floating orb background, magnetic CTA buttons with shine sweep, Bricolage Grotesque headlines, Geist body, Inter buttons
- **`components/landing/LandingMarquee.tsx`** — infinite CSS marquee with company names (social proof strip between hero and features)
- **`components/landing/LandingFeatures.tsx`** — bento grid with GSAP ScrollTrigger reveal + 3D mouse-tilt on cards; hover gradient overlay per feature color
- **`components/landing/LandingHowItWorks.tsx`** — GSAP ScrollTrigger reveals, colored step numbers, connector lines
- **`components/landing/LandingTestimonials.tsx`** — dual-row infinite marquee (opposite directions), edge fades, GSAP heading reveal
- **`components/landing/LandingCTA.tsx`** — gradient card with magnetic CTA button, GSAP ScrollTrigger, glow effects
- **`app/page.tsx`** — rebuilt to use all new landing components; old Hero/Features/HowItWorks/Testimonials/CTABanner removed; Inter font on navbar buttons

### Previous session (same date)
- **8-theme system**, **animations**, **drag-and-drop fixes**, **priority filter horizontal pills** — see git log

---

## Pending / Next Steps

- Activity and Analytics routes still do a full server render on navigation (they are separate routes). Could be inlined as lazy-fetched tabs in `DashboardClient` if needed.
- The `/my-tasks` route still exists and works (direct URL); sidebar no longer links to it.
- Search currently only covers task titles and project names — could extend to comments if needed.
- FocusMode timer SVG ring and timer text colors are still hardcoded dark hex values (intentional — it's an always-dark immersive overlay, not themed). If needed, these can be mapped to Ember/Nord theme accent colors.
- Chart colors in AnalyticsClient (Recharts `stroke`/`fill` attributes) are hardcoded `#6366f1`/`#10b981` — these are data series colors, not UI chrome, so they're acceptable as-is.

---

## How to Update This File

After every session where code was changed, update:
1. The relevant rows in **File Change Reference**
2. **Last Worked On** — date + bullet summary of changes
3. **Pending / Next Steps** — anything left incomplete or planned next
4. Add new items to **What Has Been Built** if a feature was completed

Keep entries concise — this file should be scannable in under 2 minutes.
