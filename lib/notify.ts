// lib/notify.ts  — thin helper used inside server actions
import { db, notifications, notificationPreferences } from "@/lib/db"
import { eq } from "drizzle-orm"

type NotifType = "MENTION" | "REPLY" | "TASK_ASSIGNED" | "STATUS_CHANGE" | "DUE_DATE"

// Map notification type → preference column key
const PREF_KEY: Record<NotifType, "taskAssigned" | "statusChange" | "dueDateReminder" | "mentions" | "replies"> = {
  TASK_ASSIGNED: "taskAssigned",
  STATUS_CHANGE: "statusChange",
  DUE_DATE:      "dueDateReminder",
  MENTION:       "mentions",
  REPLY:         "replies",
}

export async function createNotification({
  userId, type, message, taskId, commentId,
}: {
  userId:     string
  type:       NotifType
  message:    string
  taskId?:    string
  commentId?: string
}) {
  // Check if the user has this notification type enabled (default: true if no row)
  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  if (prefs) {
    const key = PREF_KEY[type]
    if (prefs[key] === false) return  // user opted out
  }

  await db.insert(notifications).values({
    id:        crypto.randomUUID(),
    userId,
    type,
    message,
    taskId:    taskId    ?? null,
    commentId: commentId ?? null,
    isRead:    false,
  })
}
