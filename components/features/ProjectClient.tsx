// components/features/ProjectClient.tsx
"use client"

import { useState } from "react"
import { LayoutGrid, Calendar, GitBranch, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { cn } from "@/lib/utils"
import { NewTaskDialog } from "./NewTaskDialog"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { PresenceAvatars } from "./PresenceAvatars"
import { getDecayLevel, getDecayDays, decayBorderClass, decayBadgeClass } from "@/lib/decay"
import { AssigneeButton } from "./AssigneeButton"
import { reassignTask } from "@/lib/actions"
import { toast } from "sonner"

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
  updatedAt:   Date | null
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
  currentUser: { userId: string; name: string }
  members:     { id: string; name: string }[]
}

type ViewType = "board" | "calendar" | "timeline"

const priorityConfig = {
  HIGH:   { label: "High",   class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"             },
  URGENT: { label: "Urgent", class: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"             },
  MEDIUM: { label: "Medium", class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900"       },
  LOW:    { label: "Low",    class: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900" },
}

const statusConfig: Record<string, { label: string; dot: string; border: string }> = {
  TODO:        { label: "Todo",        dot: "bg-slate-400 dark:bg-[var(--tf-text-tertiary)]",      border: "border-slate-400 dark:border-[var(--tf-border)]"      },
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
function BoardView({
  tasks,
  project,
  members,
  onAssign,
}: {
  tasks:    Task[]
  project:  Project
  members:  { id: string; name: string }[]
  onAssign: (taskId: string, newId: string | null) => void
}) {
  const columns = [
    { id: "TODO",        label: "Todo",        dot: "bg-slate-400 dark:bg-[var(--tf-text-tertiary)]"      },
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
            className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[10px] p-3 flex flex-col gap-2 min-h-[120px]"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-[7px] h-[7px] rounded-full ${col.dot}`} />
                <span className="text-[11px] font-medium text-[var(--tf-text-secondary)]">{col.label}</span>
              </div>
              <span className="text-[10px] text-[var(--tf-text-tertiary)] bg-slate-100 dark:bg-[var(--tf-bg-dropdown)] rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
            </div>

            {colTasks.map((task) => {
              const priority   = priorityConfig[task.priority as keyof typeof priorityConfig]
              const overdue    = isOverdue(task.dueDate) && task.status !== "DONE"
              const decayLevel = getDecayLevel(task.updatedAt, task.status, task.dueDate)
              const decayDays  = decayLevel > 0 ? getDecayDays(task.updatedAt, task.dueDate) : 0
              return (
                <div
                  key={task.id}
                  className={`group bg-[var(--tf-bg-dropdown)] rounded-[8px] p-3 transition-all border
                    ${decayLevel > 0
                      ? decayBorderClass[decayLevel]
                      : "border-slate-100 dark:border-[var(--tf-border)] hover:border-slate-200 dark:hover:border-[#333]"
                    }
                    ${task.status === "IN_PROGRESS" ? "border-l-2 border-l-indigo-500" : ""}
                    ${task.status === "DONE" ? "opacity-50" : ""}
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-[12px] text-[var(--tf-text-primary)] leading-[1.45] flex-1">{task.title}</p>
                    <DeleteTaskButton taskId={task.id} />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority?.class}`}>
                        {priority?.label}
                      </span>
                      {decayLevel > 0 && (
                        <div
                          title={`No activity for ${decayDays} day${decayDays !== 1 ? "s" : ""}`}
                          className={`inline-flex items-center gap-[3px] text-[10px] font-semibold px-1.5 py-[2px] rounded-full border ${decayBadgeClass[decayLevel]}`}
                        >
                          <Clock size={8} className="flex-shrink-0" />
                          {decayDays}d
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {task.dueDate && (
                        <span className={`text-[10px] ${overdue ? "text-red-400" : "text-[var(--tf-text-tertiary)]"}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <AssigneeButton
                        taskId={task.id}
                        assigneeId={task.assigneeId}
                        members={members}
                        onAssign={onAssign}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {colTasks.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-6">
                <p className="text-[11px] text-[var(--tf-text-tertiary)]">No tasks</p>
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
    <div className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[12px] overflow-hidden">

      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--tf-border-subtle)]">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 rounded-[6px] border border-[var(--tf-border)] flex items-center justify-center text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#ccc] hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors"
        >
          ‹
        </button>
        <h3 className="text-[13px] font-semibold text-[var(--tf-text-primary)]">{monthName}</h3>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 rounded-[6px] border border-[var(--tf-border)] flex items-center justify-center text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#ccc] hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--tf-border-subtle)]">
        {days.map((day) => (
          <div key={day} className="px-2 py-2 text-center">
            <span className="text-[10px] font-medium text-[var(--tf-text-tertiary)]">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Blank cells */}
        {blanks.map((i) => (
          <div key={`blank-${i}`} className="min-h-[90px] border-r border-b border-[var(--tf-border-subtle)] p-1.5 bg-[var(--tf-bg-panel)]" />
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
              className={`min-h-[90px] border-r border-b border-[var(--tf-border-subtle)] p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-[var(--tf-bg-card)] ${
                isToday ? "bg-indigo-50 dark:bg-indigo-950/20" : ""
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-end mb-1">
                <span className={cn(
                  "text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full",
                  isToday
                    ? "bg-indigo-600 text-white"
                    : "text-[var(--tf-text-tertiary)]"
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
                  <p className="text-[9px] text-[var(--tf-text-tertiary)] pl-1">
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
        <div className="p-6 text-center border-t border-[var(--tf-border-subtle)]">
          <p className="text-[12px] text-[var(--tf-text-tertiary)]">
            No tasks with due dates yet. Add due dates when creating tasks to see them here.
          </p>
        </div>
      )}
    </div>
  )
}

// ——— Timeline / Gantt View ———
const DAY_PX      = 36   // pixels per day column
const ROW_H       = 44   // px height of each task row
const LABEL_W     = 220  // px width of left label column
const STATUS_BAR: Record<string, string> = {
  TODO:        "bg-slate-400 dark:bg-[var(--tf-text-tertiary)]",
  IN_PROGRESS: "bg-indigo-500",
  IN_REVIEW:   "bg-amber-500",
  DONE:        "bg-emerald-500 opacity-70",
}

function TimelineView({ tasks }: { tasks: Task[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)

  // Build date range: start of this month → last due date + 7d (min 8 weeks visible)
  const hasDates      = tasks.filter((t) => t.dueDate)
  const dueDates      = hasDates.map((t) => new Date(t.dueDate!).getTime())
  const rangeStart    = new Date(today.getFullYear(), today.getMonth(), 1)
  const latestDue     = dueDates.length ? new Date(Math.max(...dueDates)) : new Date(today.getTime() + 56 * 86400000)
  latestDue.setDate(latestDue.getDate() + 7)
  // Ensure at least 8 weeks from rangeStart
  const minEnd = new Date(rangeStart.getTime() + 56 * 86400000)
  const rangeEnd = latestDue > minEnd ? latestDue : minEnd

  const MS_DAY    = 86400000
  const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / MS_DAY) + 1
  const totalW    = totalDays * DAY_PX

  // Today column index
  const todayIdx = Math.floor((today.getTime() - rangeStart.getTime()) / MS_DAY)

  // Generate day array
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(rangeStart.getTime() + i * MS_DAY)
    return d
  })

  // Group days into months for the top header row
  type MonthSegment = { label: string; startIdx: number; span: number }
  const monthSegments: MonthSegment[] = []
  days.forEach((d, i) => {
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    const last  = monthSegments[monthSegments.length - 1]
    if (!last || last.label !== label) {
      monthSegments.push({ label, startIdx: i, span: 1 })
    } else {
      last.span++
    }
  })

  function barProps(task: Task) {
    const due     = task.dueDate ? new Date(task.dueDate) : null
    const created = new Date(task.createdAt); created.setHours(0, 0, 0, 0)
    if (!due) return null
    due.setHours(0, 0, 0, 0)
    const startIdx = Math.max(0, Math.floor((created.getTime() - rangeStart.getTime()) / MS_DAY))
    const endIdx   = Math.max(startIdx, Math.floor((due.getTime() - rangeStart.getTime()) / MS_DAY))
    const left     = startIdx * DAY_PX
    const width    = Math.max(DAY_PX, (endIdx - startIdx + 1) * DAY_PX)
    return { left, width }
  }

  return (
    <div className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[12px] overflow-hidden">

      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-[var(--tf-border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--tf-text-primary)]">Gantt Timeline</h3>
          <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-0.5">
            {hasDates.length} of {tasks.length} task{tasks.length !== 1 ? "s" : ""} have due dates
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] text-[var(--tf-text-tertiary)]">
          {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-[3px] ${STATUS_BAR[s]}`} />
              {statusConfig[s].label}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <div style={{ width: LABEL_W + totalW }} className="relative">

          {/* ── Month header row ── */}
          <div className="flex border-b border-[var(--tf-border-subtle)] bg-[var(--tf-bg-panel)] sticky top-0 z-20">
            <div style={{ width: LABEL_W }} className="flex-shrink-0 px-4 py-2 border-r border-slate-100 dark:border-[var(--tf-border)]">
              <span className="text-[10px] font-medium text-[var(--tf-text-tertiary)]">Task</span>
            </div>
            <div className="flex" style={{ width: totalW }}>
              {monthSegments.map((seg) => (
                <div
                  key={seg.label}
                  style={{ width: seg.span * DAY_PX }}
                  className="flex-shrink-0 px-2 py-2 border-r border-slate-100 dark:border-[var(--tf-border)]"
                >
                  <span className="text-[10px] font-semibold text-[var(--tf-text-tertiary)]">{seg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Day header row ── */}
          <div className="flex border-b border-[var(--tf-border-subtle)] bg-[var(--tf-bg-panel)]">
            <div style={{ width: LABEL_W }} className="flex-shrink-0 border-r border-slate-100 dark:border-[var(--tf-border)]" />
            <div className="flex" style={{ width: totalW }}>
              {days.map((d, i) => {
                const isToday   = i === todayIdx
                const isSunday  = d.getDay() === 0
                const isMonthStart = d.getDate() === 1
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: positional
                    key={i}
                    style={{ width: DAY_PX }}
                    className={cn(
                      "flex-shrink-0 flex items-center justify-center py-1 border-r text-[9px] font-medium",
                      isToday
                        ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40"
                        : isSunday || isMonthStart
                          ? "text-[var(--tf-text-tertiary)] border-slate-200 dark:border-[var(--tf-border)]"
                          : "text-[var(--tf-text-tertiary)] border-slate-100 dark:border-[var(--tf-border)]"
                    )}
                  >
                    {isToday ? (
                      <span className="w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold">{d.getDate()}</span>
                    ) : (
                      d.getDate()
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Task rows ── */}
          {tasks.length === 0 ? (
            <div className="py-16 text-center">
              <GitBranch size={28} className="text-[var(--tf-text-tertiary)] mx-auto mb-3" />
              <p className="text-[13px] text-[var(--tf-text-tertiary)]">No tasks yet</p>
            </div>
          ) : (
            tasks.map((task) => {
              const bar     = barProps(task)
              const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
              const status  = statusConfig[task.status]

              return (
                <div
                  key={task.id}
                  style={{ height: ROW_H }}
                  className="flex items-center border-b border-[var(--tf-border-subtle)] hover:bg-slate-50/60 dark:hover:bg-[var(--tf-bg-hover)] transition-colors group"
                >
                  {/* Label */}
                  <div
                    style={{ width: LABEL_W }}
                    className="flex-shrink-0 px-4 flex items-center gap-2 border-r border-slate-100 dark:border-[var(--tf-border)] h-full"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status?.dot}`} />
                    <p className="text-[12px] text-[var(--tf-text-primary)] truncate flex-1">{task.title}</p>
                    {task.dueDate && (
                      <span className={`text-[10px] flex-shrink-0 hidden sm:block ${overdue ? "text-red-400" : "text-[var(--tf-text-tertiary)]"}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Gantt bar area */}
                  <div className="relative flex-1 h-full" style={{ width: totalW }}>
                    {/* Weekend / month-start shading */}
                    {days.map((d, i) => (d.getDay() === 0 || d.getDay() === 6) && (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: positional
                        key={i}
                        className="absolute top-0 bottom-0 bg-slate-50/60 dark:bg-white/[0.012]"
                        style={{ left: i * DAY_PX, width: DAY_PX }}
                      />
                    ))}

                    {/* Today highlight column */}
                    {todayIdx >= 0 && todayIdx < totalDays && (
                      <div
                        className="absolute top-0 bottom-0 bg-indigo-500/[0.06] dark:bg-indigo-500/[0.04]"
                        style={{ left: todayIdx * DAY_PX, width: DAY_PX }}
                      />
                    )}

                    {/* Today vertical line */}
                    {todayIdx >= 0 && todayIdx < totalDays && (
                      <div
                        className="absolute top-0 bottom-0 w-[2px] bg-indigo-500/50 z-10"
                        style={{ left: todayIdx * DAY_PX + DAY_PX / 2 }}
                      />
                    )}

                    {/* Task bar */}
                    {bar ? (
                      <div
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 rounded-[6px] flex items-center px-2.5 text-[10.5px] font-medium text-white shadow-sm transition-all cursor-default",
                          overdue && task.status !== "DONE"
                            ? "bg-red-500 hover:bg-red-400"
                            : task.status === "DONE"
                              ? "bg-emerald-500/70 hover:bg-emerald-500/90"
                              : task.status === "IN_REVIEW"
                                ? "bg-amber-500 hover:bg-amber-400"
                                : task.status === "IN_PROGRESS"
                                  ? "bg-indigo-500 hover:bg-indigo-400"
                                  : "bg-slate-400 hover:bg-slate-500"
                        )}
                        style={{ left: bar.left, width: bar.width, height: 26 }}
                        title={`${task.title} — Due ${formatDate(task.dueDate) ?? "n/a"}`}
                      >
                        <span className="truncate">{task.title}</span>
                      </div>
                    ) : (
                      /* No due date — show a dashed placeholder */
                      <div
                        className="absolute top-1/2 -translate-y-1/2 border border-dashed border-slate-300 dark:border-[var(--tf-border)] rounded-[6px] flex items-center px-2 text-[10px] text-[var(--tf-text-tertiary)]"
                        style={{ left: todayIdx * DAY_PX, width: DAY_PX * 4, height: 24 }}
                        title="No due date"
                      >
                        No due date
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const VIEW_ORDER: ViewType[] = ["board", "calendar", "timeline"]

// ——— Main ProjectClient ———
export function ProjectClient({ project, tasks, allProjects, currentUser, members }: Props) {
  const [view, setView]           = useState<ViewType>("board")
  const [viewDir, setViewDir]     = useState<"right" | "left">("right")
  const [localTasks, setLocalTasks] = useState(tasks)

  function changeView(next: ViewType) {
    const dir = VIEW_ORDER.indexOf(next) >= VIEW_ORDER.indexOf(view) ? "right" : "left"
    setViewDir(dir)
    setView(next)
  }

  async function handleAssign(taskId: string, newId: string | null) {
    setLocalTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, assigneeId: newId } : t)
    )
    try {
      await reassignTask(taskId, newId)
    } catch {
      toast.error("Failed to reassign task")
      setLocalTasks(tasks)
    }
  }

  const views = [
    { id: "board",    label: "Board",    icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: Calendar   },
    { id: "timeline", label: "Timeline", icon: GitBranch  },
  ]

  const todoTasks       = localTasks.filter((t) => t.status === "TODO")
  const inProgressTasks = localTasks.filter((t) => t.status === "IN_PROGRESS")
  const doneTasks       = localTasks.filter((t) => t.status === "DONE")

  return (
    <div className="flex-1 overflow-auto">

      {/* Topbar */}
      <div className="h-[50px] border-b border-[var(--tf-border-subtle)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-card)] sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] text-[var(--tf-text-tertiary)] hidden sm:inline">Projects /</span>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.color }} />
          <span className="text-[13px] font-medium text-[var(--tf-text-primary)] truncate">{project.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View switcher */}
          <div className="flex items-center bg-slate-50 dark:bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[8px] p-0.5">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => changeView(v.id as ViewType)}
                className={cn(
                  "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all",
                  view === v.id
                    ? "bg-slate-200 dark:bg-[var(--tf-bg-dropdown)] text-[var(--tf-text-primary)]"
                    : "text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#999]"
                )}
              >
                <v.icon size={13} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <PresenceAvatars projectId={project.id} currentUser={currentUser} />

          <NewTaskDialog projectId={project.id}>
            <div className="h-7 px-2 sm:px-3 text-xs bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-md cursor-pointer flex items-center font-medium transition-colors">
              <span className="hidden sm:inline">+ New task</span>
              <span className="sm:hidden">+</span>
            </div>
          </NewTaskDialog>
          <ThemeToggle />
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
            <h1 className="text-[18px] font-semibold text-[var(--tf-text-primary)] tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-[13px] text-[var(--tf-text-tertiary)] mt-1">{project.description}</p>
            )}
            <p className="text-[12px] text-[var(--tf-text-tertiary)] mt-1">
              {localTasks.length} task{localTasks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Total",       value: localTasks.length,         color: "text-[var(--tf-text-primary)]"   },
            { label: "In progress", value: inProgressTasks.length, color: "text-indigo-400"  },
            { label: "Completed",   value: doneTasks.length,     color: "text-emerald-400" },
            { label: "Todo",        value: todoTasks.length,     color: "text-amber-400"   },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[10px] p-4">
              <p className="text-[11px] font-medium text-[var(--tf-text-tertiary)] mb-2">{stat.label}</p>
              <p className={`text-[26px] font-semibold tracking-tight leading-none ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* View content */}
        <div
          key={view}
          style={{ animation: `${viewDir === "right" ? "slide-in-from-right" : "slide-in-from-left"} 0.22s ease both` }}
        >
          {view === "board"    && <BoardView    tasks={localTasks} project={project} members={members} onAssign={handleAssign} />}
          {view === "calendar" && <CalendarView tasks={localTasks} />}
          {view === "timeline" && <TimelineView tasks={localTasks} />}
        </div>

      </div>
    </div>
  )
}