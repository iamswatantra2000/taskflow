// lib/label-actions.ts
"use server"

import { requireAuth } from "@/lib/session"
import { db, labels, taskLabels } from "@/lib/db"
import { eq, and } from "drizzle-orm"

export async function createLabel(workspaceId: string, name: string, color: string) {
  await requireAuth()
  const trimmed = name.trim()
  if (!trimmed) return null
  const [label] = await db.insert(labels).values({ workspaceId, name: trimmed, color }).returning()
  return label
}

export async function deleteLabel(labelId: string) {
  await requireAuth()
  await db.delete(labels).where(eq(labels.id, labelId))
}

export async function addLabelToTask(taskId: string, labelId: string) {
  await requireAuth()
  await db.insert(taskLabels).values({ taskId, labelId }).onConflictDoNothing()
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
  await requireAuth()
  await db.delete(taskLabels).where(
    and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId))
  )
}
