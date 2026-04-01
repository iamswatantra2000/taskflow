// app/invite/[token]/page.tsx
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { db, invitations, workspaces, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { acceptInvitation } from "@/lib/invite-actions"
import { requireAuth } from "@/lib/session"
import InviteAcceptClient from "./InviteAcceptClient"

type Props = { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const { userId } = await auth()

  // Fetch the invitation
  const [invite] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  // Fetch workspace name for display
  const workspace = invite
    ? await db
        .select({ name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, invite.workspaceId))
        .limit(1)
        .then((r) => r[0])
    : null

  // Fetch inviter name
  const inviter = invite
    ? await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, invite.invitedById))
        .limit(1)
        .then((r) => r[0])
    : null

  // Invalid / expired / revoked
  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return (
      <InviteAcceptClient
        state="invalid"
        reason={
          !invite
            ? "This invitation link is invalid or has already been used."
            : invite.status === "ACCEPTED"
            ? "This invitation has already been accepted."
            : invite.status === "REVOKED"
            ? "This invitation has been revoked."
            : "This invitation has expired."
        }
      />
    )
  }

  // Not signed in — show sign-in prompt
  if (!userId) {
    return (
      <InviteAcceptClient
        state="unauthenticated"
        token={token}
        workspaceName={workspace?.name ?? "a workspace"}
        inviterName={inviter?.name ?? "Someone"}
      />
    )
  }

  // Signed in — ensure user is in DB, then accept
  const session = await requireAuth()

  try {
    await acceptInvitation(token, session.user.id)
  } catch {
    // Already a member — still redirect gracefully
  }

  redirect("/dashboard?invited=1")
}
