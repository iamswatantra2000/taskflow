// app/(dashboard)/settings/page.tsx
import { requireAuth } from "@/lib/session"
import { db, workspaces, workspaceMembers, users, invitations } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { SettingsClient } from "../../../components/features/SettingsClient"
import { getNotificationPreferences } from "@/lib/notification-prefs-actions"

export default async function SettingsPage() {
  const session = await requireAuth()

  // Get workspace membership
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  const [workspace] = membership
    ? await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, membership.workspaceId))
        .limit(1)
    : []

  // Get full user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id!))
    .limit(1)

  // Get all workspace members with their user info
  const members = await db
    .select({
      id:       users.id,
      name:     users.name,
      email:    users.email,
      role:     workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .leftJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, membership?.workspaceId ?? ""))

  const notifPrefs = await getNotificationPreferences()

  // Get pending invitations for this workspace
  const pendingInvites = membership
    ? await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.workspaceId, membership.workspaceId),
            eq(invitations.status, "PENDING"),
          )
        )
    : []

  return (
    <SettingsClient
      user={{
        id:    user?.id    ?? "",
        name:  user?.name  ?? "",
        email: user?.email ?? "",
        plan:  user?.plan  ?? "free",
      }}
      workspace={{
        id:   workspace?.id   ?? "",
        name: workspace?.name ?? "",
        slug: workspace?.slug ?? "",
      }}
      members={members.map((m) => ({
        id:       m.id    ?? "",
        name:     m.name  ?? "",
        email:    m.email ?? "",
        role:     m.role  ?? "MEMBER",
        joinedAt: m.joinedAt,
      }))}
      userRole={membership?.role ?? "MEMBER"}
      notifPrefs={notifPrefs}
      pendingInvites={pendingInvites.map((inv) => ({
        id:        inv.id,
        email:     inv.email,
        role:      inv.role,
        status:    inv.status,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      }))}
    />
  )
}
