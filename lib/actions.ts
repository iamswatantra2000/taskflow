// lib/actions.ts
"use server"

import { db, tasks, projects, workspaces, workspaceMembers, users, activities } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { eq, inArray } from "drizzle-orm"
import { logActivity, getWorkspaceId } from "@/lib/activity"
import Anthropic from "@anthropic-ai/sdk"

// ——— Create a task ———
export async function createTask(formData: FormData) {
  const session = await requireAuth()
  const dueDate = formData.get("dueDate") as string

  const title     = formData.get("title") as string
  const priority  = formData.get("priority") as string
  const projectId = formData.get("projectId") as string
  const status    = formData.get("status") as string

  if (!title?.trim()) throw new Error("Title is required")

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) throw new Error("No workspace found")

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  if (!project || project.workspaceId !== membership.workspaceId) {
    throw new Error("Project not found in your workspace")
  }

  const [newTask] = await db.insert(tasks).values({
    title:      title.trim(),
    priority:   priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    status:     status   as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
    projectId,
    assigneeId: session.user.id ?? null,
      dueDate:    dueDate ? new Date(dueDate) : null,
  }).returning()

  // Log activity
  await logActivity({
    type:        "TASK_CREATED",
    description: `created task "${title.trim()}"`,
    userId:      session.user.id!,
    workspaceId: membership.workspaceId,
    taskId:      newTask.id,
    projectId,
  })

  revalidatePath("/")
  revalidatePath("/activity")
}

// ——— Update task status ———
export async function updateTaskStatus(taskId: string, status: string) {
  const session = await requireAuth()

  const statusLabels: Record<string, string> = {
    TODO:        "Todo",
    IN_PROGRESS: "In Progress",
    IN_REVIEW:   "In Review",
    DONE:        "Done",
  }

  const workspaceId = await getWorkspaceId(session.user.id!)

  await db
    .update(tasks)
    .set({ status: status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" })
    .where(eq(tasks.id, taskId))

  if (workspaceId) {
    await logActivity({
      type:        "TASK_MOVED",
      description: `moved a task to ${statusLabels[status] ?? status}`,
      userId:      session.user.id!,
      workspaceId,
      taskId,
    })
  }

  revalidatePath("/")
  revalidatePath("/activity")
}

// ——— Update task detail ———
export async function updateTask(taskId: string, formData: FormData) {
  const session   = await requireAuth()
  const title     = formData.get("title") as string
  const description = formData.get("description") as string
  const status    = formData.get("status") as string
  const priority  = formData.get("priority") as string
  const workspaceId = await getWorkspaceId(session.user.id!)

  await db
    .update(tasks)
    .set({
      title,
      description: description || null,
      status:   status   as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
      priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    })
    .where(eq(tasks.id, taskId))

  if (workspaceId) {
    await logActivity({
      type:        "TASK_UPDATED",
      description: `updated task "${title}"`,
      userId:      session.user.id!,
      workspaceId,
      taskId,
    })
  }

  revalidatePath("/")
  revalidatePath("/my-tasks")
  revalidatePath("/activity")
}

// ——— Delete a task ———
export async function deleteTask(taskId: string) {
  const session = await requireAuth()
  const workspaceId = await getWorkspaceId(session.user.id!)

  // Get task title before deleting
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1)

  await db.delete(tasks).where(eq(tasks.id, taskId))

  if (workspaceId && task) {
    await logActivity({
      type:        "TASK_DELETED",
      description: `deleted task "${task.title}"`,
      userId:      session.user.id!,
      workspaceId,
    })
  }

  revalidatePath("/")
  revalidatePath("/my-tasks")
  revalidatePath("/activity")
}

// ——— Create a project ———
export async function createProject(formData: FormData) {
  const session = await requireAuth()

  const name        = formData.get("name") as string
  const description = formData.get("description") as string
  const color       = formData.get("color") as string

  if (!name?.trim()) throw new Error("Name is required")

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) throw new Error("No workspace found")

  const [newProject] = await db.insert(projects).values({
    name:        name.trim(),
    description: description?.trim() || null,
    color:       color || "#6366f1",
    workspaceId: membership.workspaceId,
  }).returning()

  await logActivity({
    type:        "PROJECT_CREATED",
    description: `created project "${name.trim()}"`,
    userId:      session.user.id!,
    workspaceId: membership.workspaceId,
    projectId:   newProject.id,
  })

  revalidatePath("/")
  revalidatePath("/activity")
}

