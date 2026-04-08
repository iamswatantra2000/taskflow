"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { gsap } from "gsap"
import { HeroMockup } from "@/components/ui/HeroMockup"
import { MagneticButton } from "./MagneticButton"

export function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(".hero-badge",
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.55 }
      )
      .fromTo(".hero-headline",
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.75 },
        "-=0.25"
      )
      .fromTo(".hero-sub",
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.45"
      )
      .fromTo(".hero-ctas",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.35"
      )
      .fromTo(".hero-trust",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      )
      .fromTo(".hero-stats",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        "-=0.1"
      )
      .fromTo(".hero-mockup",
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" },
        "-=0.2"
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-6 overflow-hidden pt-14"
    >
      {/* ── Gradient mesh background ── */}
      <div className="absolute inset-0 bg-[var(--tf-bg-panel)]">
        {/* Grid */}
        <div
          className="block dark:hidden absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="hidden dark:block absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div className="animate-float-orb-1 absolute top-[18%] left-[12%] w-[480px] h-[480px] bg-indigo-500/[0.07] dark:bg-indigo-500/[0.09] rounded-full blur-[120px] pointer-events-none" />
        <div className="animate-float-orb-2 absolute bottom-[15%] right-[10%] w-[380px] h-[380px] bg-violet-500/[0.06] dark:bg-violet-500/[0.08] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[50%] left-[55%] w-[280px] h-[280px] bg-sky-500/[0.04] rounded-full blur-[90px] pointer-events-none" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center w-full">

        {/* Badge */}
        <div className="hero-badge opacity-0 inline-flex items-center gap-2 border border-indigo-500/25 bg-indigo-500/[0.07] rounded-full px-3.5 py-1.5 mb-7 cursor-default">
          <Sparkles size={10} className="text-indigo-400 fill-indigo-400/40" />
          <span className="font-geist text-[11.5px] font-medium text-indigo-600 dark:text-indigo-300 tracking-wide">
            Now in beta — free for everyone
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline opacity-0 font-bricolage text-[42px] sm:text-[66px] md:text-[82px] font-extrabold text-[var(--tf-text-primary)] leading-[1.02] mb-5 sm:mb-6 tracking-tight">
          The workspace where<br className="hidden sm:block" />{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-400 bg-clip-text text-transparent">
              great teams ship
            </span>
          </span>
        </h1>

        {/* Subtext */}
        <p className="hero-sub opacity-0 font-geist text-[15px] sm:text-[17px] text-[var(--tf-text-secondary)] max-w-[520px] mx-auto leading-relaxed mb-9 sm:mb-10 font-normal">
          Organize projects, track tasks, and collaborate seamlessly — all in one beautiful workspace built for speed.
        </p>

        {/* CTAs */}
        <div className="hero-ctas opacity-0 flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <MagneticButton>
            <Link
              href="/register"
              className="font-inter-landing group relative inline-flex items-center justify-center gap-2 h-11 px-7 text-[14px] font-semibold bg-[var(--tf-accent)] text-white rounded-[10px] border border-indigo-600/70 shadow-[0_4px_0_0_#3730a3,0_8px_24px_rgba(99,102,241,0.25)] active:translate-y-[4px] active:shadow-[0_0px_0_0_#3730a3] transition-all duration-150 whitespace-nowrap overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start for free
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
              {/* Shine sweep on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link
              href="/login"
              className="font-inter-landing inline-flex items-center justify-center h-11 px-7 text-[14px] font-medium border border-slate-200 hover:border-slate-300 dark:border-[var(--tf-border)] dark:hover:border-white/18 text-slate-600 hover:text-slate-900 dark:text-[var(--tf-text-secondary)] dark:hover:text-white rounded-[10px] bg-white/70 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.06] shadow-[0_4px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.4)] active:translate-y-[4px] active:shadow-none transition-all duration-150 whitespace-nowrap"
            >
              Sign in
            </Link>
          </MagneticButton>
        </div>

        {/* Trust line */}
        <p className="hero-trust opacity-0 font-geist text-[12px] text-[var(--tf-text-tertiary)] mb-10 sm:mb-14">
          No credit card · Free forever plan · 2-minute setup
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-14 mb-14 sm:mb-16">
          {[
            { value: "12k+",  label: "Teams" },
            { value: "1M+",   label: "Tasks created" },
            { value: "99.9%", label: "Uptime" },
          ].map((m) => (
            <div key={m.label} className="hero-stats opacity-0 text-center">
              <p className="font-bricolage text-[26px] sm:text-[32px] font-bold text-[var(--tf-text-primary)] tabular-nums">{m.value}</p>
              <p className="font-geist text-[11px] text-[var(--tf-text-tertiary)] mt-0.5 tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>

        {/* App preview */}
        <HeroMockup className="hero-mockup opacity-0 relative">
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent to-slate-50 dark:to-[#080808] z-10 pointer-events-none" />
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-indigo-500/15 rounded-[20px] blur-sm" />
          <div className="relative border border-[var(--tf-border)] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[var(--tf-bg-card)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_48px_rgba(0,0,0,0.6)]">

            {/* Browser bar */}
            <div className="bg-[var(--tf-bg-panel)] border-b border-[var(--tf-border-subtle)] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-slate-200 dark:bg-[var(--tf-bg-dropdown)] rounded-md px-3 py-1 text-[10px] text-slate-500 dark:text-[var(--tf-text-tertiary)] max-w-[200px] mx-auto text-center">
                  app.taskflow.io/dashboard
                </div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="flex h-[220px] sm:h-[320px]">

              {/* Sidebar */}
              <div className="hidden sm:flex w-[160px] border-r border-[var(--tf-border-subtle)] bg-white dark:bg-transparent p-3 flex-col gap-0.5 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0" />
                  <div className="h-2 w-14 bg-black/[0.08] dark:bg-white/[0.08] rounded" />
                </div>
                {[75, 58, 65].map((w, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: preview
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-black/[0.07] dark:bg-white/[0.08] rounded flex-shrink-0" />
                    <div className="h-2 bg-black/[0.07] dark:bg-white/[0.08] rounded" style={{ width: `${w}%` }} />
                  </div>
                ))}
                <div className="mt-3 px-2 space-y-1.5">
                  <div className="h-1.5 w-10 bg-black/[0.06] dark:bg-white/[0.04] rounded mb-2" />
                  {["#6366f1", "#0ea5e9", "#10b981"].map((color, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: preview
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div className="h-1.5 w-14 bg-black/[0.06] dark:bg-white/[0.06] rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-3 sm:p-4 bg-slate-50 dark:bg-transparent">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
                  {[
                    { n: "24", c: "text-[var(--tf-text-primary)]",           l: "Total"  },
                    { n: "8",  c: "text-indigo-600 dark:text-indigo-400",     l: "Active" },
                    { n: "12", c: "text-emerald-600 dark:text-emerald-400",   l: "Done"   },
                    { n: "4",  c: "text-amber-600 dark:text-amber-400",       l: "Todo"   },
                  ].map((s) => (
                    <div key={s.l} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[8px] p-2.5">
                      <div className="text-[9px] text-[var(--tf-text-tertiary)] mb-1">{s.l}</div>
                      <div className={`text-[15px] sm:text-[20px] font-bold ${s.c}`}>{s.n}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { l: "Todo",        dot: "#94a3b8", t: ["Write docs", "Add tests"] },
                    { l: "In progress", dot: "#6366f1", t: ["Build API",  "Fix auth"]   },
                    { l: "In review",   dot: "#f59e0b", t: ["PR review"]               },
                    { l: "Done",        dot: "#10b981", t: ["Deploy v1"]               },
                  ].map((col) => (
                    <div key={col.l} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[8px] p-2">
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.dot }} />
                        <span className="text-[8.5px] sm:text-[10px] text-slate-500 dark:text-[var(--tf-text-tertiary)] truncate">{col.l}</span>
                      </div>
                      {col.t.map((t) => (
                        <div key={t} className="bg-slate-50 dark:bg-[var(--tf-bg-dropdown)] border border-slate-200 dark:border-[var(--tf-border-subtle)] rounded-[5px] p-1.5 mb-1">
                          <div className="text-[8.5px] sm:text-[10px] text-[var(--tf-text-secondary)] truncate">{t}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </HeroMockup>
      </div>
    </section>
  )
}
