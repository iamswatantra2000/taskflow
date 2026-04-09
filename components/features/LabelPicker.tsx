// components/features/LabelPicker.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Tag, Plus, X, Check, Trash2, Loader2 } from "lucide-react"
import { addLabelToTask, removeLabelFromTask, createLabel, deleteLabel } from "@/lib/label-actions"

type Label = { id: string; name: string; color: string }

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#ec4899", "#64748b", "#1e293b",
]

export function LabelPicker({
  taskId,
  workspaceId,
  initialWorkspaceLabels,
  initialAppliedIds,
}: {
  taskId:                  string
  workspaceId:             string
  initialWorkspaceLabels?: Label[]
  initialAppliedIds?:      string[]
}) {
  const [workspaceLabels, setWorkspaceLabels] = useState<Label[]>(initialWorkspaceLabels ?? [])
  const [taskLabelIds, setTaskLabelIds]       = useState<Set<string>>(new Set(initialAppliedIds ?? []))
  const [open, setOpen]                       = useState(false)
  const [creating, setCreating]               = useState(false)
  const [newName, setNewName]                 = useState("")
  const [newColor, setNewColor]               = useState("#6366f1")
  const [saving, setSaving]                   = useState(false)
  const [loadingLabels, setLoadingLabels]     = useState(initialWorkspaceLabels === undefined)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch workspace labels + this task's labels (only when not pre-fetched)
  useEffect(() => {
    if (initialWorkspaceLabels !== undefined) return
    setLoadingLabels(true)
    Promise.all([
      fetch(`/api/labels/workspace/${workspaceId}`).then((r) => r.json()),
      fetch(`/api/labels/tasks?ids=${taskId}`).then((r) => r.json()),
    ])
      .then(([wsData, taskData]) => {
        setWorkspaceLabels(wsData.labels ?? [])
        const applied = (taskData.taskLabelMap?.[taskId] ?? []).map((l: Label) => l.id)
        setTaskLabelIds(new Set(applied))
      })
      .catch(() => {})
      .finally(() => setLoadingLabels(false))
  }, [taskId, workspaceId, initialWorkspaceLabels])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const appliedLabels = workspaceLabels.filter((l) => taskLabelIds.has(l.id))

  async function handleToggle(label: Label) {
    const isApplied = taskLabelIds.has(label.id)
    setTaskLabelIds((prev) => {
      const next = new Set(prev)
      if (isApplied) next.delete(label.id)
      else next.add(label.id)
      return next
    })
    try {
      if (isApplied) await removeLabelFromTask(taskId, label.id)
      else await addLabelToTask(taskId, label.id)
    } catch {
      // revert
      setTaskLabelIds((prev) => {
        const next = new Set(prev)
        if (isApplied) next.add(label.id)
        else next.delete(label.id)
        return next
      })
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const label = await createLabel(workspaceId, newName.trim(), newColor)
      if (label) {
        setWorkspaceLabels((prev) => [...prev, label])
        // auto-apply the new label
        setTaskLabelIds((prev) => new Set([...prev, label.id]))
        await addLabelToTask(taskId, label.id)
      }
    } catch {}
    setNewName("")
    setNewColor("#6366f1")
    setCreating(false)
    setSaving(false)
  }

  async function handleDeleteLabel(e: React.MouseEvent, labelId: string) {
    e.stopPropagation()
    setWorkspaceLabels((prev) => prev.filter((l) => l.id !== labelId))
    setTaskLabelIds((prev) => { const n = new Set(prev); n.delete(labelId); return n })
    try { await deleteLabel(labelId) } catch {}
  }

  if (loadingLabels) return (
    <div className="space-y-2 pt-4 border-t border-[var(--tf-border-subtle)]">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-[var(--tf-bg-dropdown)] animate-pulse" />
        <div className="h-3 w-10 rounded bg-slate-100 dark:bg-[var(--tf-bg-dropdown)] animate-pulse" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-[var(--tf-bg-dropdown)] animate-pulse" />
        <div className="h-5 w-20 rounded-full bg-[var(--tf-bg-dropdown)] animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="space-y-2 pt-4 border-t border-[var(--tf-border-subtle)]">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Tag size={12} className="text-indigo-400" />
        <span className="text-[12px] font-semibold text-[var(--tf-text-primary)]">Labels</span>
      </div>

      {/* Applied label chips + add button */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {appliedLabels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: `${label.color}22`,
              border:     `1px solid ${label.color}55`,
              color:      label.color,
            }}
          >
            {label.name}
            <button
              type="button"
              onClick={() => handleToggle(label)}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={9} />
            </button>
          </span>
        ))}

        {/* Add label button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => { setOpen(!open); setCreating(false) }}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-dashed border-[var(--tf-border)] text-[var(--tf-text-tertiary)] hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            <Plus size={10} />
            Add label
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute left-0 bottom-8 z-[200] w-[220px] bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[10px] shadow-xl overflow-hidden">

              {/* Existing labels */}
              <div className="p-1.5 max-h-[200px] overflow-y-auto">
                {workspaceLabels.length === 0 && !creating && (
                  <p className="text-[11px] text-[var(--tf-text-tertiary)] px-2 py-1.5 italic">
                    No labels yet
                  </p>
                )}
                {workspaceLabels.map((label) => {
                  const active = taskLabelIds.has(label.id)
                  return (
                    <div
                      key={label.id}
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[var(--tf-bg-hover)] cursor-pointer transition-colors"
                      onClick={() => handleToggle(label)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: label.color }}
                      />
                      <span className="flex-1 text-[12px] text-[var(--tf-text-primary)] truncate">
                        {label.name}
                      </span>
                      {active && <Check size={11} className="text-indigo-500 flex-shrink-0" />}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLabel(e, label.id)}
                        className="opacity-0 group-hover:opacity-100 text-[var(--tf-text-tertiary)] hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Divider + create */}
              <div className="border-t border-[var(--tf-border)] p-1.5">
                {!creating ? (
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] text-[12px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <Plus size={11} />
                    Create new label
                  </button>
                ) : (
                  <div className="space-y-2 p-1">
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false) }}
                      placeholder="Label name..."
                      className="w-full text-[12px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[6px] px-2 py-1 outline-none focus:border-[var(--tf-accent)] text-[var(--tf-text-primary)] placeholder-[var(--tf-text-tertiary)]"
                    />
                    {/* Color swatches */}
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                          style={{
                            background: c,
                            outline: newColor === c ? `2px solid ${c}` : "none",
                            outlineOffset: "2px",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!newName.trim() || saving}
                        className="flex-1 h-6 text-[11px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 disabled:opacity-40 text-white rounded-[5px] transition-colors flex items-center justify-center gap-1"
                      >
                        {saving ? <Loader2 size={10} className="animate-spin" /> : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreating(false)}
                        className="flex-1 h-6 text-[11px] text-[var(--tf-text-secondary)] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-[5px] hover:bg-[var(--tf-bg-dropdown)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
