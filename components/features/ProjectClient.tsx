// components/features/ProjectClient.tsx
"use client"

import { useState } from "react"
import { LayoutGrid, List, Calendar, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewTaskDialog } from "./NewTaskDialog"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Task = {
  id:          string
  title:       string
  description: string | null
  status:      string
  priority:    string
  assigneeId:  string | null
  projectId:   string
  dueDate:     Date | null
  createdAt:   Date
}

type Project = {
  id:          string
  name:        string
  color:       string
  description: string | null
}

type Props = {
  project:     Project
  tasks:       Task[]
  allProjects: { id: string; name: string; color: string }[]
}

type ViewType = "board" | "calendar" | "timeline"

const priorityConfig = {
  HIGH:   { label: "High",   class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"             },
  URGENT: { label: "Urgent", class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"             },
  MEDIUM: { label: "Medium", class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900"       },
  LOW:    { label: "Low",    class: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" },
}

const statusConfig: Record<string, { label: string; dot: string; border: string }> = {
  TODO:        { label: "Todo",        dot: "bg-slate-400 dark:bg-[#555]",      border: "border-slate-400 dark:border-[#555]"      },
  IN_PROGRESS: { label: "In Progress", dot: "bg-indigo-500",  border: "border-indigo-500"  },
  IN_REVIEW:   { label: "In Review",   dot: "bg-amber-500",   border: "border-amber-500"   },
  DONE:        { label: "Done",        dot: "bg-emerald-500", border: "border-emerald-500" },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatDate(date: Date | null) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  })
}

function isOverdue(date: Date | null) {
  if (!date) return false
  return new Date(date) < new Date()
}

// ——— Board View ———
function BoardView({ tasks, project }: { tasks: Task[]; project: Project }) {
  const columns = [
    { id: "TODO",        label: "Todo",        dot: "bg-slate-400 dark:bg-[#555]"      },
    { id: "IN_PROGRESS", label: "In progress", dot: "bg-indigo-500"  },
    { id: "IN_REVIEW",   label: "In review",   dot: "bg-amber-500"   },
    { id: "DONE",        label: "Done",        dot: "bg-emerald-500" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1a1a1a] rounded-[10px] p-3 flex flex-col gap-2 min-h-[120px]"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-[7px] h-[7px] rounded-full ${col.dot}`} />
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#666]">{col.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-[#444] bg-slate-100 dark:bg-[#1a1a1a] rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
            </div>

            {colTasks.map((task) => {
              const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
              const overdue  = isOverdue(task.dueDate) && task.status !== "DONE"
              return (
                <div
                  key={task.id}
                  className={`group bg-white dark:bg-[#161616] border border-slate-100 dark:border-[#222] rounded-[8px] p-3 hover:border-slate-200 dark:hover:border-[#333] transition-all
                    ${task.status === "IN_PROGRESS" ? "border-l-2 border-l-indigo-500" : ""}
                    ${task.status === "DONE" ? "opacity-50" : ""}
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-[12px] text-slate-700 dark:text-[#ccc] leading-[1.45] flex-1">{task.title}</p>
                    <DeleteTaskButton taskId={task.id} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority?.class}`}>
                      {priority?.label}
                    </span>
                    {task.dueDate && (
                      <span className={`text-[10px] ${overdue ? "text-red-400" : "text-slate-400 dark:text-[#555]"}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {colTasks.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-6">
                <p className="text-[11px] text-slate-300 dark:text-[#333]">No tasks</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ——— Calendar View ———
function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = new Date()

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year:  "numeric",
  })

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getTasksForDay(day: number) {
    return tasks.filter((task) => {
      if (!task.dueDate) return false
      const due = new Date(task.dueDate)
      return (
        due.getFullYear() === year &&
        due.getMonth()    === month &&
        due.getDate()     === day
      )
    })
  }

  const days    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const blanks  = Array.from({ length: firstDay }, (_, i) => i)
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1a1a1a] rounded-[12px] overflow-hidden">

      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1a1a1a]">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 rounded-[6px] border border-slate-200 dark:border-[#2a2a2a] flex items-center justify-center text-slate-400 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#ccc] hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors"
        >
          ‹
        </button>
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0]">{monthName}</h3>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 rounded-[6px] border border-slate-200 dark:border-[#2a2a2a] flex items-center justify-center text-slate-400 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#ccc] hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-[#1a1a1a]">
        {days.map((day) => (
          <div key={day} className="px-2 py-2 text-center">
            <span className="text-[10px] font-medium text-slate-400 dark:text-[#555]">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Blank cells */}
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="min-h-[90px] border-r border-b border-slate-100 dark:border-[#1a1a1a] p-1.5 bg-slate-50 dark:bg-[#0d0d0d]" />
        ))}

        {/* Day cells */}
        {dayNums.map((day) => {
          const dayTasks  = getTasksForDay(day)
          const isToday   = (
            today.getFullYear() === year &&
            today.getMonth()    === month &&
            today.getDate()     === day
          )

          return (
            <div
              key={day}
              className={`min-h-[90px] border-r border-b border-slate-100 dark:border-[#1a1a1a] p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#141414] ${
                isToday ? "bg-indigo-50 dark:bg-indigo-950/20" : ""
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-end mb-1">
                <span className={cn(
                  "text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full",
                  isToday
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 dark:text-[#555]"
                )}>
                  {day}
                </span>
              </div>

              {/* Tasks for this day */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => {
                  const status  = statusConfig[task.status]
                  const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
                  return (
                    <div
                      key={task.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded-[4px] truncate border-l-2 ${
                        task.status === "DONE"
                          ? "bg-emerald-50 text-emerald-700/60 border-emerald-300 line-through dark:bg-emerald-950/30 dark:text-emerald-400/60 dark:border-emerald-800"
                          : overdue
                          ? "bg-red-50 text-red-600 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                          : "bg-indigo-50 text-indigo-600 border-indigo-300 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-700"
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  )
                })}
                {dayTasks.length > 3 && (
                  <p className="text-[9px] text-slate-400 dark:text-[#555] pl-1">
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* No tasks with due dates message */}
      {tasks.filter((t) => t.dueDate).length === 0 && (
        <div className="p-6 text-center border-t border-slate-100 dark:border-[#1a1a1a]">
          <p className="text-[12px] text-slate-400 dark:text-[#444]">
            No tasks with due dates yet. Add due dates when creating tasks to see them here.
          </p>
        </div>
      )}
    </div>
  )
}

// ——— Timeline View ———
function TimelineView({ tasks }: { tasks: Task[] }) {
  const tasksWithDates = tasks.filter((t) => t.dueDate)

  if (tasksWithDates.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1a1a1a] rounded-[12px] p-12 text-center">
        <GitBranch size={32} className="text-slate-300 dark:text-[#333] mx-auto mb-3" />
        <p className="text-[13px] text-slate-400 dark:text-[#555]">No tasks with due dates</p>
        <p className="text-[11px] text-slate-400 dark:text-[#444] mt-1">
          Add due dates to tasks to see them on the timeline
        </p>
      </div>
    )
  }

  // Get date range
  const dates     = tasksWithDates.map((t) => new Date(t.dueDate!))
  const minDate   = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate   = new Date(Math.max(...dates.map((d) => d.getTime())))

  // Expand range by 2 days on each side
  minDate.setDate(minDate.getDate() - 2)
  maxDate.setDate(maxDate.getDate() + 2)

  const totalDays = Math.ceil(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  // Generate day headers
  const dayHeaders = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(minDate)
    date.setDate(date.getDate() + i)
    return date
  })

  function getTaskPosition(task: Task) {
    if (!task.dueDate) return { left: 0, width: 0 }
    const due      = new Date(task.dueDate)
    const created  = new Date(task.createdAt)
    const startDay = Math.max(
      0,
      Math.floor((created.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    const endDay = Math.floor(
      (due.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const left  = (startDay / totalDays) * 100
    const width = Math.max(2, ((endDay - startDay + 1) / totalDays) * 100)
    return { left, width }
  }

  const today       = new Date()
  const todayOffset = Math.floor(
    (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const todayLeft = (todayOffset / totalDays) * 100

  return (
    <div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1a1a1a] rounded-[12px] overflow-hidden">

      {/* Timeline header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1a1a1a]">
        <h3 className="text-[13px] font-semibold text-slate-800 dark:text-[#e0e0e0]">Timeline</h3>
        <p className="text-[11px] text-slate-400 dark:text-[#555] mt-0.5">
          Task duration from creation to due date
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">

          {/* Day headers */}
          <div className="flex border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50 dark:bg-[#0d0d0d]">
            <div className="w-[200px] flex-shrink-0 px-4 py-2">
              <span className="text-[10px] text-slate-400 dark:text-[#444]">Task</span>
            </div>
            <div className="flex-1 relative h-8">
              {dayHeaders.map((date, i) => {
                const isToday = (
                  date.getFullYear() === today.getFullYear() &&
                  date.getMonth()    === today.getMonth()    &&
                  date.getDate()     === today.getDate()
                )
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={i}
                    className="absolute top-0 h-full flex items-center"
                    style={{ left: `${(i / totalDays) * 100}%` }}
                  >
                    <span className={cn(
                      "text-[9px] font-medium",
                      isToday ? "text-indigo-400" : "text-slate-400 dark:text-[#444]"
                    )}>
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task rows */}
          {tasksWithDates.map((task) => {
            const { left, width } = getTaskPosition(task)
            const priority        = priorityConfig[task.priority as keyof typeof priorityConfig]
            const overdue         = isOverdue(task.dueDate) && task.status !== "DONE"
            const status          = statusConfig[task.status]

            return (
              <div
                key={task.id}
                className="flex items-center border-b border-slate-100 dark:border-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#141414] transition-colors group"
              >
                {/* Task name */}
                <div className="w-[200px] flex-shrink-0 px-4 py-3 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status?.dot}`} />
                  <p className="text-[12px] text-slate-700 dark:text-[#ccc] truncate">{task.title}</p>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-[40px]">
                  {/* Today line */}
                  {todayLeft >= 0 && todayLeft <= 100 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-indigo-500/50 z-10"
                      style={{ left: `${todayLeft}%` }}
                    />
                  )}

                  {/* Task bar */}
                  <div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center px-2 text-[10px] font-medium text-white transition-all",
                      task.status === "DONE"
                        ? "bg-emerald-700 opacity-60"
                        : overdue
                        ? "bg-red-700"
                        : "bg-indigo-600 hover:bg-indigo-500"
                    )}
                    style={{
                      left:     `${left}%`,
                      width:    `${width}%`,
                      minWidth: "8px",
                    }}
                    title={`${task.title} — Due ${formatDate(task.dueDate)}`}
                  >
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>

                {/* Due date + priority */}
                <div className="w-[120px] flex-shrink-0 px-4 flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority?.class}`}>
                    {priority?.label}
                  </span>
                  {task.dueDate && (
                    <span className={`text-[10px] ${overdue ? "text-red-400" : "text-slate-400 dark:text-[#555]"}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}

// ——— Main ProjectClient ———
export function ProjectClient({ project, tasks, allProjects }: Props) {
  const [view, setView] = useState<ViewType>("board")

  const views = [
    { id: "board",    label: "Board",    icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: Calendar   },
    { id: "timeline", label: "Timeline", icon: GitBranch  },
  ]

  const todoTasks       = tasks.filter((t) => t.status === "TODO")
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS")
  const doneTasks       = tasks.filter((t) => t.status === "DONE")

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-4 md:px-5 bg-white dark:bg-[#0d0d0d] sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] text-slate-400 dark:text-[#555] hidden sm:inline">Projects /</span>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <span className="text-[13px] font-medium text-slate-800 dark:text-[#e0e0e0] truncate">{project.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View switcher */}
          <div className="flex items-center bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] p-0.5">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id as ViewType)}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all",
                  view === v.id
                    ? "bg-slate-200 dark:bg-[#2a2a2a] text-slate-800 dark:text-[#e0e0e0]"
                    : "text-slate-400 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#999]"
                )}
              >
                <v.icon size={13} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <NewTaskDialog projectId={project.id}>
            <div className="h-7 px-2 sm:px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-md cursor-pointer flex items-center font-medium transition-colors">
              <span className="hidden sm:inline">+ New task</span>
              <span className="sm:hidden">+</span>
            </div>
          </NewTaskDialog>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Project header */}
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-[10px] flex-shrink-0"
            style={{ background: project.color }}
          />
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 dark:text-[#f0f0f0] tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-[13px] text-slate-500 dark:text-[#555] mt-1">{project.description}</p>
            )}
            <p className="text-[12px] text-slate-400 dark:text-[#444] mt-1">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total",       value: tasks.length,         color: "text-slate-800 dark:text-[#e0e0e0]"   },
            { label: "In progress", value: inProgressTasks.length, color: "text-indigo-400"  },
            { label: "Completed",   value: doneTasks.length,     color: "text-emerald-400" },
            { label: "Todo",        value: todoTasks.length,     color: "text-amber-400"   },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[10px] p-4">
              <p className="text-[11px] font-medium text-slate-400 dark:text-[#555] mb-2">{stat.label}</p>
              <p className={`text-[26px] font-semibold tracking-tight leading-none ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* View content */}
        {view === "board"    && <BoardView    tasks={tasks} project={project} />}
        {view === "calendar" && <CalendarView tasks={tasks} />}
        {view === "timeline" && <TimelineView tasks={tasks} />}

      </div>
    </div>
  )
}