// ——— Update display name ———
export async function updateDisplayName(formData: FormData) {
  const session = await requireAuth()
  const name = formData.get("name") as string

  if (!name?.trim()) throw new Error("Name is required")
  if (name.trim().length < 2) throw new Error("Name must be at least 2 characters")

  await db
    .update(users)
    .set({ name: name.trim() })
    .where(eq(users.id, session.user.id!))

  revalidatePath("/")
}

// ——— AI: Generate subtasks (Anthropic) ———
export async function generateSubtasks(description: string, projectId: string) {
  const session = await requireAuth()

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI feature coming soon — Anthropic API key not configured")
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role:    "user",
      content: `You are a project management assistant. Break down this feature/task into 3-6 specific, actionable subtasks.

Feature: "${description}"

Respond with ONLY a JSON array, no other text:
[
  {
    "title": "specific task title",
    "priority": "LOW" or "MEDIUM" or "HIGH" or "URGENT",
    "description": "brief description of what needs to be done"
  }
]`,
    }],
  })

  const content = message.content[0]
  if (content.type !== "text") throw new Error("Unexpected response type")

  const clean    = content.text.replace(/```json|```/g, "").trim()
  const subtasks = JSON.parse(clean) as {
    title:       string
    priority:    string
    description: string
  }[]

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) throw new Error("No workspace found")

  const created = await db.insert(tasks).values(
    subtasks.map((t) => ({
      title:       t.title.trim(),
      description: t.description?.trim() || null,
      priority:    t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status:      "TODO" as const,
      projectId,
      assigneeId:  session.user.id ?? null,
    }))
  ).returning()

  await logActivity({
    type:        "TASK_CREATED",
    description: `used AI to generate ${created.length} tasks from "${description}"`,
    userId:      session.user.id!,
    workspaceId: membership.workspaceId,
    projectId,
  })

  revalidatePath("/")
  revalidatePath("/activity")

  return created
}

// ——— AI: Improve task description (Anthropic) ———
export async function improveTaskDescription(
  title: string,
  currentDescription: string
) {
  await requireAuth()

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI feature coming soon — Anthropic API key not configured")
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default
  const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{
      role:    "user",
      content: `Write a clear, concise task description for a developer.

Task title: "${title}"
Current description: "${currentDescription || "none"}"

Write a better description in 2-3 sentences. Be specific and actionable. Respond with ONLY the description text, nothing else.`,
    }],
  })

  const content = message.content[0]
  if (content.type !== "text") throw new Error("Unexpected response type")

  return content.text.trim()
}

// ——— Update workspace name ———
export async function updateWorkspaceName(formData: FormData) {
  const session = await requireAuth()
  const name    = formData.get("name") as string

  if (!name?.trim()) throw new Error("Workspace name is required")
  if (name.trim().length < 2) throw new Error("Name must be at least 2 characters")

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  if (!membership) throw new Error("No workspace found")

  await db
    .update(workspaces)
    .set({ name: name.trim() })
    .where(eq(workspaces.id, membership.workspaceId))

  revalidatePath("/settings")
  revalidatePath("/")
}

// ——— Move task to different project ———
export async function moveTaskToProject(taskId: string, projectId: string) {
  await requireAuth()

  await db
    .update(tasks)
    .set({ projectId })
    .where(eq(tasks.id, taskId))

  revalidatePath("/")
  revalidatePath("/projects/[id]")
}

// ——— Upgrade plan ———
export async function upgradePlan(plan: "free" | "pro" | "enterprise") {
  const session = await requireAuth()

  await db
    .update(users)
    .set({ plan, updatedAt: new Date() })
    .where(eq(users.id, session.user.id!))

  revalidatePath("/settings")
  revalidatePath("/dashboard")
}