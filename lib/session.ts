import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db, users, workspaces, workspaceMembers, projects } from "@/lib/db"
import { eq } from "drizzle-orm"

type ClerkUser = {
  id: string
  fullName: string | null
  username: string | null
  emailAddresses: { emailAddress: string }[]
}

/**
 * On first Clerk login, create the user row + workspace + default project.
 * On subsequent logins, just return the stored name/email.
 */
async function ensureUserInDb(clerkUser: ClerkUser) {
  const { id: clerkId, fullName, username, emailAddresses } = clerkUser
  const email = emailAddresses[0]?.emailAddress ?? ""
  const name  = fullName ?? username ?? email.split("@")[0] ?? "User"

  const [existing] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, clerkId))
    .limit(1)

  if (existing) return existing

  // First login — create user + workspace + default project
  await db.insert(users).values({ id: clerkId, name, email })

  const slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${clerkId.slice(-6)}`

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: `${name}'s Workspace`, slug, ownerId: clerkId })
    .returning()

  await db.insert(workspaceMembers).values({
    userId: clerkId,
    workspaceId: workspace.id,
    role: "OWNER",
  })

  await db.insert(projects).values({
    name: "My First Project",
    description: "Get started by creating your first tasks",
    color: "#6366f1",
    workspaceId: workspace.id,
  })

  return { name, email }
}

/**
 * Require authentication. Returns { user: { id, name, email } }.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/login")

  const { name, email } = await ensureUserInDb(clerkUser as ClerkUser)

  return {
    user: {
      id:    userId,
      name:  name  ?? "User",
      email: email ?? "",
    },
  }
}

/**
 * Get session without redirecting. Returns null if unauthenticated.
 */
export async function getSession() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  return {
    user: {
      id:    userId,
      name:  clerkUser.fullName ?? clerkUser.username ?? "User",
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
    },
  }
}
