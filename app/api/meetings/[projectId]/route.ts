import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, meetings, projects, workspaceMembers } from "@/lib/db"
import { and, eq } from "drizzle-orm"

type Params = { params: Promise<{ projectId: string }> }

// Verify the caller is a member of the workspace that owns this project.
// Returns workspaceId on success, null on failure.
async function authorise(userId: string, projectId: string) {
  const [project] = await db
    .select({ workspaceId: projects.workspaceId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project) return null

  const [membership] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, project.workspaceId)
      )
    )
    .limit(1)

  if (!membership) return null
  return project.workspaceId
}

// GET — return the currently active meeting for this project (or null)
export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const workspaceId = await authorise(userId, projectId)
  if (!workspaceId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.projectId, projectId), eq(meetings.status, "active")))
    .limit(1)

  return NextResponse.json({ meeting: meeting ?? null })
}

// POST — create a new meeting for this project (idempotent: returns existing if already active)
export async function POST(_req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const workspaceId = await authorise(userId, projectId)
  if (!workspaceId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Return existing active meeting if one already exists
  const [existing] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.projectId, projectId), eq(meetings.status, "active")))
    .limit(1)

  if (existing) return NextResponse.json({ meeting: existing })

  // Generate a random room name (unguessable)
  const roomName = `tf-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`

  const [meeting] = await db
    .insert(meetings)
    .values({
      projectId,
      workspaceId,
      createdById: userId,
      roomName,
    })
    .returning()

  return NextResponse.json({ meeting })
}

// DELETE — end the active meeting for this project
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const workspaceId = await authorise(userId, projectId)
  if (!workspaceId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.projectId, projectId), eq(meetings.status, "active")))
    .limit(1)

  if (!meeting) return NextResponse.json({ ok: true })

  await db
    .update(meetings)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(meetings.id, meeting.id))

  return NextResponse.json({ ok: true })
}
