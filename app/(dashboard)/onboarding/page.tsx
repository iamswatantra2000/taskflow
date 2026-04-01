// app/(dashboard)/onboarding/page.tsx
import { requireAuth } from "@/lib/session"
import { db, workspaceMembers, workspaces } from "@/lib/db"
import { eq } from "drizzle-orm"
import { OnboardingWizard } from "@/components/features/OnboardingWizard"

export default async function OnboardingPage() {
  const session = await requireAuth()

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

  return (
    <OnboardingWizard
      userId={session.user.id!}
      firstName={session.user.name?.split(" ")[0] ?? "there"}
      workspaceId={workspace?.id ?? ""}
      workspaceName={workspace?.name ?? ""}
    />
  )
}
