import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db, focusSessions, users } from "@/lib/db"
import { eq, desc } from "drizzle-orm"

type Params = { params: Promise<{ taskId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { taskId } = await params

  const sessions = await db
    .select({
      id:        focusSessions.id,
      duration:  focusSessions.duration,
      completed: focusSessions.completed,
      notes:     focusSessions.notes,
      createdAt: focusSessions.createdAt,
      userName:  users.name,
    })
    .from(focusSessions)
    .leftJoin(users, eq(focusSessions.userId, users.id))
    .where(eq(focusSessions.taskId, taskId))
    .orderBy(desc(focusSessions.createdAt))
    .limit(20)

  return NextResponse.json({ sessions })
}
