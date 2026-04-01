// lib/notification-actions.ts
"use server"

import { db, notifications } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq, and, desc } from "drizzle-orm"

export async function getNotifications() {
  const session = await requireAuth()

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20)
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
