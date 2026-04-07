// components/features/TaskDetailDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { updateTask } from "@/lib/actions"
import { improveTaskDescription } from "@/lib/actions"
import { Sparkles, Loader2, Timer, CheckCircle2 } from "lucide-react"
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { CommentSection } from "./CommentSection"
import { SubtaskList } from "./SubtaskList"
import { LabelPicker } from "./LabelPicker"

type Member = { id: string; name: string }

type Task = {
  id:          string
  title:       string
  description: string | null
  status:      string
  priority:    string
  dueDate:     Date | null
  assigneeId:  string | null
}

type Props = {
  task:          Task
  open:          boolean
  onClose:       () => void
  members:       Member[]
  currentUserId: string
  workspaceId:   string
}

type FocusSession = {
  id:        string
  duration:  number
  completed: boolean
  notes:     string | null
  createdAt: string
  userName:  string | null
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function FocusSessionHistory({ taskId }: { taskId: string }) {
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`/api/focus-sessions/${taskId}`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [taskId])

  if (loading) return null
  if (sessions.length === 0) return null

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1f1f1f] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Timer size={12} className="text-indigo-400" />
          <span className="text-[12px] font-semibold text-slate-700 dark:text-[#ccc]">
            Focus Sessions
          </span>
        </div>
        <span className="text-[11px] text-slate-400 dark:text-[#555]">
          {formatDuration(totalSeconds)} total
        </span>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex gap-3 p-2.5 rounded-[8px] bg-slate-50 dark:bg-[#0f0f0f] border border-slate-100 dark:border-[#1a1a1a]"
          >
            {/* Duration + completed */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
              <span className="text-[12px] font-bold text-slate-700 dark:text-[#ccc] tabular-nums">
                {formatDuration(s.duration)}
              </span>
              {s.completed && (
                <CheckCircle2 size={10} className="text-emerald-500" />
              )}
            </div>

            {/* Notes + meta */}
            <div className="flex-1 min-w-0">
              {s.notes ? (
                <p className="text-[11.5px] text-slate-600 dark:text-[#aaa] leading-relaxed whitespace-pre-wrap">
                  {s.notes}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-[#444] italic">No notes</p>
              )}
              <p className="text-[10px] text-slate-400 dark:text-[#444] mt-1">
                {s.userName ?? "You"} ·{" "}
                {new Date(s.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TaskDetailDialog({ task, open, onClose, members, currentUserId, workspaceId }: Props) {
  const [title, setTitle]             = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")
  const [status, setStatus]           = useState(task.status)
  const [priority, setPriority]       = useState(task.priority)
  const [loading, setLoading]         = useState(false)
  const [saved, setSaved]             = useState(false)
  const [improving, setImproving]     = useState(false)
  const [dueDate, setDueDate]         = useState(
    task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : ""
  )
  const [assigneeId, setAssigneeId]   = useState(task.assigneeId ?? "")

  async function handleSave() {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.set("title",       title)
      formData.set("description", description)
      formData.set("status",      status)
      formData.set("priority",    priority)
      if (dueDate)     formData.set("dueDate",    dueDate)
      if (assigneeId)  formData.set("assigneeId", assigneeId)
      await updateTask(task.id, formData)
      toast.success("Task updated")
      onClose()
    } catch {
      toast.error("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  async function handleImproveDescription() {
    setImproving(true)
    try {
      const improved = await improveTaskDescription(title, description)
      setDescription(improved)
      toast.success("Description improved by AI!")
    } catch {
      toast.error("Failed to improve description")
    } finally {
      setImproving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#111] border-slate-200 dark:border-[#1f1f1f] text-slate-800 dark:text-[#e0e0e0] max-w-xl flex flex-col max-h-[90vh] p-0 gap-0">
        {/* ── Fixed header ── */}
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-slate-100 dark:border-[#1a1a1a]">
          <DialogTitle className="text-[15px] font-semibold text-slate-900 dark:text-[#f0f0f0]">
            Task detail
          </DialogTitle>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">

          {/* Title */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="IN_REVIEW">In review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Due date — full width */}
          <div className="space-y-1.5">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">
              Due date <span className="text-slate-400 dark:text-[#555]">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
            />
            {/* Show overdue warning */}
            {dueDate && new Date(dueDate) < new Date() && status !== "DONE" && (
              <p className="text-[11px] text-red-400">
                ⚠ This task is overdue
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-[12px] font-medium text-slate-500 dark:text-[#888]">Description</label>
              <button
                type="button"
                onClick={handleImproveDescription}
                disabled={improving || !title}
                className="flex items-center gap-1.5 h-6 px-2.5 text-[11px] font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 dark:text-violet-400 dark:bg-violet-950/40 dark:hover:bg-violet-950/60 dark:border-violet-800/50 rounded-[7px] shadow-[0_2px_0_0_rgba(109,40,217,0.15)] dark:shadow-[0_2px_0_0_rgba(76,29,149,0.5)] active:translate-y-[2px] active:shadow-none disabled:opacity-40 transition-all duration-100"
              >
                {improving
                  ? <><Loader2 size={10} className="animate-spin" /> Improving...</>
                  : <><Sparkles size={10} /> Improve with AI</>
                }
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-slate-800 dark:text-[#e0e0e0] placeholder-slate-300 dark:placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

        </div>

          <LabelPicker taskId={task.id} workspaceId={workspaceId} />
          <SubtaskList taskId={task.id} />
          <FocusSessionHistory taskId={task.id} />
          <CommentSection
            taskId={task.id}
            taskTitle={task.title}
            members={members}
            currentUserId={currentUserId}
          />
        </div>{/* end scrollable body */}

        {/* ── Fixed footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[#1a1a1a] bg-white dark:bg-[#111]">
          <p className={`text-[12px] transition-opacity ${saved ? "text-emerald-600 dark:text-emerald-400 opacity-100" : "opacity-0"}`}>
            Saved!
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 text-[12px] font-medium text-slate-500 dark:text-[#555] hover:text-slate-700 dark:hover:text-[#888] bg-slate-50 dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-[#161616] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/15 rounded-[8px] shadow-[0_3px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_3px_0_0_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-none transition-all duration-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="h-8 px-3.5 text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white border border-indigo-700/80 rounded-[8px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}