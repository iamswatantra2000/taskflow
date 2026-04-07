// app/api/search/route.ts
// GET /api/search?q=query
// Returns { tasks, projects } scoped to the current user's workspace
import { requireAuth } from "@/lib/session"
import { db, tasks, projects, workspaceMembers } from "@/lib/db"
import { eq, ilike, and, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await requireAuth()
  const url     = new URL(req.url)
  const q       = url.searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) return NextResponse.json({ tasks: [], projects: [] })

  // Get user's workspace
  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) return NextResponse.json({ tasks: [], projects: [] })

  const { workspaceId } = membership
  const pattern = `%${q}%`

  // Search projects
  const projectResults = await db
    .select({ id: projects.id, name: projects.name, color: projects.color, description: projects.description })
    .from(projects)
    .where(and(
      eq(projects.workspaceId, workspaceId),
      ilike(projects.name, pattern),
    ))
    .limit(5)

  const projectIds = (await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
  ).map((p) => p.id)

  if (projectIds.length === 0) return NextResponse.json({ tasks: [], projects: projectResults })

  // Search tasks by title (scoped to workspace projects)
  const taskResults = await db
    .select({
      id:           tasks.id,
      title:        tasks.title,
      status:       tasks.status,
      priority:     tasks.priority,
      projectId:    tasks.projectId,
      projectName:  projects.name,
      projectColor: projects.color,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(
      inArray(tasks.projectId, projectIds),
      ilike(tasks.title, pattern),
    ))
    .limit(8)

  return NextResponse.json({ tasks: taskResults, projects: projectResults })
}
