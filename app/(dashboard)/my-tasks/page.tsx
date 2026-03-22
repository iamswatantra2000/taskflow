// app/(dashboard)/my-tasks/page.tsx
import { requireAuth } from "../../../lib/session"
import { db, tasks, projects } from "@/lib/db"
import { eq } from "drizzle-orm"
import { DeleteTaskButton } from "@/components/features/DeleteTaskButton"

const statusConfig = {
  TODO:        { label: "Todo",        class: "bg-[#1a1a1a] text-[#888] border-[#2a2a2a]"            },
  IN_PROGRESS: { label: "In progress", class: "bg-indigo-950 text-indigo-400 border-indigo-900"      },
  IN_REVIEW:   { label: "In review",   class: "bg-amber-950 text-amber-400 border-amber-900"         },
  DONE:        { label: "Done",        class: "bg-emerald-950 text-emerald-400 border-emerald-900"   },
  CANCELLED:   { label: "Cancelled",   class: "bg-red-950 text-red-400 border-red-900"               },
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
      <div className="h-[50px] border-b border-[#1a1a1a] flex items-center px-5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#555]">Workspace /</span>
          <span className="text-[13px] font-medium text-[#e0e0e0]">My tasks</span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-[18px] font-semibold text-[#f0f0f0] tracking-tight">
            My tasks
          </h1>
          <p className="text-[13px] text-[#555] mt-1">
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
                <span className="text-[11px] text-[#444]">{groupTasks.length}</span>
              </div>

              <div className="space-y-1">
                {groupTasks.map((task) => {
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                  return (
                    <div
                      key={task.id}
                      className="group flex items-center gap-4 bg-[#111] border border-[#1a1a1a] rounded-[8px] px-4 py-3 hover:border-[#2a2a2a] transition-colors"
                    >
                      {/* Color dot from project */}
                      <div
                        className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                        style={{ background: task.projectColor ?? "#6366f1" }}
                      />

                      {/* Title */}
                      <p className="flex-1 text-[13px] text-[#ccc]">{task.title}</p>

                      {/* Project name */}
                      <span className="text-[11px] text-[#444] hidden sm:block">
                        {task.projectName}
                      </span>

                      {/* Priority */}
                      <span className={`text-[11px] font-medium ${priority.class} w-14 text-right`}>
                        {priority.label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span className="text-[11px] text-[#444]">
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
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
              <span className="text-[20px]">✓</span>
            </div>
            <p className="text-[14px] font-medium text-[#555]">No tasks assigned to you</p>
            <p className="text-[12px] text-[#333] mt-1">Tasks assigned to you will appear here</p>
          </div>
        )}

      </div>
    </div>
  )
}