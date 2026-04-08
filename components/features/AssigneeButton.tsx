"use client"

import { useState, useEffect, useRef } from "react"
import { UserPlus, Check } from "lucide-react"
import { presenceColor } from "@/hooks/usePresence"

type Member = { id: string; name: string }

type Props = {
  taskId:     string
  assigneeId: string | null
  members:    Member[]
  onAssign:   (taskId: string, newId: string | null) => void
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function AssigneeButton({ taskId, assigneeId, members, onAssign }: Props) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const assignee        = members.find((m) => m.id === assigneeId)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        title={assignee ? `Assigned to ${assignee.name} · Click to change` : "Assign to someone"}
      >
        {assignee ? (
          <div
            className="w-[22px] h-[22px] rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-[#111] hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-all cursor-pointer"
            style={{ background: presenceColor(assignee.id) }}
          >
            {getInitials(assignee.name)}
          </div>
        ) : (
          <div className="w-[22px] h-[22px] rounded-full border border-dashed border-[var(--tf-border)] flex items-center justify-center text-[var(--tf-text-tertiary)] hover:border-indigo-400 hover:text-indigo-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            <UserPlus size={10} />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-7 right-0 z-[200] w-[178px] bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[10px] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[var(--tf-border-subtle)]">
            <p className="text-[10px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-wider">
              Assign to
            </p>
          </div>

          {/* Member list */}
          <div className="py-1 max-h-[180px] overflow-y-auto">

            {/* Unassign option */}
            <button
              type="button"
              onClick={() => { onAssign(taskId, null); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[var(--tf-bg-hover)] transition-colors"
            >
              <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-[var(--tf-border)] flex items-center justify-center flex-shrink-0 text-[var(--tf-text-tertiary)]">
                <UserPlus size={10} />
              </div>
              <span className="text-[12px] text-[var(--tf-text-secondary)] flex-1 text-left">
                Unassigned
              </span>
              {!assigneeId && (
                <Check size={11} className="text-[var(--tf-accent-text)] flex-shrink-0" />
              )}
            </button>

            {/* Members */}
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onAssign(taskId, m.id); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[var(--tf-bg-hover)] transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0"
                  style={{ background: presenceColor(m.id) }}
                >
                  {getInitials(m.name)}
                </div>
                <span className="text-[12px] text-[var(--tf-text-primary)] flex-1 text-left truncate">
                  {m.name}
                </span>
                {m.id === assigneeId && (
                  <Check size={11} className="text-[var(--tf-accent-text)] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
