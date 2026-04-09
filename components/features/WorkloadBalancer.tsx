"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Users, ChevronDown, ChevronUp, UserMinus, Check } from "lucide-react"
import { reassignTask } from "@/lib/actions"
import { presenceColor } from "@/hooks/usePresence"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Task = {
  id:         string
  title:      string
  status:     string
  priority:   string
  assigneeId: string | null
  projectId:  string
}

type Member = { id: string; name: string }
type Project = { id: string; name: string; color: string }

type Props = {
  tasks:         Task[]
  members:       Member[]
  projects:      Project[]
  currentUserId: string
}

// ── Helpers ────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

type LoadLevel = "free" | "normal" | "busy" | "overloaded"

function loadLevel(activeCount: number): LoadLevel {
  if (activeCount === 0) return "free"
  if (activeCount <= 4)  return "normal"
  if (activeCount <= 7)  return "busy"
  return "overloaded"
}

const loadBadge: Record<LoadLevel, string> = {
  free:       "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  normal:     "",
  busy:       "text-amber-400 bg-amber-500/10 border-amber-500/20",
  overloaded: "text-red-400 bg-red-500/10 border-red-500/20",
}

const loadLabel: Record<LoadLevel, string> = {
  free:       "Free",
  normal:     "",
  busy:       "Busy",
  overloaded: "Overloaded",
}

const statusBar: Record<string, { bg: string; label: string }> = {
  TODO:        { bg: "bg-[var(--tf-bg-dropdown)]",    label: "Todo"        },
  IN_PROGRESS: { bg: "bg-indigo-500",                  label: "In Progress" },
  IN_REVIEW:   { bg: "bg-amber-400",                   label: "In Review"   },
  DONE:        { bg: "bg-emerald-400/50",              label: "Done"        },
}

const priorityDot: Record<string, string> = {
  URGENT: "bg-red-500",
  HIGH:   "bg-orange-500",
  MEDIUM: "bg-amber-400",
  LOW:    "bg-sky-400",
}

// ── Reassign dropdown ────────────────────────────────────────────────────

