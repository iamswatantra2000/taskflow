// lib/invite-actions.ts
"use server"

import { db, invitations, workspaceMembers, workspaces, users, projects, tasks } from "@/lib/db"
import { requireAuth } from "@/lib/session"
import { eq, and, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { sendInviteEmail } from "@/lib/email"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// ── Send invitation ──────────────────────────────────────────────
export async function sendInvitation(email: string, role: "MEMBER" | "ADMIN") {
  const session = await requireAuth()

  // Get the user's workspace and verify they're OWNER or ADMIN
  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1)

  if (!membership) throw new Error("Workspace not found")
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only owners and admins can invite members")
  }

  const workspaceId = membership.workspaceId

  // Check if already a member (by email)
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existingUser) {
    const [alreadyMember] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, existingUser.id),
          eq(workspaceMembers.workspaceId, workspaceId),
        )
      )
      .limit(1)

    if (alreadyMember) throw new Error("This person is already a member of your workspace")
  }

  // Check for an existing pending invite to same email
  const [existingInvite] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.email, email.toLowerCase()),
        eq(invitations.workspaceId, workspaceId),
        eq(invitations.status, "PENDING"),
      )
    )
    .limit(1)

  if (existingInvite) throw new Error("A pending invitation already exists for this email")

  // Fetch workspace name for the email
  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  if (!workspace) throw new Error("Workspace not found")

  // Generate token and create invitation (7-day expiry)
  const token     = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.insert(invitations).values({
    token,
    email:       email.toLowerCase(),
    workspaceId,
    invitedById: session.user.id,
    role,
    status:    "PENDING",
    expiresAt,
  })

  // Send email
  const inviteUrl = `${APP_URL}/invite/${token}`
  await sendInviteEmail({
    to:            email,
    inviterName:   session.user.name,
    workspaceName: workspace.name,
    inviteUrl,
  })

  revalidatePath("/settings")
  return { success: true, inviteUrl }
}

// ── Revoke invitation ────────────────────────────────────────────
export async function revokeInvitation(inviteId: string) {
  const session = await requireAuth()

  // Verify ownership
  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id))
    .limit(1)

  if (!membership) throw new Error("Not authorized")

  const [invite] = await db
    .select({ workspaceId: invitations.workspaceId })
    .from(invitations)
    .where(eq(invitations.id, inviteId))
    .limit(1)

  if (!invite || invite.workspaceId !== membership.workspaceId) {
    throw new Error("Invitation not found")
  }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new Error("Only owners and admins can revoke invitations")
  }

  await db
    .update(invitations)
    .set({ status: "REVOKED" })
    .where(eq(invitations.id, inviteId))

  revalidatePath("/settings")
}

// ── Accept invitation (called server-side from /invite/[token]) ──
export async function acceptInvitation(token: string, userId: string) {
  const [invite] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!invite)                       throw new Error("Invitation not found")
  if (invite.status !== "PENDING")   throw new Error("This invitation has already been used or revoked")
  if (invite.expiresAt < new Date()) throw new Error("This invitation has expired")

  // Check not already a member
  const [alreadyMember] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, invite.workspaceId),
      )
    )
    .limit(1)

  if (!alreadyMember) {
    // Before joining, find and clean up the user's auto-created empty workspace
    const [ownedMembership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.role, "OWNER"),
        )
      )
      .limit(1)

    if (ownedMembership && ownedMembership.workspaceId !== invite.workspaceId) {
      // Count tasks in their owned workspace — delete it only if empty
      const [projectRows] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.workspaceId, ownedMembership.workspaceId))
        .limit(1)

      const taskCount = projectRows
        ? await db
            .select({ count: count() })
            .from(tasks)
            .where(eq(tasks.projectId, projectRows.id))
            .then((r) => r[0]?.count ?? 0)
        : 0

      if (taskCount === 0) {
        await db.delete(workspaces).where(eq(workspaces.id, ownedMembership.workspaceId))
      }
    }

    await db.insert(workspaceMembers).values({
      userId,
      workspaceId: invite.workspaceId,
      role:        invite.role,
    })
  }

  // Mark accepted
  await db
    .update(invitations)
    .set({ status: "ACCEPTED" })
    .where(eq(invitations.id, invite.id))

  return { workspaceId: invite.workspaceId }
}
