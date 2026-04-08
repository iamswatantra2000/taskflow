// app/(dashboard)/dashboard/page.tsx
import { requireAuth } from "@/lib/session"
import { db, tasks, projects, workspaceMembers, users } from "@/lib/db"
import { eq, inArray } from "drizzle-orm"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/features/DashboardClient"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default async function DashboardPage() {
  const session   = await requireAuth()

  // Redirect new users to onboarding wizard
  if (!session.user.onboardingCompleted) redirect("/onboarding")

  const firstName = session.user.name?.split(" ")[0] ?? "there"

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) {
    return <DashboardClient
      columns={[]}
      userName={session.user.name ?? "User"}
      userInitials={getInitials(session.user.name ?? "User")}
      projectId={null}
      projects={[]}
      stats={[
        { label: "Total tasks", value: 0, sub: "across all projects", valueColor: "text-[var(--tf-text-primary)]" },
        { label: "In progress", value: 0, sub: "currently active",    valueColor: "text-indigo-400"  },
        { label: "Completed",   value: 0, sub: "great work!",         valueColor: "text-emerald-400" },
        { label: "Todo",        value: 0, sub: "up next",             valueColor: "text-amber-400"   },
      ]}
      firstName={firstName}
      user={session.user}
      workspaceId=""
      plan={session.user.plan ?? "free"}
      members={[]}
      currentUserId={session.user.id}
    />
  }

  // Run projects + members queries in parallel
  const [userProjects, members] = await Promise.all([
    db.select().from(projects).where(eq(projects.workspaceId, membership.workspaceId)),
    db.select({ id: users.id, name: users.name })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, membership.workspaceId))
      .then((rows) => rows.map((r) => ({ id: r.id ?? "", name: r.name ?? "Unknown" }))),
  ])

  const firstProject = userProjects[0] ?? null

  const allTasks = userProjects.length > 0
    ? await db
        .select({
          id:          tasks.id,
          title:       tasks.title,
          description: tasks.description,
          status:      tasks.status,
          priority:    tasks.priority,
          assigneeId:  tasks.assigneeId,
          projectId:   tasks.projectId,
          dueDate:     tasks.dueDate,
          updatedAt:   tasks.updatedAt,
        })
        .from(tasks)
        .where(inArray(tasks.projectId, userProjects.map((p) => p.id)))
    : []

  const todoTasks       = allTasks.filter((t) => t.status === "TODO")
  const inProgressTasks = allTasks.filter((t) => t.status === "IN_PROGRESS")
  const inReviewTasks   = allTasks.filter((t) => t.status === "IN_REVIEW")
  const doneTasks       = allTasks.filter((t) => t.status === "DONE")

  const columns = [
    { id: "TODO",        label: "Todo",        tasks: todoTasks,       dot: "bg-slate-400 dark:bg-[var(--tf-text-tertiary)]"      },
    { id: "IN_PROGRESS", label: "In progress", tasks: inProgressTasks, dot: "bg-indigo-500"  },
    { id: "IN_REVIEW",   label: "In review",   tasks: inReviewTasks,   dot: "bg-amber-500"   },
    { id: "DONE",        label: "Done",        tasks: doneTasks,       dot: "bg-emerald-500" },
  ]

 const stats = [
  { label: "Total tasks", value: allTasks.length,        sub: "across all projects", valueColor: "text-[var(--tf-text-primary)]"   },
  { label: "In progress", value: inProgressTasks.length, sub: "currently active",    valueColor: "text-indigo-400"  },
  { label: "Completed",   value: doneTasks.length,       sub: "great work!",         valueColor: "text-emerald-400" },
  { label: "Todo",        value: todoTasks.length,       sub: "up next",             valueColor: "text-amber-400"   },
]

  return (
    <DashboardClient
      columns={columns}
      userName={session.user.name ?? "User"}
      userInitials={getInitials(session.user.name ?? "User")}
      projectId={firstProject?.id ?? null}
      projects={userProjects}
      stats={stats}
      firstName={firstName}
      user={session.user}
      workspaceId={membership?.workspaceId ?? ""}
      plan={session.user.plan ?? "free"}
      members={members}
      currentUserId={session.user.id}
    />
  )
}