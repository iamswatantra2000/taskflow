// app/(dashboard)/layout.tsx
import { requireAuth } from "@/lib/session"
import { AppSidebar } from "@/components/features/AppSidebar"
import { db, projects, workspaceMembers } from "@/lib/db"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  // Fetch user's projects for sidebar
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, session.user.id!))
    .limit(1)

  const userProjects = membership
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, membership.workspaceId))
    : []


  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={session.user} projects={userProjects} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}