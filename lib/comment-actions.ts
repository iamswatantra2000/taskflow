// lib/comment-actions.ts
"use server"

import { db, comments, notifications, users } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getComments(taskId: string) {
  const rows = await db
    .select({
      id:        comments.id,
      content:   comments.content,
      createdAt: comments.createdAt,
      userName:  users.name,
      userId:    users.id,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(asc(comments.createdAt))

  return rows.map((r) => ({
    id:        r.id,
    content:   r.content,
    createdAt: r.createdAt,
    userName:  r.userName ?? "Unknown",
    userId:    r.userId   ?? "",
  }))
}

export async function createComment(
  taskId:           string,
  content:          string,
  mentionedUserIds: string[],
  taskTitle:        string,
) {
  const session   = await requireAuth()
  const commentId = crypto.randomUUID()

  await db.insert(comments).values({
    id:      commentId,
    taskId,
    userId:  session.user.id,
    content,
  })

  // Notify each mentioned user (skip self)
  const toNotify = mentionedUserIds.filter((id) => id !== session.user.id)
  if (toNotify.length > 0) {
    await db.insert(notifications).values(
      toNotify.map((uid) => ({
        id:        crypto.randomUUID(),
        userId:    uid,
        type:      "MENTION" as const,
        message:   `${session.user.name} mentioned you in "${taskTitle}"`,
        taskId,
        commentId,
        isRead:    false,
      }))
    )
  }

  revalidatePath("/dashboard")
}
