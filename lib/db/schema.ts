// lib/db/schema.ts
import {
  pgTable, pgEnum, text, timestamp, boolean, uniqueIndex
} from "drizzle-orm/pg-core"

// ——— Enums ———
export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "MEMBER"])
export const statusEnum = pgEnum("status", ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"])

// ——— Users ———
export const users = pgTable("users", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name"),
  email:         text("email").notNull().unique(),
  password:      text("password"),
  image:         text("image"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
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

// ——— NextAuth tables ———
export const accounts = pgTable("accounts", {
  id:                text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:            text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken:      text("refresh_token"),
  accessToken:       text("access_token"),
  expiresAt:         text("expires_at"),
  tokenType:         text("token_type"),
  scope:             text("scope"),
  idToken:           text("id_token"),
  sessionState:      text("session_state"),
})

export const sessions = pgTable("sessions", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("session_token").notNull().unique(),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires").notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull().unique(),
  expires:    timestamp("expires").notNull(),
})

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