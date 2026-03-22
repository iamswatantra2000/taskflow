// lib/actions.ts this
"use server"

import { db, tasks, projects, workspaces, workspaceMembers, users } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"
import bcrypt from "bcryptjs"

// ——— Create a task ———
export async function createTask(formData: FormData) {
  const session = await requireAuth()

  const title     = formData.get("title") as string
  const priority  = formData.get("priority") as string
  const projectId = formData.get("projectId") as string
  const status    = formData.get("status") as string

  if (!title?.trim()) throw new Error("Title is required")

  // Verify this project belongs to the user's workspace
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

  await db.insert(tasks).values({
    title:      title.trim(),
    priority:   priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    status:     status   as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
    projectId,
    assigneeId: session.user.id ?? null,
  })

  revalidatePath("/")
}

// ——— Update task status ———
export async function updateTaskStatus(taskId: string, status: string) {
  await requireAuth()

  await db
    .update(tasks)
    .set({ status: status as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" })
    .where(eq(tasks.id, taskId))

  revalidatePath("/")
}

// ——— Update task detail ———
export async function updateTask(taskId: string, formData: FormData) {
  await requireAuth()

  const title       = formData.get("title") as string
  const description = formData.get("description") as string
  const status      = formData.get("status") as string
  const priority    = formData.get("priority") as string

  await db
    .update(tasks)
    .set({
      title,
      description: description || null,
      status:   status   as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
      priority: priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    })
    .where(eq(tasks.id, taskId))

  revalidatePath("/")
  revalidatePath("/my-tasks")
}

// ——— Delete a task ———
export async function deleteTask(taskId: string) {
  await requireAuth()
  await db.delete(tasks).where(eq(tasks.id, taskId))
  revalidatePath("/")
  revalidatePath("/my-tasks")
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

  await db.insert(projects).values({
    name:        name.trim(),
    description: description?.trim() || null,
    color:       color || "#6366f1",
    workspaceId: membership.workspaceId,
  })

  revalidatePath("/")
}

// ——— Sign out ———
export async function signOutAction() {
  const { signOut } = await import("@/lib/auth")
  await signOut({ redirectTo: "/login" })
}

// ——— Register user ———
const registerSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function registerUser(formData: FormData) {
  // 1. Validate with Zod
  const parsed = registerSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
  })

 if (!parsed.success) {
  throw new Error(parsed.error.issues[0].message)  // ← .issues not .errors
}

  const { name, email, password } = parsed.data

  // 2. Check email not already taken
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    throw new Error("An account with this email already exists")
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // 4. Create user
  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  }).returning()

  // 5. Create personal workspace
  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${newUser.id.slice(0, 6)}`

  const [workspace] = await db.insert(workspaces).values({
    name:    `${name}'s Workspace`,
    slug,
    ownerId: newUser.id,
  }).returning()

  // 6. Add as OWNER
  await db.insert(workspaceMembers).values({
    userId:      newUser.id,
    workspaceId: workspace.id,
    role:        "OWNER",
  })

  // 7. Create default project
  await db.insert(projects).values({
    name:        "My First Project",
    description: "Get started by creating your first tasks",
    color:       "#6366f1",
    workspaceId: workspace.id,
  })

  // Return plain password so RegisterForm can auto-login
  return { success: true, email, password }
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

  // Get current user with password
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!))
    .limit(1)

  if (!user || !user.password) {
    throw new Error("User not found")
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    throw new Error("Current password is incorrect")
  }

  // Hash and save new password
  const hashed = await bcrypt.hash(newPassword, 12)

  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, session.user.id!))
}
