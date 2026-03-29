// app/(dashboard)/page.tsx
import { requireAuth } from "@/lib/session"
import { db, tasks, projects, workspaceMembers } from "@/lib/db"
import { eq, inArray } from "drizzle-orm"   // ← add inArray
import { DashboardClient } from "@/components/features/DashboardClient"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default async function DashboardPage() {
  const session   = await requireAuth()
  const firstName = session.user.name?.split(" ")[0] ?? "there"

  // 1. Get user's workspace
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  // 2. Get projects belonging to this workspace only
  const userProjects = membership
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, membership.workspaceId))
    : []

  const firstProject = userProjects[0] ?? null

  // 3. Get tasks belonging to this user's projects only
  const allTasks = userProjects.length > 0
    ? await db
        .select()
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
    { label: "Total tasks",  value: allTasks.length,        sub: "across all projects", valueColor: "text-[#e0e0e0]"   },
    { label: "In progress",  value: inProgressTasks.length, sub: "currently active",    valueColor: "text-indigo-400"  },
    { label: "Completed",    value: doneTasks.length,       sub: "great work!",         valueColor: "text-emerald-400" },
    { label: "Todo",         value: todoTasks.length,       sub: "up next",             valueColor: "text-amber-400"   },
  ]

  return (
   <DashboardClient
    columns={columns}
    userName={session.user.name ?? "User"}
    userInitials={getInitials(session.user.name ?? "User")}
    projectId={firstProject?.id ?? null}
    stats={stats}
     projects={userProjects}
    firstName={firstName}
    user={session.user}    // ← add this
    workspaceId={membership?.workspaceId ?? ""}
  />
  )
}