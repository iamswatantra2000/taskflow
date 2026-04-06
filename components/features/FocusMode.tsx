"use client"

import { useState, useEffect, useRef } from "react"
import { X, Play, Pause, RotateCcw, Coffee, CheckCircle2, Save } from "lucide-react"
import { updateTaskStatus, saveFocusSession } from "@/lib/actions"
import { toast } from "sonner"

type Task = {
  id:          string
  title:       string
  description: string | null
  priority:    string
  status:      string
}

type Phase = "work" | "break"

const WORK_SECONDS   = 25 * 60
const BREAK_SECONDS  = 5  * 60
const ROUNDS_PER_SET = 4

// Ring geometry — SVG 260×260, center (130,130)
const RADIUS       = 100
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const priorityStyle: Record<string, string> = {
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

function formatDuration(seconds: number) {
  if (seconds === 0) return "0s"
  if (seconds < 60)  return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

type Props = {
  task:    Task
  onClose: () => void
}

export function FocusMode({ task, onClose }: Props) {
  const [phase, setPhase]           = useState<Phase>("work")
  const [running, setRunning]       = useState(false)
  const [secondsLeft, setSeconds]   = useState(WORK_SECONDS)
  const [notes, setNotes]           = useState("")
  const [completing, setCompleting] = useState(false)
  const [saved, setSaved]           = useState(false)
  const [completedRounds, setCompletedRounds] = useState(0)
  const [elapsedDisplay, setElapsedDisplay]   = useState(0)

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef   = useRef(0)
  const notesRef     = useRef("")
  const completedRef = useRef(false)
  const savedRef     = useRef(false)

  useEffect(() => { notesRef.current = notes }, [notes])

  // Elapsed work-phase counter
  useEffect(() => {
    if (!running || phase !== "work") return
    const id = setInterval(() => {
      elapsedRef.current += 1
      setElapsedDisplay(elapsedRef.current)
    }, 1000)
    return () => clearInterval(id)
  }, [running, phase])

  // Countdown
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          if (phase === "work") {
            setCompletedRounds((r) => r + 1)
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

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (savedRef.current) return
      if (elapsedRef.current < 10) return
      savedRef.current = true
      saveFocusSession({
        taskId:    task.id,
        duration:  elapsedRef.current,
        completed: completedRef.current,
        notes:     notesRef.current,
      }).catch(() => {})
    }
  }, [task.id])

  // Keyboard shortcuts
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

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function switchPhase() {
    setRunning(false)
    if (phase === "work") { setPhase("break"); setSeconds(BREAK_SECONDS) }
    else                  { setPhase("work");  setSeconds(WORK_SECONDS)  }
  }

  function reset() {
    setRunning(false)
    setSeconds(phase === "work" ? WORK_SECONDS : BREAK_SECONDS)
  }

  async function handleSaveNotes() {
    if (elapsedDisplay < 10 && !notes.trim()) return
    savedRef.current = true
    setSaved(true)
    try {
      await saveFocusSession({ taskId: task.id, duration: elapsedRef.current, completed: false, notes })
      toast.success("Session notes saved")
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error("Failed to save notes")
      setSaved(false)
    }
    savedRef.current = false
  }

  async function handleMarkDone() {
    setCompleting(true)
    completedRef.current = true
    try {
      savedRef.current = true
      await saveFocusSession({ taskId: task.id, duration: elapsedRef.current, completed: true, notes })
      await updateTaskStatus(task.id, "DONE")
      toast.success("Task done + session saved! 🎉")
      onClose()
    } catch {
      toast.error("Failed to update task")
      completedRef.current = false
      savedRef.current = false
      setCompleting(false)
    }
  }

  // Ring math
  const total      = phase === "work" ? WORK_SECONDS : BREAK_SECONDS
  const progress   = secondsLeft / total
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const ringColor =
    phase === "break" ? "#10b981" :
    progress > 0.33   ? "#6366f1" :
    progress > 0.15   ? "#f59e0b" : "#ef4444"

  const glowColor =
    phase === "break" ? "rgba(16,185,129,0.18)" :
    progress > 0.33   ? "rgba(99,102,241,0.18)"  :
    progress > 0.15   ? "rgba(245,158,11,0.18)"  : "rgba(239,68,68,0.18)"

  const completedInSet  = completedRounds % ROUNDS_PER_SET
  const remainingRounds = ROUNDS_PER_SET - completedInSet

  return (
    <div className="fixed inset-0 z-[100] bg-[#040406] flex flex-col md:flex-row overflow-hidden">

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[#333] hover:text-[#777] hover:bg-white/5 transition-colors"
      >
        <X size={16} />
      </button>

      {/* ═══════════ LEFT — Timer ═══════════ */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-8 py-14 relative min-h-[60vh] md:min-h-0">

        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-[1200ms]"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${glowColor}, transparent)` }}
        />

        {/* Round dots */}
        <div className="flex items-center gap-3 z-10">
          <span className="text-[10px] font-semibold text-[#333] uppercase tracking-[0.18em]">Round</span>
          <div className="flex items-center gap-[7px]">
            {Array.from({ length: ROUNDS_PER_SET }, (_, i) => (
              <div
                key={i}
                className="w-[7px] h-[7px] rounded-full transition-all duration-500"
                style={{
                  background: i < completedInSet
                    ? ringColor
                    : i === completedInSet && phase === "work" && running
                    ? `${ringColor}55`
                    : "#1c1c1c",
                  boxShadow: i < completedInSet ? `0 0 6px ${ringColor}80` : "none",
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-[#333]">
            {completedInSet + (phase === "work" ? 1 : 0)} / {ROUNDS_PER_SET}
          </span>
        </div>

        {/* Phase badge */}
        <span
          className="z-10 text-[10.5px] font-bold tracking-[0.2em] uppercase px-5 py-1.5 rounded-full border transition-all duration-500"
          style={{
            color:            ringColor,
            borderColor:      `${ringColor}40`,
            backgroundColor:  `${ringColor}10`,
          }}
        >
          {phase === "work" ? "Focus Session" : "Break Time"}
        </span>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center z-10">

          {/* Soft glow halo behind ring */}
          <div
            className="absolute rounded-full transition-all duration-[1200ms] blur-3xl"
            style={{
              width: 200, height: 200,
              background: `radial-gradient(circle, ${ringColor}30 0%, transparent 70%)`,
            }}
          />

          <svg width={260} height={260} className="-rotate-90" style={{ filter: `drop-shadow(0 0 12px ${ringColor}30)` }}>
            {/* Tick marks */}
            {Array.from({ length: 60 }, (_, i) => {
              const angle  = (i / 60) * 2 * Math.PI
              const isMaj  = i % 5 === 0
              const cx     = 130
              const cy     = 130
              const inner  = RADIUS + 12
              const outer  = RADIUS + (isMaj ? 20 : 15)
              return (
                <line
                  key={i}
                  x1={cx + inner * Math.cos(angle)} y1={cy + inner * Math.sin(angle)}
                  x2={cx + outer * Math.cos(angle)} y2={cy + outer * Math.sin(angle)}
                  stroke={isMaj ? "#1f1f1f" : "#141414"}
                  strokeWidth={isMaj ? 1.5 : 1}
                  strokeLinecap="round"
                />
              )
            })}
            {/* Track */}
            <circle cx={130} cy={130} r={RADIUS} fill="none" stroke="#0f0f0f" strokeWidth={9} />
            {/* Progress */}
            <circle
              cx={130} cy={130} r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: running ? "stroke-dashoffset 1s linear, stroke 0.8s" : "stroke 0.8s" }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span
              className="text-[50px] font-bold tracking-tight tabular-nums leading-none text-white"
            >
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] text-[#333] font-medium mt-1">
              {phase === "work" ? "until break" : "until focus"}
            </span>
            {elapsedDisplay > 0 && (
              <span className="text-[10px] mt-2 font-semibold px-2 py-0.5 rounded-full" style={{ color: ringColor, background: `${ringColor}15` }}>
                {formatDuration(elapsedDisplay)} focused
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 z-10">
          <button
            type="button"
            onClick={reset}
            title="Reset"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#444] hover:text-[#888] hover:bg-white/5 border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-white border transition-all shadow-2xl"
            style={{
              background:   running ? "#111" : ringColor,
              borderColor:  running ? "#2a2a2a" : `${ringColor}cc`,
              boxShadow:    running ? "none" : `0 0 30px ${ringColor}40, 0 8px 24px ${ringColor}30`,
            }}
          >
            {running
              ? <Pause size={24} />
              : <Play  size={24} className="ml-0.5" />
            }
          </button>

          <button
            type="button"
            onClick={switchPhase}
            title={phase === "work" ? "Take a break" : "Back to focus"}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#444] hover:text-[#888] hover:bg-white/5 border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
          >
            <Coffee size={15} />
          </button>
        </div>

        <p className="text-[10.5px] text-[#222] z-10 tracking-wide">
          Space to start / pause · Esc to exit
        </p>
      </div>

      {/* ═══════════ RIGHT — Task + Notes ═══════════ */}
      <div className="w-full md:w-[360px] flex flex-col border-t md:border-t-0 md:border-l border-[#0f0f0f] bg-[#060608]">

        {/* Task header */}
        <div className="p-6 border-b border-[#0f0f0f]">
          <div className="flex items-start gap-3 mb-3">
            <p className="text-[15px] font-semibold text-[#e0e0e0] leading-snug flex-1">
              {task.title}
            </p>
            <span className={`text-[10px] font-bold px-2.5 py-[4px] rounded-full border flex-shrink-0 mt-0.5 ${priorityStyle[task.priority] ?? priorityStyle.MEDIUM}`}>
              {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            </span>
          </div>

          {task.description && (
            <p className="text-[12px] text-[#444] leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-[#0f0f0f]">
            {[
              { label: "Rounds done", value: completedRounds },
              { label: "Time focused", value: formatDuration(elapsedDisplay) },
              { label: "Remaining",   value: remainingRounds },
            ].map((stat, i) => (
              <div key={i} className="text-center flex-1">
                <p className="text-[17px] font-bold text-[#d0d0d0] tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] text-[#333] mt-1.5 leading-none">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col p-6 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#333] uppercase tracking-[0.18em]">
              Session Notes
            </span>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={saved || (elapsedDisplay < 10 && !notes.trim())}
              className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#444] hover:text-[#777] disabled:opacity-25 transition-colors"
            >
              <Save size={10} />
              {saved ? "Saved!" : "Save now"}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot thoughts, blockers, or next steps..."
            className="flex-1 w-full min-h-[120px] bg-[#0a0a0c] border border-[#111] focus:border-[#1f1f1f] rounded-[10px] px-4 py-3 text-[13px] text-[#bbb] placeholder-[#222] outline-none resize-none transition-colors leading-relaxed"
          />
          {elapsedDisplay >= 10 && (
            <p className="text-[10px] text-[#222]">Auto-saves on exit</p>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col gap-2.5">
          {task.status !== "DONE" && (
            <button
              type="button"
              onClick={handleMarkDone}
              disabled={completing}
              className="w-full h-11 text-[13px] font-semibold text-white rounded-[10px] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{
                background:    "linear-gradient(135deg, #059669, #10b981)",
                border:        "1px solid #047857",
                boxShadow:     "0 4px 16px rgba(16,185,129,0.25)",
              }}
            >
              <CheckCircle2 size={15} />
              {completing ? "Saving..." : "Mark as done"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 text-[12px] font-medium text-[#444] hover:text-[#777] bg-transparent hover:bg-white/[0.025] border border-[#111] hover:border-[#1f1f1f] rounded-[10px] transition-all"
          >
            Exit focus
          </button>
        </div>
      </div>
    </div>
  )
}
