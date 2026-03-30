// components/features/NewTaskDialog.tsx
"use client"

import { useState, useRef } from "react"
import { createTask } from "@/lib/actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

type Props = {
  projectId: string
  children:  React.ReactNode
}

export function NewTaskDialog({ projectId, children }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState("")
  const formRef               = useRef<HTMLFormElement>(null)
  const router                = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(formRef.current!)
      formData.set("projectId", projectId)
      if (dueDate) formData.set("dueDate", dueDate)
      await createTask(formData)
      setOpen(false)
      setDueDate("")
      formRef.current?.reset()
      toast.success("Task created", {
        description: "Your new task is on the board.",
      })
      router.refresh()
    } catch {
      toast.error("Failed to create task", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] text-[#e0e0e0] sm:max-w-md max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[90vh] max-sm:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-[#f0f0f0]">
            New task
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Title */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[#888]">Title</label>
            <input
              name="title"
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-[#888]">Status</label>
              <select
                name="status"
                defaultValue="TODO"
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
                name="priority"
                defaultValue="MEDIUM"
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due date — full width */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[#888]">
              Due date <span className="text-[#555]">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-[#888]">
              Description <span className="text-[#444]">(optional)</span>
            </label>
            <textarea
              name="description"
              placeholder="Add more context..."
              rows={3}
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-[12px] font-medium text-[#666] hover:text-[#999] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[8px] transition-colors"
            >
              {loading ? "Creating..." : "Create task"}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}