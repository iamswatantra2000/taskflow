// app/(dashboard)/upgrade/page.tsx
import { requireAuth } from "@/lib/session"
import { UpgradeClient } from "@/components/features/UpgradeClient"

export default async function UpgradePage() {
  const session = await requireAuth()

  return (
    <UpgradeClient
      userId={session.user.id}
      currentPlan={session.user.plan ?? "free"}
    />
  )
}
