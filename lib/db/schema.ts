// lib/db/schema.ts
import {
  pgTable, pgEnum, text, timestamp, boolean, uniqueIndex
} from "drizzle-orm/pg-core"

export const invitationStatusEnum = pgEnum("invitation_status", ["PENDING", "ACCEPTED", "REVOKED"])

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
  plan:      text("plan").default("free").notNull(), // "free" | "pro" | "enterprise"
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

// ——— Workspace Invitations ———
export const invitations = pgTable("invitations", {
  id:          text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  token:       text("token").notNull().unique(),
  email:       text("email").notNull(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  invitedById: text("invited_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role:        roleEnum("role").default("MEMBER").notNull(),
  status:      invitationStatusEnum("status").default("PENDING").notNull(),
  expiresAt:   timestamp("expires_at").notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
})

export const notificationTypeEnum = pgEnum("notification_type", ["MENTION"])

export const comments = pgTable("comments", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  taskId:    text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content:   text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const notifications = pgTable("notifications", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:      notificationTypeEnum("type").notNull(),
  message:   text("message").notNull(),
  taskId:    text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  commentId: text("comment_id"),
  isRead:    boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

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