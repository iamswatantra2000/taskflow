// lib/notification-actions.ts
"use server"

import { db, notifications, tasks } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq, and, desc, gte, lte } from "drizzle-orm"

export async function getNotifications() {
  const session = await requireAuth()

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30)
}

export async function markAllNotificationsRead() {
  const session = await requireAuth()

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false),
      )
    )
}

export async function markOneNotificationRead(id: string) {
  const session = await requireAuth()

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, session.user.id),
      )
    )
}

export async function clearAllNotifications() {
  const session = await requireAuth()

  await db
    .delete(notifications)
    .where(eq(notifications.userId, session.user.id))
}

// ── Due-date reminders (call on dashboard load) ──────────────────
export async function checkDueDateReminders() {
  const session = await requireAuth()

  const now      = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 2)
  tomorrow.setHours(0, 0, 0, 0)

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // Tasks assigned to current user with due date within next 2 days
  const dueSoon = await db
    .select({ id: tasks.id, title: tasks.title, dueDate: tasks.dueDate })
    .from(tasks)
    .where(
      and(
        eq(tasks.assigneeId, session.user.id),
        gte(tasks.dueDate, todayStart),
        lte(tasks.dueDate, tomorrow),
      )
    )

  if (dueSoon.length === 0) return

  // Dedup: skip if DUE_DATE notification already created for this task today
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existing  = await db
    .select({ taskId: notifications.taskId })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, session.user.id),
        eq(notifications.type,   "DUE_DATE"),
        gte(notifications.createdAt, oneDayAgo),
      )
    )

  const alreadyNotified = new Set(existing.map((n) => n.taskId))

  const toCreate = dueSoon.filter((t) => !alreadyNotified.has(t.id))
  if (toCreate.length === 0) return

  await db.insert(notifications).values(
    toCreate.map((t) => {
      const due     = new Date(t.dueDate!)
      const isToday = due.toDateString() === now.toDateString()
      return {
        id:        crypto.randomUUID(),
        userId:    session.user.id,
        type:      "DUE_DATE" as const,
        message:   `"${t.title}" is due ${isToday ? "today" : "tomorrow"}`,
        taskId:    t.id,
        commentId: null,
        isRead:    false,
      }
    })
  )
}
