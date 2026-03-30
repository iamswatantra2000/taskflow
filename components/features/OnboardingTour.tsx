// components/features/OnboardingTour.tsx
"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard, FolderPlus, CheckSquare,
  BarChart2, X, ChevronRight,
} from "lucide-react"

const TOUR_KEY = "tf_tour_v1"

const steps = [
  {
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-500/30",
    title: "Welcome to TaskFlow",
    description:
      "Your all-in-one workspace for managing projects, tracking tasks, and shipping faster. Let us walk you through what's inside.",
  },
  {
    icon: FolderPlus,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    title: "Create a project",
    description:
      "Everything lives inside projects. Use the sidebar to create one — give it a name and pick a color. You can have as many as you need.",
  },
  {
    icon: CheckSquare,
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/30",
    title: "Add and move tasks",
    description:
      "Inside a project, hit \"+ New task\" to create tasks. Set priorities, due dates, and drag them between columns — Todo, In Progress, In Review, Done.",
  },
  {
    icon: BarChart2,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
    title: "Track everything",
    description:
      "Your dashboard shows real-time stats, a full kanban board, and the activity feed. All your work — one beautiful overview.",
  },
]

export function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep]       = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1")
    setVisible(false)
  }

  function goTo(next: number) {
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 150)
  }

  function next() {
    if (step < steps.length - 1) goTo(step + 1)
    else dismiss()
  }

  function prev() {
    if (step > 0) goTo(step - 1)
  }

  if (!visible) return null

  const current = steps[step]
  const Icon    = current.icon
  const isLast  = step === steps.length - 1
  const isFirst = step === 0

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
        onClick={dismiss}
        aria-label="Close tour"
      />

      {/* Card */}
      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl shadow-black/80 overflow-hidden">

        {/* Top accent line */}
        <div className={`h-[2px] w-full bg-gradient-to-r ${current.gradient} transition-all duration-500`} />

        <div className="p-6 sm:p-7">
          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#888] hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-7">
            {steps.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => goTo(i)}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === step   ? "w-8 bg-indigo-500"
                  : i < step  ? "w-3 bg-indigo-500/40"
                  :              "w-3 bg-white/10 hover:bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className={`transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}>
            {/* Icon */}
            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${current.gradient} flex items-center justify-center mb-5 shadow-xl ${current.glow}`}>
              <Icon size={22} className="text-white" />
            </div>

            {/* Meta */}
            <p className="text-[10.5px] font-semibold text-[#444] uppercase tracking-[0.1em] mb-2">
              Step {step + 1} of {steps.length}
            </p>

            <h2 className="text-[18px] font-semibold text-white mb-2.5 leading-snug tracking-[-0.02em]">
              {current.title}
            </h2>

            <p className="text-[13px] text-[#666] leading-[1.7] mb-8">
              {current.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={dismiss}
              className="text-[12px] text-[#3a3a3a] hover:text-[#666] transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prev}
                  className="h-8 px-3.5 text-[12px] font-medium text-[#555] hover:text-white bg-[#111] hover:bg-[#161616] border border-white/8 hover:border-white/15 rounded-[8px] shadow-[0_3px_0_0_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-none transition-all duration-100"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1.5 h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12.5px] font-semibold rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100"
              >
                {isLast ? "Get started" : "Next"}
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
