// app/(dashboard)/dashboard/page.tsx
import { requireAuth } from "@/lib/session"
import { db, tasks, projects, workspaceMembers } from "@/lib/db"
import { eq, inArray } from "drizzle-orm"
import { DashboardClient } from "@/components/features/DashboardClient"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default async function DashboardPage() {
  const session   = await requireAuth()
  const firstName = session.user.name?.split(" ")[0] ?? "there"

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  const userProjects = membership
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, membership.workspaceId))
    : []

  const firstProject = userProjects[0] ?? null

  // ← Explicitly select all fields including dueDate
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
          dueDate:     tasks.dueDate,    // ← this is the key fix
        })
        .from(tasks)
        .where(inArray(tasks.projectId, userProjects.map((p) => p.id)))
    : []

  const todoTasks       = allTasks.filter((t) => t.status === "TODO")
  const inProgressTasks = allTasks.filter((t) => t.status === "IN_PROGRESS")
  const inReviewTasks   = allTasks.filter((t) => t.status === "IN_REVIEW")
  const doneTasks       = allTasks.filter((t) => t.status === "DONE")

  const columns = [
    { id: "TODO",        label: "Todo",        tasks: todoTasks,       dot: "bg-[#555]"      },
    { id: "IN_PROGRESS", label: "In progress", tasks: inProgressTasks, dot: "bg-indigo-500"  },
    { id: "IN_REVIEW",   label: "In review",   tasks: inReviewTasks,   dot: "bg-amber-500"   },
    { id: "DONE",        label: "Done",        tasks: doneTasks,       dot: "bg-emerald-500" },
  ]

 const stats = [
  { label: "Total tasks", value: allTasks.length,        sub: "across all projects", valueColor: "text-[#e0e0e0]"   },
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
    />
  )
}