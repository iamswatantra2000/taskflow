"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Play, Pause, RotateCcw, Coffee, CheckCircle2 } from "lucide-react"
import { updateTaskStatus } from "@/lib/actions"
import { toast } from "sonner"

type Task = {
  id:          string
  title:       string
  description: string | null
  priority:    string
  status:      string
}

type Phase = "work" | "break"

const WORK_SECONDS  = 25 * 60
const BREAK_SECONDS = 5  * 60

const RADIUS      = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const priorityColor: Record<string, string> = {
  URGENT: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  LOW:    "text-sky-400 bg-sky-500/10 border-sky-500/20",
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

type Props = {
  task:    Task
  onClose: () => void
}

export function FocusMode({ task, onClose }: Props) {
  const [phase, setPhase]         = useState<Phase>("work")
  const [running, setRunning]     = useState(false)
  const [secondsLeft, setSeconds] = useState(WORK_SECONDS)
  const [notes, setNotes]         = useState("")
  const [completing, setCompleting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = phase === "work" ? WORK_SECONDS : BREAK_SECONDS
  const progress = secondsLeft / total
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  // Tick
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          // Auto-advance phase
          if (phase === "work") {
            setPhase("break")
            setSeconds(BREAK_SECONDS)
            toast.success("Work session done! Take a break 🎉")
          } else {
            setPhase("work")
            setSeconds(WORK_SECONDS)
            toast.info("Break over — back to focus 💪")
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running, phase])

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === " " && e.target === document.body) {
        e.preventDefault()
        setRunning((r) => !r)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function switchPhase() {
    setRunning(false)
    if (phase === "work") {
      setPhase("break")
      setSeconds(BREAK_SECONDS)
    } else {
      setPhase("work")
      setSeconds(WORK_SECONDS)
    }
  }

  function reset() {
    setRunning(false)
    setSeconds(phase === "work" ? WORK_SECONDS : BREAK_SECONDS)
  }

  async function handleMarkDone() {
    setCompleting(true)
    try {
      await updateTaskStatus(task.id, "DONE")
      toast.success("Task marked as done! 🎉")
      onClose()
    } catch {
      toast.error("Failed to update task")
      setCompleting(false)
    }
  }

  const ringColor = phase === "work"
    ? (progress > 0.33 ? "#6366f1" : progress > 0.15 ? "#f59e0b" : "#ef4444")
    : "#10b981"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg mx-4 flex flex-col items-center gap-6 py-10">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-[#444] hover:text-[#888] hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Phase label */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border ${
            phase === "work"
              ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
              : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          }`}>
            {phase === "work" ? "Focus Session" : "Break Time"}
          </span>
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center">
          <svg width={200} height={200} className="-rotate-90">
            {/* Track */}
            <circle
              cx={100} cy={100} r={RADIUS}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={6}
            />
            {/* Progress */}
            <circle
              cx={100} cy={100} r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: running ? "stroke-dashoffset 1s linear, stroke 0.5s" : "stroke 0.5s" }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-[38px] font-bold text-white tracking-tight tabular-nums leading-none">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] text-[#555] font-medium">
              {phase === "work" ? "until break" : "until focus"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#555] hover:text-[#888] hover:bg-white/5 border border-[#222] transition-all"
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white border transition-all shadow-lg ${
              running
                ? "bg-[#1a1a1a] border-[#333] hover:bg-[#222]"
                : "bg-indigo-600 border-indigo-700 hover:bg-indigo-500 shadow-indigo-500/30"
            }`}
          >
            {running ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={switchPhase}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#555] hover:text-[#888] hover:bg-white/5 border border-[#222] transition-all"
            title={phase === "work" ? "Take a break" : "Back to focus"}
          >
            <Coffee size={14} />
          </button>
        </div>

        <p className="text-[11px] text-[#333]">Space to start / pause · Esc to exit</p>

        {/* Divider */}
        <div className="w-full border-t border-[#1a1a1a]" />

        {/* Task info */}
        <div className="w-full space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[#e0e0e0] leading-snug">{task.title}</p>
              {task.description && (
                <p className="text-[12px] text-[#555] mt-1 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <span className={`text-[10px] font-semibold px-2 py-[3px] rounded-full border flex-shrink-0 ${priorityColor[task.priority] ?? priorityColor.MEDIUM}`}>
              {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Notes scratchpad */}
        <div className="w-full space-y-2">
          <label className="text-[11px] font-medium text-[#444] uppercase tracking-wider">
            Session notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot thoughts, blockers, or next steps..."
            rows={3}
            className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-[10px] px-3.5 py-2.5 text-[12.5px] text-[#ccc] placeholder-[#333] outline-none focus:border-[#333] resize-none transition-colors"
          />
        </div>

        {/* Footer actions */}
        <div className="w-full flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 text-[12px] font-medium text-[#555] hover:text-[#888] bg-[#111] hover:bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] rounded-[10px] transition-all"
          >
            Exit focus
          </button>
          {task.status !== "DONE" && (
            <button
              type="button"
              onClick={handleMarkDone}
              disabled={completing}
              className="flex-1 h-10 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 border border-emerald-700 rounded-[10px] flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={14} />
              {completing ? "Marking done..." : "Mark as done"}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
