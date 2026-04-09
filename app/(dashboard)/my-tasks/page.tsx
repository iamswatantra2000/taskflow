// app/(dashboard)/my-tasks/page.tsx
import { requireAuth } from "../../../lib/session"
import { db, tasks, projects } from "@/lib/db"
import { eq } from "drizzle-orm"
import { DeleteTaskButton } from "@/components/features/DeleteTaskButton"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const statusConfig = {
  TODO:        { label: "Todo",        class: "bg-[var(--tf-bg-hover)] text-[var(--tf-text-secondary)] border-[var(--tf-border)]"            },
  IN_PROGRESS: { label: "In progress", class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"      },
  IN_REVIEW:   { label: "In review",   class: "bg-amber-500/10 text-amber-400 border-amber-500/20"         },
  DONE:        { label: "Done",        class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"   },
  CANCELLED:   { label: "Cancelled",   class: "bg-red-500/10 text-red-400 border-red-500/20"               },
}

const priorityConfig = {
  LOW:    { label: "Low",    class: "text-emerald-400" },
  MEDIUM: { label: "Medium", class: "text-amber-400"   },
  HIGH:   { label: "High",   class: "text-red-400"     },
  URGENT: { label: "Urgent", class: "text-red-400"     },
}

export default async function MyTasksPage() {
  const session = await requireAuth()

const myTasks = await db
  .select({
    id:           tasks.id,
    title:        tasks.title,
    status:       tasks.status,
    priority:     tasks.priority,
    dueDate:      tasks.dueDate,
    description:  tasks.description,
    projectName:  projects.name,
    projectColor: projects.color,
  })
  .from(tasks)
  .leftJoin(projects, eq(tasks.projectId, projects.id))
  .where(eq(tasks.assigneeId, session.user.id!))

  const grouped = {
    TODO:        myTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: myTasks.filter((t) => t.status === "IN_PROGRESS"),
    IN_REVIEW:   myTasks.filter((t) => t.status === "IN_REVIEW"),
    DONE:        myTasks.filter((t) => t.status === "DONE"),
  }

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-[var(--tf-border-subtle)] flex items-center justify-between pl-14 pr-5 md:px-5 bg-[var(--tf-bg-panel)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[var(--tf-text-tertiary)] hidden sm:inline">Workspace /</span>
          <span className="text-[13px] font-medium text-[var(--tf-text-primary)]">My tasks</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--tf-text-primary)] tracking-tight">
            My tasks
          </h1>
          <p className="text-[13px] text-[var(--tf-text-tertiary)] mt-1">
            {myTasks.length} task{myTasks.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>

        {/* Task groups */}
        {Object.entries(grouped).map(([status, groupTasks]) => {
          if (groupTasks.length === 0) return null
          const statusInfo = statusConfig[status as keyof typeof statusConfig]

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[5px] border ${statusInfo.class}`}>
                  {statusInfo.label}
                </span>
                <span className="text-[11px] text-[var(--tf-text-tertiary)]">{groupTasks.length}</span>
              </div>

              <div className="space-y-1">
                {groupTasks.map((task) => {
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 sm:gap-4 bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[8px] px-3 sm:px-4 py-3 hover:border-[var(--tf-border)] transition-colors"
                    >
                      {/* Color dot from project */}
                      <div
                        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                        style={{ background: task.projectColor ?? "#6366f1" }}
                      />

                      {/* Title */}
                      <p className="flex-1 text-[13px] text-[var(--tf-text-primary)]">{task.title}</p>

                      {/* Project name */}
                      <span className="text-[11px] text-[var(--tf-text-tertiary)] hidden sm:block">
                        {task.projectName}
                      </span>

                      {/* Priority */}
                      <span className={`text-[11px] font-medium ${priority.class} w-14 text-right`}>
                        {priority.label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span className="text-[11px] text-[var(--tf-text-tertiary)] hidden sm:block">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {/* Delete */}
                      <DeleteTaskButton taskId={task.id} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {myTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--tf-bg-hover)] flex items-center justify-center mb-4">
              <span className="text-[20px]">✓</span>
            </div>
            <p className="text-[14px] font-medium text-[var(--tf-text-tertiary)]">No tasks assigned to you</p>
            <p className="text-[12px] text-[var(--tf-text-tertiary)] mt-1">Tasks assigned to you will appear here</p>
          </div>
        )}

      </div>
    </div>
  )
}