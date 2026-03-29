// app/(dashboard)/layout.tsx
import { requireAuth } from "@/lib/session"
import { AppSidebar } from "@/components/features/AppSidebar"
import { db, projects, workspaceMembers } from "@/lib/db"
import { eq } from "drizzle-orm"
import { CommandPalette } from "@/components/features/CommandPalette"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

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
      {/* Command palette available on ALL dashboard pages */}
      <CommandPalette projects={userProjects} />
    </div>
  )
}