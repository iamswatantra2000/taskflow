// components/features/OnboardingTour.tsx
"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard, FolderPlus, CheckSquare,
  BarChart3, X, ChevronRight, ChevronLeft, Check,
} from "lucide-react"

const TOUR_KEY = "tf_tour_v1"

const steps = [
  {
    icon:      LayoutDashboard,
    gradient:  "from-indigo-500 to-violet-600",
    glow:      "rgba(99,102,241,0.2)",
    bar:       "from-indigo-500 to-violet-500",
    badge:     "text-indigo-300 bg-indigo-500/[0.1] border-indigo-500/25",
    badgeText: "Welcome",
    title:     "Welcome to TaskFlow",
    description:
      "Your all-in-one workspace for managing projects, tracking tasks, and shipping faster. Here's everything you need to know to hit the ground running.",
    highlights: ["Kanban board", "Real-time stats", "Team workspaces"],
  },
  {
    icon:      FolderPlus,
    gradient:  "from-violet-500 to-purple-600",
    glow:      "rgba(139,92,246,0.2)",
    bar:       "from-violet-500 to-purple-500",
    badge:     "text-violet-300 bg-violet-500/[0.1] border-violet-500/25",
    badgeText: "Projects",
    title:     "Organise with projects",
    description:
      "Everything lives inside projects. Create one from the sidebar — give it a name and a colour. Group your work the way your team actually thinks.",
    highlights: ["Custom colours", "Sidebar shortcuts", "Up to 3 on free"],
  },
  {
    icon:      CheckSquare,
    gradient:  "from-sky-500 to-indigo-600",
    glow:      "rgba(14,165,233,0.2)",
    bar:       "from-sky-500 to-indigo-500",
    badge:     "text-sky-300 bg-sky-500/[0.1] border-sky-500/25",
    badgeText: "Tasks",
    title:     "Create and move tasks",
    description:
      "Hit \"+ New task\" inside any project. Set a priority, a due date, and drag cards between columns — Todo, In Progress, In Review, Done.",
    highlights: ["Priority levels", "Due dates", "Drag & drop"],
  },
  {
    icon:      BarChart3,
    gradient:  "from-emerald-500 to-teal-600",
    glow:      "rgba(16,185,129,0.2)",
    bar:       "from-emerald-500 to-teal-500",
    badge:     "text-emerald-300 bg-emerald-500/[0.1] border-emerald-500/25",
    badgeText: "Analytics",
    title:     "Track everything, always",
    description:
      "Your dashboard shows live stats, a full kanban view, and the activity feed. All your work — one clean, focused overview.",
    highlights: ["Live task stats", "Activity feed", "Analytics (Pro)"],
  },
]

