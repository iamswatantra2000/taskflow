"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    n: "01",
    title: "Create your workspace",
    desc: "Sign up in under 60 seconds. Your workspace is ready immediately — no setup, no config.",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-600/12",
    border: "border-indigo-200 dark:border-indigo-500/20",
  },
  {
    n: "02",
    title: "Add your projects",
    desc: "Create color-coded projects for each initiative. Organize work exactly how you think.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-600/12",
    border: "border-violet-200 dark:border-violet-500/20",
  },
  {
    n: "03",
    title: "Build your task board",
    desc: "Add tasks with priorities and due dates. Assign to team members so everyone knows what's next.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-600/12",
    border: "border-blue-200 dark:border-blue-500/20",
  },
  {
    n: "04",
    title: "Ship together",
    desc: "Drag tasks across columns as work progresses. Watch your team's velocity grow every sprint.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-600/12",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
]

export function LandingHowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".how-heading",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.65,
          scrollTrigger: { trigger: ".how-heading", start: "top 85%", once: true },
        }
      )
      gsap.fromTo(".how-step",
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".how-step", start: "top 88%", once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-6xl mx-auto">

        <div className="how-heading text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="font-geist text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">How it works</span>
          </div>
          <h2 className="font-bricolage text-[30px] sm:text-[46px] font-extrabold text-[var(--tf-text-primary)] mb-3 sm:mb-4 tracking-tight">
            Up and running in minutes
          </h2>
          <p className="font-geist text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] max-w-[420px] mx-auto leading-relaxed">
            No lengthy onboarding. No overwhelming settings. Just a clean workspace ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.n} className="how-step relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[22px] left-[calc(50%+30px)] right-[-calc(50%-30px)] h-px bg-gradient-to-r from-slate-300 dark:from-white/8 to-transparent z-10" />
              )}
              <div className="group border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] hover:border-slate-300 dark:hover:border-white/10 rounded-[16px] sm:rounded-[18px] p-5 h-full transition-colors duration-200">
                <div className={`w-10 h-10 rounded-[11px] ${step.bg} border ${step.border} flex items-center justify-center mb-4`}>
                  <span className={`font-bricolage text-[13px] font-bold ${step.color}`}>{step.n}</span>
                </div>
                <h3 className="font-bricolage text-[14px] font-bold text-[var(--tf-text-primary)] mb-2">{step.title}</h3>
                <p className="font-geist text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
