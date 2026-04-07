// lib/subtask-actions.ts
"use server"

import { requireAuth } from "@/lib/session"
import { db, subtasks } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function addSubtask(taskId: string, title: string) {
  await requireAuth()
  const trimmed = title.trim()
  if (!trimmed) return

  // position = count of existing subtasks
  const existing = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId))
  await db.insert(subtasks).values({
    taskId,
    title: trimmed,
    position: existing.length,
  })
}

export async function toggleSubtask(subtaskId: string, completed: boolean) {
  await requireAuth()
  await db.update(subtasks).set({ completed }).where(eq(subtasks.id, subtaskId))
}

export async function deleteSubtask(subtaskId: string) {
  await requireAuth()
  await db.delete(subtasks).where(eq(subtasks.id, subtaskId))
}

export async function updateSubtaskTitle(subtaskId: string, title: string) {
  await requireAuth()
  const trimmed = title.trim()
  if (!trimmed) return
  await db.update(subtasks).set({ title: trimmed }).where(eq(subtasks.id, subtaskId))
}
