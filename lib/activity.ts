// lib/activity.ts
"use server"

import { db, activities, workspaceMembers } from "@/lib/db"
import { eq } from "drizzle-orm"

type LogActivityParams = {
  type:        "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED" | "TASK_MOVED" | "PROJECT_CREATED" | "MEMBER_JOINED"
  description: string
  userId:      string
  workspaceId: string
  taskId?:     string
  projectId?:  string
}

export async function logActivity(params: LogActivityParams) {
  try {
    await db.insert(activities).values({
      type:        params.type,
      description: params.description,
      userId:      params.userId,
      workspaceId: params.workspaceId,
      taskId:      params.taskId,
      projectId:   params.projectId,
    })
  } catch (err) {
    // Never let activity logging break the main action
    console.error("Failed to log activity:", err)
  }
}

export async function getWorkspaceId(userId: string): Promise<string | null> {
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .limit(1)

  return membership?.workspaceId ?? null
}