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
      parentId:  comments.parentId,
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
    parentId:  r.parentId  ?? null,
    userName:  r.userName  ?? "Unknown",
    userId:    r.userId    ?? "",
  }))
}

export async function createComment(
  taskId:           string,
  content:          string,
  mentionedUserIds: string[],
  taskTitle:        string,
  parentId?:        string,
) {
  const session   = await requireAuth()
  const commentId = crypto.randomUUID()

  await db.insert(comments).values({
    id:       commentId,
    taskId,
    userId:   session.user.id,
    content,
    parentId: parentId ?? null,
  })

  const notifs: {
    id: string; userId: string; type: "MENTION" | "REPLY"
    message: string; taskId: string; commentId: string; isRead: boolean
  }[] = []

  // Notify mentioned users (skip self)
  for (const uid of mentionedUserIds) {
    if (uid !== session.user.id) {
      notifs.push({
        id:        crypto.randomUUID(),
        userId:    uid,
        type:      "MENTION",
        message:   `${session.user.name} mentioned you in "${taskTitle}"`,
        taskId,
        commentId,
        isRead:    false,
      })
    }
  }

  // Notify parent comment author on reply (skip self + already mentioned)
  if (parentId) {
    const [parent] = await db
      .select({ userId: comments.userId })
      .from(comments)
      .where(eq(comments.id, parentId))
      .limit(1)

    if (parent && parent.userId !== session.user.id && !notifs.find((n) => n.userId === parent.userId)) {
      notifs.push({
        id:        crypto.randomUUID(),
        userId:    parent.userId,
        type:      "REPLY",
        message:   `${session.user.name} replied to your comment in "${taskTitle}"`,
        taskId,
        commentId,
        isRead:    false,
      })
    }
  }

  if (notifs.length > 0) {
    await db.insert(notifications).values(notifs)
  }

  revalidatePath("/dashboard")
}