function ReassignDropdown({
  task,
  members,
  currentAssigneeId,
  onReassign,
}: {
  task:               Task
  members:            Member[]
  currentAssigneeId:  string | null
  onReassign:         (taskId: string, newId: string | null) => void
}) {
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        title="Reassign task"
        className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[var(--tf-text-tertiary)] hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex-shrink-0"
      >
        <UserMinus size={10} />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-50 w-[160px] bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[10px] shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--tf-border-subtle)]">
            <p className="text-[10px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-wider truncate">
              {task.title}
            </p>
          </div>
          <div className="py-1 max-h-[160px] overflow-y-auto">
            {/* Unassign option */}
            <button
              type="button"
              onClick={() => { onReassign(task.id, null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-hover)] transition-colors"
            >
              <div className="w-5 h-5 rounded-full border border-dashed border-[var(--tf-border)] flex-shrink-0" />
              Unassigned
              {!currentAssigneeId && <Check size={10} className="ml-auto text-[var(--tf-accent-text)]" />}
            </button>

            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onReassign(task.id, m.id); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)] transition-colors"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                  style={{ background: presenceColor(m.id) }}
                >
                  {getInitials(m.name)}
                </div>
                <span className="truncate">{m.name}</span>
                {m.id === currentAssigneeId && <Check size={10} className="ml-auto text-[var(--tf-accent-text)] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Member row ───────────────────────────────────────────────────────────

function MemberRow({
  memberId,
  name,
  memberTasks,
  maxActive,
  members,
  projects,
  isCurrentUser,
  onReassign,
}: {
  memberId:     string | null
  name:         string
  memberTasks:  Task[]
  maxActive:    number
  members:      Member[]
  projects:     Project[]
  isCurrentUser: boolean
  onReassign:   (taskId: string, newId: string | null) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const activeTasks = memberTasks.filter((t) => t.status !== "DONE")
  const doneTasks   = memberTasks.filter((t) => t.status === "DONE")
  const level       = loadLevel(activeTasks.length)
  const badge       = loadBadge[level]
  const label       = loadLabel[level]

  // Segment counts for the bar
  const statusOrder = ["IN_PROGRESS", "IN_REVIEW", "TODO", "DONE"]
  const segments = statusOrder
    .map((s) => ({ status: s, count: memberTasks.filter((t) => t.status === s).length }))
    .filter((s) => s.count > 0)

  const total = memberTasks.length
  // Bar width is proportional to max active member (normalized)
  const barWidth = maxActive > 0 ? Math.min(100, (activeTasks.length / maxActive) * 100) : 0

  const avatarColor = memberId ? presenceColor(memberId) : "#6b7280"
  const SHOW_MAX = 4

  return (
    <div className="border border-[var(--tf-border-subtle)] rounded-[12px] overflow-hidden">

      {/* Row header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-[var(--tf-bg-card)] cursor-pointer hover:bg-[var(--tf-bg-hover)] transition-colors select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ring-2 ring-[var(--tf-bg-panel)]"
          style={{ background: avatarColor }}
        >
          {memberId ? getInitials(name) : "–"}
        </div>

        {/* Name + badges */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={cn(
            "text-[13px] font-semibold text-[var(--tf-text-primary)] truncate",
          )}>
            {name}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 px-1.5 py-[2px] rounded-full border border-indigo-500/20 flex-shrink-0">
              you
            </span>
          )}
          {label && (
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-[2px] rounded-full border flex-shrink-0",
              badge
            )}>
              {label}
            </span>
          )}
        </div>

        {/* Task count + expand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[12px] font-semibold text-[var(--tf-text-tertiary)]">
            {total} task{total !== 1 ? "s" : ""}
          </span>
          {expanded
            ? <ChevronUp size={13} className="text-[var(--tf-text-tertiary)]" />
            : <ChevronDown size={13} className="text-[var(--tf-text-tertiary)]" />
          }
        </div>
      </div>

      {/* Bar + details */}
      <div className="px-4 pb-3 bg-[var(--tf-bg-card)] space-y-2.5 border-t border-[var(--tf-border-subtle)]">

        {/* Workload bar */}
        {total > 0 ? (
          <div className="flex items-center gap-2 pt-2.5">
            {/* Normalized bar */}
            <div className="flex-1 h-[6px] bg-[var(--tf-bg-dropdown)] rounded-full overflow-hidden">
              <div
                className="h-full flex rounded-full overflow-hidden transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              >
                {segments.map((seg) => (
                  <div
                    key={seg.status}
                    title={`${statusBar[seg.status]?.label ?? seg.status}: ${seg.count}`}
                    className={cn("h-full", statusBar[seg.status]?.bg ?? "bg-slate-400")}
                    style={{ width: `${(seg.count / total) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Legend pills */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {segments.map((seg) => (
                <div key={seg.status} className="flex items-center gap-[3px]">
                  <div className={cn("w-[6px] h-[6px] rounded-full", statusBar[seg.status]?.bg ?? "bg-slate-400")} />
                  <span className="text-[10px] text-[var(--tf-text-tertiary)]">{seg.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2.5">
            <p className="text-[11px] text-[var(--tf-text-tertiary)] italic">No tasks assigned</p>
          </div>
        )}

        {/* Expanded task list */}
        {expanded && total > 0 && (
          <div className="space-y-1 pt-0.5">
            {memberTasks.slice(0, SHOW_MAX).map((task) => {
              const project = projects.find((p) => p.id === task.projectId)
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] bg-[var(--tf-bg-panel)] border border-[var(--tf-border-subtle)] group"
                >
                  {/* Priority dot */}
                  <div className={cn("w-[5px] h-[5px] rounded-full flex-shrink-0", priorityDot[task.priority] ?? "bg-slate-400")} />

                  {/* Task title */}
                  <p className={cn(
                    "flex-1 text-[11.5px] truncate",
                    task.status === "DONE"
                      ? "text-[var(--tf-text-tertiary)] line-through"
                      : "text-[var(--tf-text-primary)]"
                  )}>
                    {task.title}
                  </p>

                  {/* Project color dot */}
                  {project && (
                    <div
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0 opacity-60"
                      style={{ background: project.color }}
                    />
                  )}

                  {/* Status chip */}
                  <div className={cn(
                    "h-[18px] px-1.5 rounded-[4px] text-[9px] font-semibold flex items-center flex-shrink-0",
                    task.status === "IN_PROGRESS" ? "bg-indigo-500/10 text-indigo-400" :
                    task.status === "IN_REVIEW"   ? "bg-amber-500/10 text-amber-400" :
                    task.status === "DONE"        ? "bg-emerald-500/10 text-emerald-400" :
                                                    "bg-[var(--tf-bg-hover)] text-[var(--tf-text-tertiary)]"
                  )}>
                    {statusBar[task.status]?.label ?? task.status}
                  </div>

                  {/* Reassign */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ReassignDropdown
                      task={task}
                      members={members}
                      currentAssigneeId={task.assigneeId}
                      onReassign={onReassign}
                    />
                  </div>
                </div>
              )
            })}

            {memberTasks.length > SHOW_MAX && (
              <p className="text-[11px] text-[var(--tf-text-tertiary)] pl-2">
                +{memberTasks.length - SHOW_MAX} more tasks
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export function WorkloadBalancer({ tasks, members, projects, currentUserId }: Props) {
  const [, startTransition] = useTransition()
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)

  // Sync with prop changes (e.g. after revalidation)
  useState(() => { setLocalTasks(tasks) })

  function handleReassign(taskId: string, newAssigneeId: string | null) {
    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, assigneeId: newAssigneeId } : t)
    )
    startTransition(async () => {
      try {
        await reassignTask(taskId, newAssigneeId)
        const name = newAssigneeId
          ? (members.find((m) => m.id === newAssigneeId)?.name ?? "someone")
          : "Unassigned"
        toast.success(`Reassigned to ${name}`)
      } catch {
        // Revert on failure
        setLocalTasks(tasks)
        toast.error("Failed to reassign task")
      }
    })
  }

  // Build per-member task lists
  const rows = [
    // Real members
    ...members.map((m) => ({
      memberId:    m.id,
      name:        m.name,
      memberTasks: localTasks.filter((t) => t.assigneeId === m.id),
    })),
    // Unassigned bucket
    {
      memberId:    null,
      name:        "Unassigned",
      memberTasks: localTasks.filter((t) => !t.assigneeId),
    },
  ]
    // Sort: most active tasks first
    .sort((a, b) => {
      const aActive = a.memberTasks.filter((t) => t.status !== "DONE").length
      const bActive = b.memberTasks.filter((t) => t.status !== "DONE").length
      return bActive - aActive
    })

  const maxActive = Math.max(
    ...rows.map((r) => r.memberTasks.filter((t) => t.status !== "DONE").length),
    1
  )

  const totalActive  = localTasks.filter((t) => t.status !== "DONE").length
  const unassigned   = localTasks.filter((t) => !t.assigneeId && t.status !== "DONE").length

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-[var(--tf-text-tertiary)]" />
          <h2 className="text-[14px] font-semibold text-[var(--tf-text-primary)] tracking-tight">
            Team Workload
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {unassigned > 0 && (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
              {unassigned} unassigned
            </span>
          )}
          <span className="text-[11px] font-medium text-[var(--tf-text-tertiary)] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-full px-2.5 py-0.5">
            {totalActive} active task{totalActive !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Member rows */}
      <div className="space-y-2">
        {rows.map((row) => (
          <MemberRow
            key={row.memberId ?? "__unassigned__"}
            memberId={row.memberId}
            name={row.name}
            memberTasks={row.memberTasks}
            maxActive={maxActive}
            members={members}
            projects={projects}
            isCurrentUser={row.memberId === currentUserId}
            onReassign={handleReassign}
          />
        ))}
      </div>

    </div>
  )
}
