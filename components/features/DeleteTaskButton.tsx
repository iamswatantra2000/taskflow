// components/features/DeleteTaskButton.tsx
"use client"

import { useState } from "react"
import { deleteTask } from "@/lib/actions"
import { toast } from "sonner"
import { Trash2, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)
  const router                      = useRouter();

  function handleClickDelete(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setConfirming(true)
  }

  async function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setLoading(true)
    try {
      await deleteTask(taskId)
      toast.success("Task deleted")
       router.refresh()  
    } catch {
      toast.error("Failed to delete task")
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setConfirming(false)
  }

  if (confirming) {
  return (
    <>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleConfirm}
        disabled={loading}
        className="p-1 rounded-md text-emerald-400 hover:bg-emerald-950 transition-all"
      >
        <Check size={11} />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleCancel}
        className="p-1 rounded-md text-slate-400 dark:text-[#555] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] transition-all"
      >
        <X size={11} />
      </button>
    </>
  )
}

  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
<button
 type="button"
      onPointerDown={(e) => e.stopPropagation()}  // ← KEY FIX: stops dnd-kit capturing
      onClick={handleClickDelete}
      disabled={loading}
      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 dark:text-[#555] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all disabled:opacity-50 flex-shrink-0"
    >
      <Trash2 size={11} />
    </button>
  )
}