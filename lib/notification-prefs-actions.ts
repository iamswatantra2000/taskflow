// lib/notification-prefs-actions.ts
"use server"

import { db, notificationPreferences } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq } from "drizzle-orm"

export type NotifPrefs = {
  taskAssigned:    boolean
  statusChange:    boolean
  dueDateReminder: boolean
  mentions:        boolean
  replies:         boolean
}

const DEFAULTS: NotifPrefs = {
  taskAssigned:    true,
  statusChange:    true,
  dueDateReminder: true,
  mentions:        true,
  replies:         true,
}

export async function getNotificationPreferences(): Promise<NotifPrefs> {
  const session = await requireAuth()

  const [row] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, session.user.id!))
    .limit(1)

  if (!row) return DEFAULTS

  return {
    taskAssigned:    row.taskAssigned,
    statusChange:    row.statusChange,
    dueDateReminder: row.dueDateReminder,
    mentions:        row.mentions,
    replies:         row.replies,
  }
}

export async function saveNotificationPreferences(prefs: NotifPrefs): Promise<void> {
  const session = await requireAuth()
  const userId  = session.user.id!

  const [existing] = await db
    .select({ id: notificationPreferences.id })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  if (existing) {
    await db
      .update(notificationPreferences)
      .set({ ...prefs, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
  } else {
    await db.insert(notificationPreferences).values({
      id: crypto.randomUUID(),
      userId,
      ...prefs,
    })
  }
}
