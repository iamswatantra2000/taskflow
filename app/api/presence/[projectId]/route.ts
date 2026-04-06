import { NextRequest, NextResponse } from "next/server"
import { heartbeat, leave, getActiveUsers } from "@/lib/presenceStore"

type Params = { params: Promise<{ projectId: string }> }

// POST — heartbeat (called every 20s while the user has the board open)
export async function POST(req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const body = await req.json().catch(() => null)

  if (!body?.userId || !body?.name) {
    return NextResponse.json({ error: "userId and name required" }, { status: 400 })
  }

  heartbeat(projectId, {
    userId: body.userId,
    name:   body.name,
    color:  body.color ?? "#6366f1",
  })

  return NextResponse.json({ users: getActiveUsers(projectId) })
}

// DELETE — called via sendBeacon when the user navigates away
export async function DELETE(req: NextRequest, { params }: Params) {
  const { projectId } = await params
  const body = await req.json().catch(() => null)

  if (body?.userId) leave(projectId, body.userId)

  return NextResponse.json({ ok: true })
}
