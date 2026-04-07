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

---

## Last Worked On

**Session:** 2026-04-07 (continued)
**Changes:**
- **Instant dialog open** — batch-fetch subtasks + workspace labels + task-label map at `TaskBoard` mount via single `Promise.all`; data threaded as `initialItems`/`initialWorkspaceLabels`/`initialAppliedIds` props to skip child component fetches → `TaskDetailDialog` opens instantly with no loading skeletons
- **`SubtaskList.tsx`** — added `initialItems?: Subtask[]` prop; skips fetch when provided; `useState(initialItems === undefined)` for loading guard
- **`LabelPicker.tsx`** — added `initialWorkspaceLabels?` and `initialAppliedIds?` props; skips both fetch calls when provided
- **`TaskDetailDialog.tsx`** — added `initialSubtasks`, `initialWorkspaceLabels`, `initialAppliedLabelIds` optional props; passes them to children
- **Bulk Actions** — multi-select kanban cards via checkbox (shows on hover); floating `BulkActionBar` at bottom center with Move to / Assign / Delete; `lib/actions.ts` has `bulkUpdateStatus`, `bulkAssign`, `bulkDelete` using `inArray`; optimistic updates in `TaskBoard`; `BulkActionBar.tsx` created
- **Checkbox alignment fix** — checkbox and drag handle share inline `relative w-[13px] h-[13px]` flex slot; both `absolute inset-0` inside, no more absolute card-level positioning
- **Drag fix** — `{...listeners}` moved from drag handle div to title `<p>` only; drag handle keeps only `{...attributes}`; fixed dnd-kit conflict
- **Subtask progress chip on cards** — mini progress bar + `done/total` count rendered on `TaskCard` when task has subtasks; emerald when 100%, indigo otherwise
- **Inline task creation** — `+` button in column headers; `InlineTaskForm` component (text input + Enter to save, Esc to cancel); optimistic temp card with `temp-${Date.now()}` id; `createTask` server action + `revalidatePath`
- **Gantt / Timeline view** — `TimelineView` in `ProjectClient.tsx` rebuilt: pixel-per-day (DAY_PX=36, LABEL_W=220), two-row header (month segments + day numbers with today highlight), status-colored bars, today vertical line, weekend shading, dashed placeholder for tasks with no due date, status legend
- **Global search** — `app/api/search/route.ts` created: GET `/api/search?q=` searches tasks by title + projects by name via `ilike`, scoped to user's workspace; `CommandPalette.tsx` updated with debounced fetch (280ms), `SearchTask`/`SearchProject` types, `STATUS_DOT` map, searching spinner, conditional Tasks/Projects result groups vs default navigation groups

---

## Pending / Next Steps

- Activity and Analytics routes still do a full server render on navigation (they are separate routes). Could be inlined as lazy-fetched tabs in `DashboardClient` if needed.
- The `/my-tasks` route still exists and works (direct URL); sidebar no longer links to it.
- Search currently only covers task titles and project names — could extend to comments if needed.

---

## How to Update This File

After every session where code was changed, update:
1. The relevant rows in **File Change Reference**
2. **Last Worked On** — date + bullet summary of changes
3. **Pending / Next Steps** — anything left incomplete or planned next
4. Add new items to **What Has Been Built** if a feature was completed

Keep entries concise — this file should be scannable in under 2 minutes.
