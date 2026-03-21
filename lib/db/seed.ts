// lib/db/seed.ts
import { db, users, workspaces, workspaceMembers, projects, tasks } from "./index"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("Seeding...")

  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create user
  const [user] = await db.insert(users).values({
    name: "Demo User",
    email: "demo@taskflow.com",
    password: hashedPassword,
  }).returning()

  // Create workspace
  const [workspace] = await db.insert(workspaces).values({
    name: "Demo Workspace",
    slug: "demo-workspace",
    ownerId: user.id,
  }).returning()

  // Add user as owner
  await db.insert(workspaceMembers).values({
    userId: user.id,
    workspaceId: workspace.id,
    role: "OWNER",
  })

  // Create project
  const [project] = await db.insert(projects).values({
    name: "Website Redesign",
    description: "Redesign the company website",
    workspaceId: workspace.id,
  }).returning()

  // Create tasks
  await db.insert(tasks).values([
    { title: "Design new homepage",    status: "IN_PROGRESS", priority: "HIGH",   projectId: project.id, assigneeId: user.id },
    { title: "Set up CI/CD pipeline",  status: "TODO",        priority: "MEDIUM", projectId: project.id },
    { title: "Write unit tests",       status: "TODO",        priority: "LOW",    projectId: project.id },
    { title: "Update documentation",   status: "DONE",        priority: "LOW",    projectId: project.id },
  ])

  console.log("✓ Done!")
  console.log("  Email:    demo@taskflow.com")
  console.log("  Password: password123")
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })