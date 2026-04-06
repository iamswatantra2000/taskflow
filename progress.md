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
| `lib/decay.ts` | **Created** — getDecayLevel / getDecayDays / Tailwind class maps |
| `components/features/TaskBoard.tsx` | Decay border + stale badge on cards; stale count in column headers |
| `components/features/TaskBoardWrapper.tsx` | Added `updatedAt` to task type |
| `components/features/DashboardClient.tsx` | Added `updatedAt` to task type |
| `app/(dashboard)/dashboard/page.tsx` | Added `updatedAt` to tasks SELECT |
| `app/(dashboard)/projects/[id]/page.tsx` | Added `updatedAt` to tasks SELECT |
| `app/globals.css` | Added `animate-pulse-slow` keyframe for level-3 decay |

---

## Last Worked On

**Session:** 2026-04-06
**Changes:**
- Added `ThemeToggle` component — sun/moon icon, placed in all 8 topbars + landing navbar
- Fixed landing page Hero product mockup for light theme
- Fixed theme toggle lag: suppress all CSS transitions during switch via temp `<style>` + double rAF
- Applied canonical Tailwind classes (`rounded-lg`, `shrink-0`, `rotate-200`) per linter
- **Presence avatars**: real-time "who's online" feature on project boards
  - `lib/presenceStore.ts` — module-level Map, 45s TTL
  - `app/api/presence/[projectId]/route.ts` — POST heartbeat + DELETE leave
  - `hooks/usePresence.ts` — 20s heartbeat, sendBeacon on unmount
  - `components/features/PresenceAvatars.tsx` — stacked avatars, pulsing dot, deterministic colors
- **Task decay indicators** — stale tasks (3/7/14d thresholds) get amber→orange border + clock badge
  - `lib/decay.ts` — shared utility (getDecayLevel, getDecayDays, Tailwind class maps)
  - Applied to `TaskBoard.tsx` (drag-and-drop board) + `ProjectClient.tsx` (project detail board)
  - Column headers show aggregate stale count badge

---

## Pending / Next Steps

_No pending tasks as of last session. Update this section when new work begins._

---

## How to Update This File

After every session where code was changed, update:
1. The relevant rows in **File Change Reference**
2. **Last Worked On** — date + bullet summary of changes
3. **Pending / Next Steps** — anything left incomplete or planned next
4. Add new items to **What Has Been Built** if a feature was completed

Keep entries concise — this file should be scannable in under 2 minutes.
