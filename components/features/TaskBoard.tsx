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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DeleteTaskButton } from "./DeleteTaskButton"
import { TaskDetailDialog } from "./TaskDetailDialog"
import { TaskProjectMenu } from "./TaskProjectMenu"
import { updateTaskStatus } from "@/lib/actions"
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
}

type Column = {
  id:    string
  label: string
  tasks: Task[]
  dot:   string
}

type Props = {
  columns:     Column[]
  userName:    string
  filters:     FilterState
  workspaceId: string
  projects:    { id: string; name: string; color: string }[]
}

const priorityConfig = {
  HIGH:   { label: "High",   class: "bg-red-950 text-red-400 border-red-900"             },
  URGENT: { label: "Urgent", class: "bg-red-950 text-red-400 border-red-900"             },
  MEDIUM: { label: "Medium", class: "bg-amber-950 text-amber-400 border-amber-900"       },
  LOW:    { label: "Low",    class: "bg-emerald-950 text-emerald-400 border-emerald-900" },
}

// Per-column color treatment — bg tint + border accent + label color
const columnStyles: Record<string, { bg: string; borderColor: string; labelColor: string }> = {
  TODO:        { bg: "bg-card",                borderColor: "border-border",           labelColor: "text-muted-foreground" },
  IN_PROGRESS: { bg: "bg-indigo-950/[0.18]",   borderColor: "border-indigo-500/25",   labelColor: "text-indigo-400"       },
  IN_REVIEW:   { bg: "bg-amber-950/[0.15]",    borderColor: "border-amber-500/25",    labelColor: "text-amber-400"        },
  DONE:        { bg: "bg-emerald-950/[0.12]",  borderColor: "border-emerald-500/20",  labelColor: "text-emerald-400"      },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ——— Single draggable task card ———
function TaskCard({
  task,
  userName,
  onSelect,
  projects,
}: {
  task:     Task
  userName: string
  onSelect: (task: Task) => void
  projects: { id: string; name: string; color: string }[]
}) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]

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
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border border-border rounded-[8px] p-3 hover:border-border/80 hover:bg-accent/50 transition-all
        ${task.status === "IN_PROGRESS" ? "border-l-2 border-l-indigo-500" : ""}
        ${task.status === "IN_REVIEW"   ? "border-l-2 border-l-amber-500/70" : ""}
        ${task.status === "DONE"        ? "opacity-60" : ""}
      `}
    >
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          {/** biome-ignore lint/a11y/noSvgWithoutTitle: drag handle */}
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <circle cx="2"  cy="2"  r="1.2" fill="currentColor"/>
            <circle cx="8"  cy="2"  r="1.2" fill="currentColor"/>
            <circle cx="2"  cy="7"  r="1.2" fill="currentColor"/>
            <circle cx="8"  cy="7"  r="1.2" fill="currentColor"/>
            <circle cx="2"  cy="12" r="1.2" fill="currentColor"/>
            <circle cx="8"  cy="12" r="1.2" fill="currentColor"/>
          </svg>
        </div>

        {/** biome-ignore lint/a11y/useKeyWithClickEvents: intentional */}
        <p
          onClick={() => onSelect(task)}
          className="flex-1 text-[12px] font-medium text-foreground/80 leading-[1.45] cursor-pointer hover:text-foreground transition-colors"
        >
          {task.title}
        </p>

        <TaskProjectMenu
          taskId={task.id}
          currentProjectId={task.projectId}
          projects={projects}
        />

        <DeleteTaskButton taskId={task.id} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pl-4">
        <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority.class}`}>
          {priority.label}
        </span>

        {task.dueDate && (
          <span className={`text-[10px] ${
            new Date(task.dueDate) < new Date() && task.status !== "DONE"
              ? "text-red-400"
              : "text-muted-foreground"
          }`}>
            {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}

        {task.assigneeId && (
          <Avatar className="h-[18px] w-[18px]">
            <AvatarFallback className="text-[8px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

// ——— Overlay card shown while dragging ———
function DragOverlayCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
  return (
    <div className="bg-card border border-indigo-500 rounded-[8px] p-3 w-[220px] rotate-1 shadow-2xl">
      <div className="flex items-start gap-2 mb-2">
        {/** biome-ignore lint/a11y/noSvgWithoutTitle: drag handle */}
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="flex-shrink-0 mt-0.5 text-muted-foreground">
          <circle cx="2"  cy="2"  r="1.2" fill="currentColor"/>
          <circle cx="8"  cy="2"  r="1.2" fill="currentColor"/>
          <circle cx="2"  cy="7"  r="1.2" fill="currentColor"/>
          <circle cx="8"  cy="7"  r="1.2" fill="currentColor"/>
          <circle cx="2"  cy="12" r="1.2" fill="currentColor"/>
          <circle cx="8"  cy="12" r="1.2" fill="currentColor"/>
        </svg>
        <p className="text-[12px] text-foreground leading-[1.45] flex-1">{task.title}</p>
      </div>
      <div className="pl-4">
        <span className={`text-[10px] font-medium px-[7px] py-[2px] rounded-[5px] border ${priority.class}`}>
          {priority.label}
        </span>
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
export function TaskBoard({ columns, userName, filters, workspaceId, projects }: Props) {
  const [selectedTask, setSelectedTask]     = useState<Task | null>(null)
  const [activeTask, setActiveTask]         = useState<Task | null>(null)
  const [boardColumns, setBoardColumns]     = useState<Column[]>(columns)
  const [showCelebration, setShowCelebration] = useState(false)  // ← new

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
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-[7px] h-[7px] rounded-full ${col.dot}`} />
                      <span className={`text-[11px] font-semibold ${(columnStyles[col.id] ?? columnStyles.TODO).labelColor}`}>
                        {col.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50 bg-muted rounded-full px-2 py-0.5">
                      {col.tasks.length}
                    </span>
                  </div>

                  {/* Task cards */}
                  {col.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      userName={userName}
                      onSelect={setSelectedTask}
                      projects={projects}
                    />
                  ))}

                  {/* Empty state */}
                  {col.tasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-8 border border-dashed border-border rounded-[8px]">
                      <p className="text-[11px] text-muted-foreground/30">
                        {filters.priority.length > 0 || filters.search
                          ? "No matching tasks"
                          : "Drop here"
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
        />
      )}
    </>
  )
}