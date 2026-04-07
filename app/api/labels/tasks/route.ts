// app/api/labels/tasks/route.ts
// GET /api/labels/tasks?ids=id1,id2,id3
// Returns { taskLabelMap: Record<taskId, Label[]> }
import { requireAuth } from "@/lib/session"
import { db, labels, taskLabels } from "@/lib/db"
import { inArray, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  await requireAuth()
  const url     = new URL(req.url)
  const idsParam = url.searchParams.get("ids") ?? ""
  const taskIds  = idsParam.split(",").filter(Boolean)

  if (taskIds.length === 0) {
    return NextResponse.json({ taskLabelMap: {} })
  }

  const rows = await db
    .select({
      taskId:     taskLabels.taskId,
      labelId:    labels.id,
      labelName:  labels.name,
      labelColor: labels.color,
    })
    .from(taskLabels)
    .innerJoin(labels, eq(taskLabels.labelId, labels.id))
    .where(inArray(taskLabels.taskId, taskIds))

  const taskLabelMap: Record<string, { id: string; name: string; color: string }[]> = {}
  for (const row of rows) {
    if (!taskLabelMap[row.taskId]) taskLabelMap[row.taskId] = []
    taskLabelMap[row.taskId].push({ id: row.labelId, name: row.labelName, color: row.labelColor })
  }

  return NextResponse.json({ taskLabelMap })
}
