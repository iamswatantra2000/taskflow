// lib/actions.ts
"use server"

import { db, tasks, projects, workspaces, workspaceMembers, users, activities } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { eq, inArray } from "drizzle-orm"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { logActivity, getWorkspaceId } from "@/lib/activity"

// ——— Create a task ———
export async function createTask(formData: FormData) {
  const session = await requireAuth()

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

// ——— Sign out ———
export async function signOutAction() {
  const { signOut } = await import("@/lib/auth")
  await signOut({ redirectTo: "/login" })
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

// ——— Change password ———
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters"),
})

export async function changePassword(formData: FormData) {
  const session = await requireAuth()

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { currentPassword, newPassword } = parsed.data

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!))
    .limit(1)

  if (!user || !user.password) throw new Error("User not found")

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) throw new Error("Current password is incorrect")

  const hashed = await bcrypt.hash(newPassword, 12)
  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, session.user.id!))
}

// ——— Register user ———
const registerSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { name, email, password } = parsed.data

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) throw new Error("An account with this email already exists")

  const hashedPassword = await bcrypt.hash(password, 12)

  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  }).returning()

  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${newUser.id.slice(0, 6)}`

  const [workspace] = await db.insert(workspaces).values({
    name:    `${name}'s Workspace`,
    slug,
    ownerId: newUser.id,
  }).returning()

  await db.insert(workspaceMembers).values({
    userId:      newUser.id,
    workspaceId: workspace.id,
    role:        "OWNER",
  })

  await db.insert(projects).values({
    name:        "My First Project",
    description: "Get started by creating your first tasks",
    color:       "#6366f1",
    workspaceId: workspace.id,
  })

  // Log member joined
  await logActivity({
    type:        "MEMBER_JOINED",
    description: `${name} joined the workspace`,
    userId:      newUser.id,
    workspaceId: workspace.id,
  })

  return { success: true, email, password }
}