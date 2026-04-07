// app/api/subtasks/batch/route.ts
// GET /api/subtasks/batch?ids=id1,id2,...
// Returns { subtaskMap: Record<taskId, Subtask[]> }
import { requireAuth } from "@/lib/session"
import { db, subtasks } from "@/lib/db"
import { inArray, asc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  await requireAuth()
  const url      = new URL(req.url)
  const idsParam = url.searchParams.get("ids") ?? ""
  const taskIds  = idsParam.split(",").filter(Boolean)

  if (taskIds.length === 0) return NextResponse.json({ subtaskMap: {} })

  const rows = await db
    .select()
    .from(subtasks)
    .where(inArray(subtasks.taskId, taskIds))
    .orderBy(asc(subtasks.position), asc(subtasks.createdAt))

  const subtaskMap: Record<string, typeof rows> = {}
  for (const row of rows) {
    if (!subtaskMap[row.taskId]) subtaskMap[row.taskId] = []
    subtaskMap[row.taskId].push(row)
  }

  return NextResponse.json({ subtaskMap })
}
