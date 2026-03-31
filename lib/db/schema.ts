// lib/db/schema.ts
import {
  pgTable, pgEnum, text, timestamp, boolean, uniqueIndex
} from "drizzle-orm/pg-core"

// ——— Enums ———
export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "MEMBER"])
export const statusEnum = pgEnum("status", ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])

// ——— Users (identity managed by Clerk; id = Clerk userId) ———
export const users = pgTable("users", {
  id:        text("id").primaryKey(),               // Clerk userId (user_xxx)
  name:      text("name"),
  email:     text("email").notNull().unique(),
  image:     text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ——— Workspaces ———
export const workspaces = pgTable("workspaces", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      text("name").notNull(),
  slug:      text("slug").notNull().unique(),
  ownerId:   text("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ——— Workspace Members ———
export const workspaceMembers = pgTable("workspace_members", {
  id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:      text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  role:        roleEnum("role").default("MEMBER").notNull(),
  joinedAt:    timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  uniq: uniqueIndex("uniq_member").on(t.userId, t.workspaceId),
}))

// ——— Projects ———
export const projects = pgTable("projects", {
  id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:        text("name").notNull(),
  description: text("description"),
  color:       text("color").default("#6366f1").notNull(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
})

// ——— Tasks ———
export const tasks = pgTable("tasks", {
  id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title:       text("title").notNull(),
  description: text("description"),
  status:      statusEnum("status").default("TODO").notNull(),
  priority:    priorityEnum("priority").default("MEDIUM").notNull(),
  dueDate:     timestamp("due_date"),
  projectId:   text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  assigneeId:  text("assignee_id").references(() => users.id),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
  
})

// NextAuth tables removed — authentication is now handled by Clerk

// lib/db/schema.ts — add this at the bottom

export const activityTypeEnum = pgEnum("activity_type", [
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_DELETED",
  "TASK_MOVED",
  "PROJECT_CREATED",
  "MEMBER_JOINED",
])

export const activities = pgTable("activities", {
  id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type:        activityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  userId:      text("user_id").references(() => users.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  taskId:      text("task_id"),
  projectId:   text("project_id"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
})