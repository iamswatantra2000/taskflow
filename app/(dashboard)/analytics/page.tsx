// app/(dashboard)/analytics/page.tsx
import { requireAuth } from "@/lib/session"
import { getAnalyticsData } from "@/lib/analytics"
import { AnalyticsClient } from "../../../components/features/AnalyticsClient"
import { BarChart2 } from "lucide-react"

export default async function AnalyticsPage() {
  const session = await requireAuth()
  const data    = await getAnalyticsData(session.user.id!)

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No workspace found</p>
      </div>
    )
  }

  return <AnalyticsClient data={data} />
}