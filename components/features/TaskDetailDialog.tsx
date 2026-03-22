// components/features/TaskDetailDialog.tsx
"use client"

import { useState } from "react"
import { updateTask } from "@/lib/actions"
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
}

type Props = {
  task: Task
  open: boolean
  onClose: () => void
}

export function TaskDetailDialog({ task, open, onClose }: Props) {
  const [title, setTitle]           = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")
  const [status, setStatus]         = useState(task.status)
  const [priority, setPriority]     = useState(task.priority)
  const [loading, setLoading]       = useState(false)
  const [saved, setSaved]           = useState(false)

// Replace the handleSave function only:
async function handleSave() {
  setLoading(true)
  try {
    const formData = new FormData()
    formData.set("title", title)
    formData.set("description", description)
    formData.set("status", status)
    formData.set("priority", priority)
    await updateTask(task.id, formData)
    toast.success("Task updated")
    onClose()
  } catch {
    toast.error("Failed to update task")
  } finally {
    setLoading(false)
  }
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-[#1f1f1f] text-[#e0e0e0] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-[#f0f0f0]">
            Task detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Title */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[#888]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-[#888]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="IN_REVIEW">In review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-[#888]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[#888]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <p className={`text-[12px] transition-opacity ${saved ? "text-emerald-400 opacity-100" : "opacity-0"}`}>
              Saved!
            </p>
            <div className="flex items-center gap-2">
              {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-[12px] font-medium text-[#666] hover:text-[#999] transition-colors"
              >
                Close
              </button>
              {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[8px] transition-colors"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}