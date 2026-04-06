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
          <div className="w-[22px] h-[22px] rounded-full border border-dashed border-slate-200 dark:border-[#2a2a2a] flex items-center justify-center text-slate-300 dark:text-[#3a3a3a] hover:border-indigo-400 hover:text-indigo-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer">
            <UserPlus size={10} />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-7 right-0 z-[200] w-[178px] bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] rounded-[10px] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1f1f1f]">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-[#555] uppercase tracking-wider">
              Assign to
            </p>
          </div>

          {/* Member list */}
          <div className="py-1 max-h-[180px] overflow-y-auto">

            {/* Unassign option */}
            <button
              type="button"
              onClick={() => { onAssign(taskId, null); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors"
            >
              <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-[#333] flex items-center justify-center flex-shrink-0 text-slate-300 dark:text-[#444]">
                <UserPlus size={10} />
              </div>
              <span className="text-[12px] text-slate-500 dark:text-[#666] flex-1 text-left">
                Unassigned
              </span>
              {!assigneeId && (
                <Check size={11} className="text-indigo-400 flex-shrink-0" />
              )}
            </button>

            {/* Members */}
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { onAssign(taskId, m.id); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center flex-shrink-0"
                  style={{ background: presenceColor(m.id) }}
                >
                  {getInitials(m.name)}
                </div>
                <span className="text-[12px] text-slate-700 dark:text-[#ccc] flex-1 text-left truncate">
                  {m.name}
                </span>
                {m.id === assigneeId && (
                  <Check size={11} className="text-indigo-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
