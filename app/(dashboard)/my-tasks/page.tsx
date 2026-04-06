// app/(dashboard)/my-tasks/page.tsx
import { requireAuth } from "../../../lib/session"
import { db, tasks, projects } from "@/lib/db"
import { eq } from "drizzle-orm"
import { DeleteTaskButton } from "@/components/features/DeleteTaskButton"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

const statusConfig = {
  TODO:        { label: "Todo",        class: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-[#1a1a1a] dark:text-[#888] dark:border-[#2a2a2a]"            },
  IN_PROGRESS: { label: "In progress", class: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900"      },
  IN_REVIEW:   { label: "In review",   class: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900"         },
  DONE:        { label: "Done",        class: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900"   },
  CANCELLED:   { label: "Cancelled",   class: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"               },
}

const priorityConfig = {
  LOW:    { label: "Low",    class: "text-emerald-600 dark:text-emerald-400" },
  MEDIUM: { label: "Medium", class: "text-amber-600 dark:text-amber-400"   },
  HIGH:   { label: "High",   class: "text-red-600 dark:text-red-400"       },
  URGENT: { label: "Urgent", class: "text-red-600 dark:text-red-400"       },
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
      <div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-5 md:px-5 bg-white dark:bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-slate-400 dark:text-[#555] hidden sm:inline">Workspace /</span>
          <span className="text-[13px] font-medium text-slate-800 dark:text-[#e0e0e0]">My tasks</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900 dark:text-[#f0f0f0] tracking-tight">
            My tasks
          </h1>
          <p className="text-[13px] text-slate-400 dark:text-[#555] mt-1">
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
                <span className="text-[11px] text-slate-400 dark:text-[#444]">{groupTasks.length}</span>
              </div>

              <div className="space-y-1">
                {groupTasks.map((task) => {
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 sm:gap-4 bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1a1a1a] rounded-[8px] px-3 sm:px-4 py-3 hover:border-slate-200 dark:hover:border-[#2a2a2a] transition-colors"
                    >
                      {/* Color dot from project */}
                      <div
                        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                        style={{ background: task.projectColor ?? "#6366f1" }}
                      />

                      {/* Title */}
                      <p className="flex-1 text-[13px] text-slate-700 dark:text-[#ccc]">{task.title}</p>

                      {/* Project name */}
                      <span className="text-[11px] text-slate-400 dark:text-[#444] hidden sm:block">
                        {task.projectName}
                      </span>

                      {/* Priority */}
                      <span className={`text-[11px] font-medium ${priority.class} w-14 text-right`}>
                        {priority.label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span className="text-[11px] text-slate-400 dark:text-[#444] hidden sm:block">
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
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
              <span className="text-[20px]">✓</span>
            </div>
            <p className="text-[14px] font-medium text-slate-400 dark:text-[#555]">No tasks assigned to you</p>
            <p className="text-[12px] text-slate-300 dark:text-[#333] mt-1">Tasks assigned to you will appear here</p>
          </div>
        )}

      </div>
    </div>
  )
}