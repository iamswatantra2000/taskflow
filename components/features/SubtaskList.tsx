// components/features/SubtaskList.tsx
"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { CheckSquare, Plus, Trash2, Loader2 } from "lucide-react"
import {
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtaskTitle,
} from "@/lib/subtask-actions"

type Subtask = {
  id:        string
  title:     string
  completed: boolean
  position:  number
}

export function SubtaskList({ taskId, initialItems }: { taskId: string; initialItems?: Subtask[] }) {
  const [items, setItems]       = useState<Subtask[]>(initialItems ?? [])
  const [loading, setLoading]   = useState(initialItems === undefined)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding]     = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialItems !== undefined) return
    fetch(`/api/subtasks/${taskId}`)
      .then((r) => r.json())
      .then((d) => setItems(d.subtasks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [taskId, initialItems])

  const total     = items.length
  const completed = items.filter((i) => i.completed).length
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100)

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title) return
    setAdding(true)
    // Optimistic
    const optimistic: Subtask = {
      id:        `opt-${Date.now()}`,
      title,
      completed: false,
      position:  items.length,
    }
    setItems((prev) => [...prev, optimistic])
    setNewTitle("")
    try {
      await addSubtask(taskId, title)
      // Re-fetch to get real id
      const res = await fetch(`/api/subtasks/${taskId}`)
      const d   = await res.json()
      setItems(d.subtasks ?? [])
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== optimistic.id))
      setNewTitle(title)
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !current } : i))
    )
    try {
      await toggleSubtask(id, !current)
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, completed: current } : i))
      )
    }
  }

  async function handleDelete(id: string) {
    const prev = items
    setItems((p) => p.filter((i) => i.id !== id))
    try {
      await deleteSubtask(id)
    } catch {
      setItems(prev)
    }
  }

  async function handleRenameCommit(id: string) {
    const title = editTitle.trim()
    setEditingId(null)
    if (!title) return
    const original = items.find((i) => i.id === id)?.title ?? ""
    if (title === original) return
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title } : i)))
    try {
      await updateSubtaskTitle(id, title)
    } catch {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: original } : i)))
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd()
  }

  if (loading) return (
    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#1f1f1f]">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-slate-100 dark:bg-[#1f1f1f] animate-pulse" />
        <div className="h-3 w-16 rounded bg-slate-100 dark:bg-[#1f1f1f] animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5 px-1">
            <div className="w-4 h-4 rounded-[4px] bg-slate-100 dark:bg-[#1f1f1f] animate-pulse flex-shrink-0" />
            <div className="h-3 rounded bg-slate-100 dark:bg-[#1f1f1f] animate-pulse flex-1" style={{ width: `${55 + i * 15}%` }} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#1f1f1f]">

      {/* Header + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckSquare size={12} className="text-indigo-400" />
          <span className="text-[12px] font-semibold text-slate-700 dark:text-[#ccc]">
            Checklist
          </span>
          {total > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-[#555] tabular-nums">
              {completed}/{total}
            </span>
          )}
        </div>
        {total > 0 && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-[#555]">
            {progress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1 bg-slate-100 dark:bg-[#1f1f1f] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Subtask items */}
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2.5 px-1 py-1 rounded-[6px] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(item.id, item.completed)}
                className="flex-shrink-0 w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-150"
                style={{
                  borderColor: item.completed ? "#10b981" : undefined,
                  backgroundColor: item.completed ? "#10b981" : undefined,
                }}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
              >
                {item.completed && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Title — click to edit */}
              {editingId === item.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleRenameCommit(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameCommit(item.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="flex-1 text-[13px] bg-white dark:bg-[#0d0d0d] border border-indigo-400 rounded-[5px] px-2 py-0.5 outline-none text-slate-800 dark:text-[#e0e0e0]"
                />
              ) : (
                <span
                  className={`flex-1 text-[13px] cursor-pointer select-none ${
                    item.completed
                      ? "line-through text-slate-400 dark:text-[#444]"
                      : "text-slate-700 dark:text-[#ccc]"
                  }`}
                  onClick={() => {
                    setEditingId(item.id)
                    setEditTitle(item.title)
                  }}
                >
                  {item.title}
                </span>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded-[4px] text-slate-300 hover:text-red-400 dark:text-[#333] dark:hover:text-red-400 transition-all"
                aria-label="Delete subtask"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new subtask */}
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-4 h-4 rounded-[4px] border-2 border-dashed border-slate-300 dark:border-[#333]" />
        <input
          ref={inputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask..."
          className="flex-1 text-[13px] bg-transparent placeholder-slate-300 dark:placeholder-[#444] text-slate-700 dark:text-[#ccc] outline-none"
        />
        {newTitle.trim() && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="flex-shrink-0 flex items-center gap-1 h-6 px-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 rounded-[6px] transition-colors disabled:opacity-40"
          >
            {adding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
            Add
          </button>
        )}
      </div>
    </div>
  )
}