export function OnboardingTour() {
  const [visible,   setVisible]   = useState(false)
  const [step,      setStep]      = useState(0)
  const [exiting,   setExiting]   = useState(false)
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [mounted,   setMounted]   = useState(false)

  // Mount check — show tour if not seen before
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setVisible(true)
      // Small delay so entrance animation triggers after paint
      requestAnimationFrame(() => setTimeout(() => setMounted(true), 30))
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(Math.min(step + 1, steps.length - 1), "forward")
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goTo(Math.max(step - 1, 0), "back")
      if (e.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, step])

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1")
    setMounted(false)
    setTimeout(() => setVisible(false), 350)
  }

  function goTo(next: number, dir: "forward" | "back") {
    if (next === step || exiting) return
    setDirection(dir)
    setExiting(true)
    setTimeout(() => {
      setStep(next)
      setExiting(false)
    }, 180)
  }

  function next() { if (step < steps.length - 1) goTo(step + 1, "forward"); else dismiss() }
  function prev() { if (step > 0) goTo(step - 1, "back") }

  if (!visible) return null

  const cur    = steps[step]
  const Icon   = cur.icon
  const isLast = step === steps.length - 1

  const contentStyle: React.CSSProperties = {
    opacity:   exiting ? 0 : 1,
    transform: exiting
      ? `translateX(${direction === "forward" ? "-12px" : "12px"}) translateY(4px)`
      : "translateX(0) translateY(0)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">

      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-default"
        onClick={dismiss}
        aria-label="Close tour"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[480px] rounded-[22px] border border-[var(--tf-border)] bg-[var(--tf-bg-card)] overflow-hidden flex flex-col"
        style={{
          height:     "500px",
          boxShadow: "0 40px 100px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Step-coloured glow inside card */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[320px] h-[200px] rounded-full blur-[80px] pointer-events-none transition-all duration-700"
          style={{ background: cur.glow }}
        />

        {/* ── Segmented progress bar ── */}
        <div className="flex gap-1 p-3 pb-0">
          {steps.map((s, i) => (
            <button
              key={`seg-${i}`}
              type="button"
              onClick={() => goTo(i, i > step ? "forward" : "back")}
              aria-label={`Go to step ${i + 1}`}
              className="flex-1 h-[3px] rounded-full overflow-hidden bg-slate-200 dark:bg-white/[0.06] relative transition-colors hover:bg-slate-300 dark:hover:bg-white/[0.1]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${cur.bar} rounded-full transition-all duration-500`}
                style={{ transform: i <= step ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left" }}
              />
            </button>
          ))}
        </div>

        {/* ── Dismiss button ── */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--tf-text-tertiary)] hover:text-slate-600 dark:hover:text-[#888] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all z-10"
        >
          <X size={14} />
        </button>

        {/* ── Main content ── */}
        <div className="relative px-7 pt-6 pb-7 flex flex-col flex-1">
          <div style={contentStyle} className="flex-1 min-h-0">

            {/* Icon */}
            <div className="relative w-fit mb-6">
              {/* Pulse glow ring */}
              <div
                className="absolute -inset-2 rounded-[24px] opacity-40 blur-lg animate-pulse"
                style={{ background: `linear-gradient(135deg, ${cur.glow}, transparent)` }}
              />
              {/* Icon chip */}
              <div className={`relative w-[64px] h-[64px] rounded-[18px] bg-gradient-to-br ${cur.gradient} flex items-center justify-center shadow-2xl`}>
                <Icon size={28} className="text-white" strokeWidth={1.8} />
              </div>
            </div>

            {/* Step badge + counter */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`inline-flex text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${cur.badge}`}>
                {cur.badgeText}
              </span>
              <span className="text-[10.5px] font-medium text-[var(--tf-text-tertiary)]">
                {step + 1} / {steps.length}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[22px] font-bold text-[var(--tf-text-primary)] leading-tight tracking-[-0.03em] mb-3">
              {cur.title}
            </h2>

            {/* Description */}
            <p className="text-[13.5px] text-[var(--tf-text-secondary)] leading-[1.75] mb-5 min-h-[88px]">
              {cur.description}
            </p>

            {/* Highlight chips */}
            <div className="flex flex-wrap gap-2">
              {cur.highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--tf-text-secondary)] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-full px-3 py-1 hover:border-slate-300 dark:hover:border-white/[0.12] hover:text-slate-700 dark:hover:text-[#999] transition-colors"
                >
                  <Check size={9} className="text-[var(--tf-text-tertiary)]" />
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* ── Keyboard hint ── */}
          <p className="text-center text-[10px] text-[var(--tf-text-tertiary)] mt-5 mb-4 select-none">
            Use ← → arrow keys to navigate
          </p>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={dismiss}
              className="text-[12px] font-medium text-[var(--tf-text-tertiary)] hover:text-slate-600 dark:hover:text-[#666] transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex items-center gap-1 h-9 px-4 text-[12.5px] font-medium text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#bbb] bg-[var(--tf-bg-hover)] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-[var(--tf-border)] hover:border-slate-300 dark:hover:border-white/[0.14] rounded-[10px] transition-all duration-150"
                >
                  <ChevronLeft size={13} />
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={next}
                className={`flex items-center gap-1.5 h-9 px-5 text-[13px] font-semibold text-white rounded-[10px] border transition-all duration-150
                  active:translate-y-[2px] active:shadow-none
                  bg-gradient-to-r ${cur.bar} border-transparent shadow-[0_4px_0_0_rgba(0,0,0,0.4)]
                  hover:opacity-90`}
              >
                {isLast ? "Get started ✦" : "Next"}
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
