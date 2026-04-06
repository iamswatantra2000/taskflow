// components/features/TaskBoard.tsx
"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarDays, ArrowDownToLine, Clock, Focus } from "lucide-react"
import { getDecayLevel, getDecayDays, decayBorderClass, decayBadgeClass } from "@/lib/decay"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskDetailDialog } from "./TaskDetailDialog"
import { TaskProjectMenu } from "./TaskProjectMenu"
import { FocusMode } from "./FocusMode"
import { updateTaskStatus, reassignTask } from "@/lib/actions"
import { AssigneeButton } from "./AssigneeButton"
import { toast } from "sonner"
import type { FilterState } from "./BoardFilters"
import { fireConfetti } from "@/lib/confetti"

type Task = {
  id:          string
  title:       string
  description: string | null
  status:      string
  priority:    string
  assigneeId:  string | null
  projectId:   string
  dueDate:     Date | null
  updatedAt:   Date | null
}

type Column = {
  id:    string
  label: string
  tasks: Task[]
  dot:   string
}

type Props = {
  columns:       Column[]
  userName:      string
  filters:       FilterState
  workspaceId:   string
  projects:      { id: string; name: string; color: string }[]
  members:       { id: string; name: string }[]
  currentUserId: string
}

const priorityConfig = {
  URGENT: { label: "Urgent", dot: "bg-red-500",    pill: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/[0.08] dark:text-red-400 dark:border-red-500/20"             },
  HIGH:   { label: "High",   dot: "bg-orange-500", pill: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/[0.08] dark:text-orange-400 dark:border-orange-500/20" },
  MEDIUM: { label: "Medium", dot: "bg-amber-500",  pill: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/[0.08] dark:text-amber-400 dark:border-amber-500/20"   },
  LOW:    { label: "Low",    dot: "bg-sky-500",    pill: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/[0.08] dark:text-sky-400 dark:border-sky-500/20"             },
}

function getDateMeta(dueDate: Date, status: string) {
  const now   = new Date(); now.setHours(0, 0, 0, 0)
  const due   = new Date(dueDate); due.setHours(0, 0, 0, 0)
  const diff  = (due.getTime() - now.getTime()) / 86400000
  const done  = status === "DONE"
  if (!done && diff < 0)  return { color: "text-red-400",   label: new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
  if (!done && diff === 0) return { color: "text-amber-400", label: "Today" }
  return { color: "text-slate-400 dark:text-[#555]", label: new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
}

// Per-column color treatment
const columnStyles: Record<string, {
  bg:          string
  borderColor: string
  labelColor:  string
  countStyle:  string
}> = {
  TODO:        { bg: "bg-slate-50 dark:bg-[#0f0f0f]",                   borderColor: "border-slate-200 dark:border-white/[0.07]",    labelColor: "text-slate-500 dark:text-[#777]",    countStyle: "text-slate-400 border-slate-200 bg-white dark:text-[#3a3a3a] dark:border-white/[0.08] dark:bg-white/[0.03]"           },
  IN_PROGRESS: { bg: "bg-indigo-50/40 dark:bg-indigo-950/[0.15]",       borderColor: "border-indigo-200 dark:border-indigo-500/20",   labelColor: "text-indigo-600 dark:text-indigo-400", countStyle: "text-indigo-600/70 border-indigo-200 bg-indigo-50 dark:text-indigo-400/60 dark:border-indigo-500/20 dark:bg-indigo-500/[0.07]" },
  IN_REVIEW:   { bg: "bg-amber-50/40 dark:bg-amber-950/[0.12]",         borderColor: "border-amber-200 dark:border-amber-500/20",    labelColor: "text-amber-600 dark:text-amber-400",  countStyle: "text-amber-600/70 border-amber-200 bg-amber-50 dark:text-amber-400/60 dark:border-amber-500/20 dark:bg-amber-500/[0.07]"   },
  DONE:        { bg: "bg-emerald-50/30 dark:bg-emerald-950/[0.10]",     borderColor: "border-emerald-200 dark:border-emerald-500/15",  labelColor: "text-emerald-600 dark:text-emerald-400", countStyle: "text-emerald-600/70 border-emerald-200 bg-emerald-50 dark:text-emerald-400/60 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07]" },
}

// ——— Single draggable task card ———
function TaskCard({
  task,
  onSelect,
  onFocus,
  projects,
  members,
  onAssign,
}: {
  task:     Task
  onSelect: (task: Task) => void
  onFocus:  (task: Task) => void
  projects: { id: string; name: string; color: string }[]
  members:  { id: string; name: string }[]
  onAssign: (taskId: string, newId: string | null) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const priority   = priorityConfig[task.priority as keyof typeof priorityConfig]
  const project    = projects.find((p) => p.id === task.projectId)
  const dateMeta   = task.dueDate ? getDateMeta(task.dueDate, task.status) : null
  const isDone     = task.status === "DONE"
  const decayLevel = getDecayLevel(task.updatedAt, task.status, task.dueDate)
  const decayDays  = decayLevel > 0 ? getDecayDays(task.updatedAt, task.dueDate) : 0

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const leftAccent =
    task.status === "IN_PROGRESS" ? "border-l-[3px] border-l-indigo-500" :
    task.status === "IN_REVIEW"   ? "border-l-[3px] border-l-amber-500"  :
    task.status === "DONE"        ? "border-l-[3px] border-l-emerald-500" : ""

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-[#111] rounded-[10px] p-3.5
        hover:bg-slate-50 dark:hover:bg-[#141414]
        hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.45)]
        transition-all duration-150 border
        ${menuOpen ? "z-[20]" : ""}
        ${decayLevel > 0 ? decayBorderClass[decayLevel] : "border-slate-100 dark:border-white/[0.07] hover:border-slate-200 dark:hover:border-white/[0.13]"}
        ${decayLevel === 3 ? "animate-pulse-slow" : ""}
        ${leftAccent}
        ${isDone ? "opacity-55" : ""}
      `}
    >
      {/* Top row: drag handle + title + action buttons */}
      <div className="flex items-start gap-2 mb-3">
        {/* Drag handle — only visible on hover */}
        <div
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="flex-shrink-0 mt-[3px] cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:text-[#333] dark:hover:text-[#666] opacity-0 group-hover:opacity-100 transition-all"
        >
          {/** biome-ignore lint/a11y/noSvgWithoutTitle: drag handle */}
          <svg width="9" height="13" viewBox="0 0 10 14" fill="none">
            <circle cx="2"  cy="2"  r="1.3" fill="currentColor"/>
            <circle cx="8"  cy="2"  r="1.3" fill="currentColor"/>
            <circle cx="2"  cy="7"  r="1.3" fill="currentColor"/>
            <circle cx="8"  cy="7"  r="1.3" fill="currentColor"/>
            <circle cx="2"  cy="12" r="1.3" fill="currentColor"/>
            <circle cx="8"  cy="12" r="1.3" fill="currentColor"/>
          </svg>
        </div>

        {/** biome-ignore lint/a11y/useKeyWithClickEvents: intentional */}
        <p
          onClick={() => onSelect(task)}
          className={`flex-1 text-[13px] font-semibold leading-snug cursor-pointer transition-colors
            ${isDone
              ? "text-slate-400 dark:text-[#555] line-through decoration-slate-300 dark:decoration-[#444]"
              : "text-slate-800 hover:text-slate-950 dark:text-[#ddd] dark:hover:text-white"
            }`}
        >
          {task.title}
        </p>

        {/* Action buttons — top right, hidden until hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFocus(task) }}
            title="Focus on this task"
            className="w-6 h-6 rounded-[5px] flex items-center justify-center text-slate-400 hover:text-indigo-500 dark:text-[#444] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
            <Focus size={11} />
          </button>
          <TaskProjectMenu
            taskId={task.id}
            currentProjectId={task.projectId}
            projects={projects}
            onOpenChange={setMenuOpen}
          />
          <DeleteTaskButton taskId={task.id} />
        </div>
      </div>

      {/* Bottom row: priority badge + date + assignee */}
      <div className="flex items-center justify-between gap-2 pl-[17px]">

        {/* Priority pill with colored dot */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-[3px] rounded-full border ${priority.pill}`}>
            <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${priority.dot}`} />
            {priority.label}
          </div>

          {/* Decay badge */}
          {decayLevel > 0 && (
            <div
              title={`No activity for ${decayDays} day${decayDays !== 1 ? "s" : ""}`}
              className={`inline-flex items-center gap-[3px] text-[10px] font-semibold px-1.5 py-[3px] rounded-full border ${decayBadgeClass[decayLevel]}`}
            >
              <Clock size={8} className="flex-shrink-0" />
              {decayDays}d
            </div>
          )}
        </div>

        {/* Right side: date + assignee */}
        <div className="flex items-center gap-2 ml-auto">
          {dateMeta && (
            <div className={`flex items-center gap-1 ${dateMeta.color}`}>
              <CalendarDays size={10} className="flex-shrink-0" />
              <span className="text-[10.5px] font-medium">{dateMeta.label}</span>
            </div>
          )}

          {/* Project color dot */}
          {project && (
            <div
              title={project.name}
              className="w-[6px] h-[6px] rounded-full opacity-60 flex-shrink-0"
              style={{ background: project.color }}
            />
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
}

// ——— Overlay card shown while dragging ———
function DragOverlayCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
  return (
    <div className="bg-white dark:bg-[#141414] border border-indigo-300 dark:border-indigo-500/60 rounded-[10px] p-3.5 w-[230px] rotate-[1.5deg] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-indigo-200 dark:ring-indigo-500/20">
      <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug mb-3 pl-[17px]">{task.title}</p>
      <div className="pl-[17px]">
        <div className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2 py-[3px] rounded-full border ${priority.pill}`}>
          <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${priority.dot}`} />
          {priority.label}
        </div>
      </div>
    </div>
  )
}

// ——— Droppable column wrapper ———
function DroppableColumn({
  col,
  children,
}: {
  col:      Column
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const styles = columnStyles[col.id] ?? columnStyles.TODO

  return (
    <div
      ref={setNodeRef}
      id={col.id}
      className={`border rounded-[10px] p-3 flex flex-col gap-2 min-h-[200px] transition-colors ${
        isOver
          ? "bg-indigo-950/25 border-indigo-500/50"
          : `${styles.bg} ${styles.borderColor}`
      }`}
    >
      {children}
    </div>
  )
}

// ——— Main board ———
export function TaskBoard({ columns, userName, filters, workspaceId, projects, members, currentUserId }: Props) {
  const [selectedTask, setSelectedTask]     = useState<Task | null>(null)
  const [activeTask, setActiveTask]         = useState<Task | null>(null)
  const [focusTask, setFocusTask]           = useState<Task | null>(null)
  const [boardColumns, setBoardColumns]     = useState<Column[]>(columns)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    setBoardColumns(columns)
  }, [columns])

  // ← Delayed celebration effect
  useEffect(() => {
    const allDone    = boardColumns.every((col) =>
      col.id !== "DONE" ? col.tasks.length === 0 : true
    )
    const totalTasks = boardColumns.reduce((sum, col) => sum + col.tasks.length, 0)

    if (allDone && totalTasks > 0) {
      // Wait 1.5s before showing celebration screen
      const timer = setTimeout(() => {
        setShowCelebration(true)
        fireConfetti()
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setShowCelebration(false)
    }
  }, [boardColumns])

  const filteredColumns = boardColumns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) => {
      const matchesPriority =
        filters.priority.length === 0 ||
        filters.priority.includes(task.priority)

      const matchesSearch =
        !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase())

      return matchesPriority && matchesSearch
    }),
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  )

  function findColumnOfTask(taskId: string) {
    return boardColumns.find((col) => col.tasks.some((t) => t.id === taskId))
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task
    setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id as string

    const activeColumn = findColumnOfTask(activeId)
    const overColumn   =
      boardColumns.find((c) => c.id === overId) ?? findColumnOfTask(overId)

    if (!activeColumn || !overColumn) return
    if (activeColumn.id === overColumn.id) return

    setBoardColumns((prev) => {
      const movingTask = prev
        .find((c) => c.id === activeColumn.id)!
        .tasks.find((t) => t.id === activeId)!

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) }
        }
        if (col.id === overColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, { ...movingTask, status: overColumn.id }],
          }
        }
        return col
      })
    })
  }

  async function handleAssign(taskId: string, newId: string | null) {
    setBoardColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => t.id === taskId ? { ...t, assigneeId: newId } : t),
      }))
    )
    try {
      await reassignTask(taskId, newId)
    } catch {
      toast.error("Failed to reassign task")
      setBoardColumns(columns)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id as string

    const finalColumn =
      boardColumns.find((c) => c.id === overId) ?? findColumnOfTask(overId)

    if (!finalColumn) return

    const originalColumn = columns.find((c) =>
      c.tasks.some((t) => t.id === activeId)
    )

    if (originalColumn?.id !== finalColumn.id) {
      toast.success(`Moved to ${finalColumn.label}`, {
        description: "Status updated successfully.",
      })
      if (finalColumn.id === "DONE") {
        fireConfetti()
      }
    }

    await updateTaskStatus(activeId, finalColumn.id)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* 🎉 All caught up state — shows after 1.5s delay */}
        {showCelebration ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-[18px] font-bold text-foreground mb-2">
              You are all caught up!
            </h3>
            <p className="text-[13px] text-muted-foreground max-w-sm">
              All tasks are done. Time to celebrate — or create new ones!
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] text-emerald-400 font-medium">
                All tasks completed
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredColumns.map((col) => (
              <SortableContext
                key={col.id}
                id={col.id}
                items={col.tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn col={col}>

                  {/* Column header */}
                  {(() => {
                    const staleCount = col.tasks.filter(
                      (t) => getDecayLevel(t.updatedAt, t.status, t.dueDate) > 0
                    ).length
                    return (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                          <span className={`text-[12px] font-semibold tracking-tight ${(columnStyles[col.id] ?? columnStyles.TODO).labelColor}`}>
                            {col.label}
                          </span>
                          {staleCount > 0 && (
                            <div
                              title={`${staleCount} stale task${staleCount !== 1 ? "s" : ""} — no activity in 3+ days`}
                              className="inline-flex items-center gap-[3px] text-[9.5px] font-semibold px-1.5 py-[2px] rounded-full border text-amber-600/80 bg-amber-50 border-amber-200/80 dark:text-amber-400/70 dark:bg-amber-500/[0.07] dark:border-amber-500/20"
                            >
                              <Clock size={8} />
                              {staleCount}
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-[2px] rounded-full border ${(columnStyles[col.id] ?? columnStyles.TODO).countStyle}`}>
                          {col.tasks.length}
                        </span>
                      </div>
                    )
                  })()}

                  {/* Task cards */}
                  {col.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSelect={setSelectedTask}
                      onFocus={setFocusTask}
                      projects={projects}
                      members={members}
                      onAssign={handleAssign}
                    />
                  ))}

                  {/* Empty state */}
                  {col.tasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-slate-200 dark:border-white/[0.05] rounded-[10px]">
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-200 dark:border-white/[0.08] flex items-center justify-center">
                        <ArrowDownToLine size={13} className="text-slate-400 dark:text-[#2a2a2a]" />
                      </div>
                      <p className="text-[11.5px] font-medium text-slate-500 dark:text-[#2d2d2d]">
                        {filters.priority.length > 0 || filters.search
                          ? "No matching tasks"
                          : "Drop tasks here"
                        }
                      </p>
                    </div>
                  )}

                </DroppableColumn>
              </SortableContext>
            ))}
          </div>
        )}

        <DragOverlay>
          {activeTask && <DragOverlayCard task={activeTask} />}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          members={members}
          currentUserId={currentUserId}
        />
      )}

      {focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setFocusTask(null)}
        />
      )}
    </>
  )
}