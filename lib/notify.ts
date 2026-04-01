// lib/notify.ts  — thin helper used inside server actions
import { db, notifications } from "@/lib/db"

type NotifType = "MENTION" | "REPLY" | "TASK_ASSIGNED" | "STATUS_CHANGE" | "DUE_DATE"

export async function createNotification({
  userId, type, message, taskId, commentId,
}: {
  userId:     string
  type:       NotifType
  message:    string
  taskId?:    string
  commentId?: string
}) {
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
