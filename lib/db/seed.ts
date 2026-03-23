// lib/db/seed.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { users, workspaces, workspaceMembers, projects, tasks } from "./schema"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL ?? "postgresql://localhost:5432/taskflow"

console.log("Connecting to:", connectionString.split("@")[1])

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("supabase") ? { rejectUnauthorized: false } : false,
})

const db = drizzle(pool)

async function seed() {
  console.log("Seeding...")

  const hashedPassword = await bcrypt.hash("password123", 12)

  const [user] = await db.insert(users).values({
    name: "Demo User",
    email: "demo@taskflow.com",
    password: hashedPassword,
  }).returning()

  const [workspace] = await db.insert(workspaces).values({
    name: "Demo Workspace",
    slug: "demo-workspace",
    ownerId: user.id,
  }).returning()

  await db.insert(workspaceMembers).values({
    userId: user.id,
    workspaceId: workspace.id,
    role: "OWNER",
  })

  const [project] = await db.insert(projects).values({
    name: "Website Redesign",
    description: "Redesign the company website",
    workspaceId: workspace.id,
  }).returning()

  await db.insert(tasks).values([
    { title: "Design new homepage",   status: "IN_PROGRESS", priority: "HIGH",   projectId: project.id, assigneeId: user.id },
    { title: "Set up CI/CD pipeline", status: "TODO",        priority: "MEDIUM", projectId: project.id },
    { title: "Write unit tests",      status: "TODO",        priority: "LOW",    projectId: project.id },
    { title: "Update documentation",  status: "DONE",        priority: "LOW",    projectId: project.id },
  ])

  console.log("✓ Done!")
  console.log("  Email:    demo@taskflow.com")
  console.log("  Password: password123")
  await pool.end()
}

seed().catch((e) => { console.error(e); process.exit(1) })