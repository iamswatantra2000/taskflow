// components/features/BulkActionBar.tsx
"use client"

import { useState } from "react"
import { X, Trash2, ArrowRight, UserCheck, Loader2 } from "lucide-react"
import { bulkUpdateStatus, bulkAssign, bulkDelete } from "@/lib/actions"
import { toast } from "sonner"

type Member = { id: string; name: string }

const STATUSES = [
  { id: "TODO",        label: "Todo",        dot: "bg-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", dot: "bg-indigo-500" },
  { id: "IN_REVIEW",   label: "In Review",   dot: "bg-amber-500" },
  { id: "DONE",        label: "Done",        dot: "bg-emerald-500" },
]

export function BulkActionBar({
  selectedIds,
  members,
  onClear,
  onAction,
}: {
  selectedIds: Set<string>
  members:     Member[]
  onClear:     () => void
  onAction:    (type: "status" | "assign" | "delete", value?: string) => void
}) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [loading,    setLoading]    = useState(false)

  const count = selectedIds.size
  const ids   = [...selectedIds]

  function closeMenus() { setStatusOpen(false); setAssignOpen(false) }

  async function handleMoveStatus(status: string) {
    closeMenus()
    setLoading(true)
    onAction("status", status)
    try {
      await bulkUpdateStatus(ids, status)
      toast.success(`${count} task${count > 1 ? "s" : ""} moved`)
    } catch {
      toast.error("Failed to move tasks")
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign(assigneeId: string) {
    closeMenus()
    setLoading(true)
    onAction("assign", assigneeId)
    try {
      await bulkAssign(ids, assigneeId || null)
      toast.success(assigneeId
        ? `${count} task${count > 1 ? "s" : ""} assigned`
        : `${count} task${count > 1 ? "s" : ""} unassigned`
      )
    } catch {
      toast.error("Failed to assign tasks")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    closeMenus()
    setLoading(true)
    onAction("delete")
    try {
      await bulkDelete(ids)
      toast.success(`${count} task${count > 1 ? "s" : ""} deleted`)
    } catch {
      toast.error("Failed to delete tasks")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
      style={{
        background: "linear-gradient(135deg, #0f0f0f 0%, #171717 100%)",
        animation: "fade-in-up 0.18s ease-out both",
      }}
    >
      {/* Count badge */}
      <span className="text-[12px] font-semibold text-white/90 px-2 py-0.5 bg-indigo-600/30 border border-indigo-500/30 rounded-full mr-1">
        {count} selected
      </span>

      {/* ── Move to ── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setStatusOpen(!statusOpen); setAssignOpen(false) }}
          disabled={loading}
          className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/[0.07] rounded-[8px] transition-colors disabled:opacity-40"
        >
          <ArrowRight size={12} />
          Move to
        </button>

        {statusOpen && (
          <div className="absolute bottom-10 left-0 z-10 w-[160px] bg-[#181818] border border-white/[0.08] rounded-[10px] shadow-xl overflow-hidden p-1">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleMoveStatus(s.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-white/75 hover:text-white hover:bg-white/[0.06] rounded-[6px] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Assign to ── */}
      {members.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => { setAssignOpen(!assignOpen); setStatusOpen(false) }}
            disabled={loading}
            className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium text-white/70 hover:text-white hover:bg-white/[0.07] rounded-[8px] transition-colors disabled:opacity-40"
          >
            <UserCheck size={12} />
            Assign
          </button>

          {assignOpen && (
            <div className="absolute bottom-10 left-0 z-10 w-[180px] bg-[#181818] border border-white/[0.08] rounded-[10px] shadow-xl overflow-hidden p-1 max-h-[200px] overflow-y-auto">
              <button
                type="button"
                onClick={() => handleAssign("")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-[6px] transition-colors italic"
              >
                Unassign
              </button>
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleAssign(m.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-white/75 hover:text-white hover:bg-white/[0.06] rounded-[6px] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-4 bg-white/[0.1] mx-1" />

      {/* ── Delete ── */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[8px] transition-colors disabled:opacity-40"
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <Trash2 size={12} />
        }
        Delete
      </button>

      {/* ── Clear ── */}
      <button
        type="button"
        onClick={onClear}
        className="ml-0.5 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] rounded-[6px] transition-colors"
        aria-label="Clear selection"
      >
        <X size={11} />
      </button>
    </div>
  )
}
