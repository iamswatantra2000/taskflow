// app/api/subtasks/[taskId]/route.ts
import { requireAuth } from "@/lib/session"
import { db, subtasks } from "@/lib/db"
import { eq, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  await requireAuth()
  const { taskId } = await params
  const rows = await db
    .select()
    .from(subtasks)
    .where(eq(subtasks.taskId, taskId))
    .orderBy(asc(subtasks.position), asc(subtasks.createdAt))
  return NextResponse.json({ subtasks: rows })
}
