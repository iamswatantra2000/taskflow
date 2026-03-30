// lib/analytics.ts
import { db, tasks, projects, workspaceMembers } from "@/lib/db"
import { eq, and, gte, lte } from "drizzle-orm"

export async function getAnalyticsData(userId: string) {
  // Get workspace
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1)

  if (!membership) return null

  const workspaceId = membership.workspaceId

  // Get all projects in workspace
  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))

  // Get all tasks across all projects
  const allTasks = await db
    .select({
      id:        tasks.id,
      status:    tasks.status,
      priority:  tasks.priority,
      projectId: tasks.projectId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(
      eq(
        tasks.projectId,
        // tasks from any project in this workspace
        db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.workspaceId, workspaceId))
          .limit(1)
          .as("sub")
          .id
      )
    )

  // Get tasks for each project separately
  const tasksByProject = await Promise.all(
    allProjects.map(async (project) => {
      const projectTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, project.id))

      return {
        projectId:   project.id,
        projectName: project.name,
        color:       project.color,
        total:       projectTasks.length,
        todo:        projectTasks.filter((t) => t.status === "TODO").length,
        inProgress:  projectTasks.filter((t) => t.status === "IN_PROGRESS").length,
        inReview:    projectTasks.filter((t) => t.status === "IN_REVIEW").length,
        done:        projectTasks.filter((t) => t.status === "DONE").length,
      }
    })
  )

  // Flatten all tasks
  const flatTasks = tasksByProject.reduce<{
    id:        string
    status:    string
    priority:  string
    projectId: string
    createdAt: Date
    updatedAt: Date
  }[]>((acc, p) => acc, [])

  // Get all tasks directly
  const allTasksDirect = await db
    .select({
      id:        tasks.id,
      status:    tasks.status,
      priority:  tasks.priority,
      projectId: tasks.projectId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(projects.workspaceId, workspaceId))

  // Status distribution
  const statusData = [
    { name: "Todo",        value: allTasksDirect.filter((t) => t.status === "TODO").length,        fill: "#555555" },
    { name: "In Progress", value: allTasksDirect.filter((t) => t.status === "IN_PROGRESS").length, fill: "#6366f1" },
    { name: "In Review",   value: allTasksDirect.filter((t) => t.status === "IN_REVIEW").length,   fill: "#f59e0b" },
    { name: "Done",        value: allTasksDirect.filter((t) => t.status === "DONE").length,        fill: "#10b981" },
  ]

  // Priority distribution
  const priorityData = [
    { name: "Low",    value: allTasksDirect.filter((t) => t.priority === "LOW").length,    fill: "#10b981" },
    { name: "Medium", value: allTasksDirect.filter((t) => t.priority === "MEDIUM").length, fill: "#f59e0b" },
    { name: "High",   value: allTasksDirect.filter((t) => t.priority === "HIGH").length,   fill: "#ef4444" },
    { name: "Urgent", value: allTasksDirect.filter((t) => t.priority === "URGENT").length, fill: "#dc2626" },
  ]

  // Velocity — tasks created per day for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const velocityData = last7Days.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)

    const created = allTasksDirect.filter((t) => {
      const created = new Date(t.createdAt)
      return created >= day && created < nextDay
    }).length

    const completed = allTasksDirect.filter((t) => {
      const updated = new Date(t.updatedAt)
      return t.status === "DONE" && updated >= day && updated < nextDay
    }).length

    return {
      day:       day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      created,
      completed,
    }
  })

  // Summary stats
  const totalTasks      = allTasksDirect.length
  const completedTasks  = allTasksDirect.filter((t) => t.status === "DONE").length
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const inProgressCount = allTasksDirect.filter((t) => t.status === "IN_PROGRESS").length

  // Most active project
  const mostActiveProject = tasksByProject.reduce(
    (max, p) => (p.total > (max?.total ?? 0) ? p : max),
    tasksByProject[0]
  )

  return {
    statusData,
    priorityData,
    velocityData,
    tasksByProject,
    summary: {
      totalTasks,
      completedTasks,
      completionRate,
      inProgressCount,
      mostActiveProject: mostActiveProject?.projectName ?? "None",
      totalProjects:     allProjects.length,
    },
  }
}