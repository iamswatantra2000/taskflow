"use client"

/**
 * Landing page — single unified client component.
 * One GSAP context · one design token set · one animation pattern.
 *
 * Animation rules (never deviate):
 *   - Hero elements:   data-hero  → staggered fromTo opacity/y on mount
 *   - Scroll reveals:  data-animate → ScrollTrigger.batch, same easing/duration everywhere
 *   - Hover on cards:  CSS only, `transition-colors duration-200`
 *   - Magnetic btns:   GSAP on mousemove, elastic spring-back on leave
 */

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowRight, Sparkles, Star,
  CheckSquare, Zap, Users, BarChart2, Clock, Shield,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — single source of truth for the entire landing page
// ─────────────────────────────────────────────────────────────────────────────
const $ = {
  // Layout
  container: "max-w-6xl mx-auto px-5 sm:px-6",
  section:   "py-24 sm:py-32 border-t border-[var(--tf-border)]",

  // Cards — identical everywhere
  card: [
    "border border-[var(--tf-border)] bg-[var(--tf-bg-card)]",
    "rounded-[16px] p-5 sm:p-6",
    "hover:border-slate-300 dark:hover:border-white/[0.09]",
    "hover:bg-[var(--tf-bg-hover)]",
    "transition-colors duration-200",
  ].join(" "),

  // Section header
  badge: "inline-flex items-center gap-1.5 border border-[var(--tf-border)] bg-[var(--tf-bg-hover)] rounded-full px-3.5 py-1.5 mb-4",
  badgeText: "font-geist text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.12em]",

  // Typography — Bricolage headings, Geist body everywhere
  h1: "font-bricolage font-extrabold tracking-tight leading-[1.01] text-[var(--tf-text-primary)]",
  h2: "font-bricolage font-extrabold tracking-tight leading-[1.04] text-[var(--tf-text-primary)] text-[34px] sm:text-[52px]",
  h3: "font-bricolage font-bold text-[16px] text-[var(--tf-text-primary)]",
  body: "font-geist text-[15px] sm:text-[16px] leading-[1.75] text-[var(--tf-text-secondary)]",
  small: "font-geist text-[13px] leading-[1.7] text-[var(--tf-text-tertiary)]",

  // Buttons — Inter, identical shape
  btnPrimary: [
    "font-inter-landing group relative inline-flex items-center justify-center gap-2",
    "h-11 px-7 rounded-[10px] text-[14px] font-semibold text-white",
    "bg-[var(--tf-accent)] border border-indigo-600/60",
    "shadow-[0_4px_0_0_#3730a3]",
    "active:translate-y-[4px] active:shadow-none",
    "transition-all duration-150 whitespace-nowrap overflow-hidden",
  ].join(" "),
  btnSecondary: [
    "font-inter-landing inline-flex items-center justify-center gap-2",
    "h-11 px-7 rounded-[10px] text-[14px] font-medium",
    "border border-[var(--tf-border)] bg-[var(--tf-bg-card)]",
    "text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-bg-hover)]",
    "shadow-[0_4px_0_0_rgba(0,0,0,0.07)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.4)]",
    "active:translate-y-[4px] active:shadow-none",
    "transition-all duration-150 whitespace-nowrap",
  ].join(" "),
}

// ─────────────────────────────────────────────────────────────────────────────
// Magnetic wrapper — used on all CTA buttons, nowhere else
// ─────────────────────────────────────────────────────────────────────────────
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  function move(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    gsap.to(el, {
      x: (e.clientX - r.left - r.width  / 2) * 0.32,
      y: (e.clientY - r.top  - r.height / 2) * 0.32,
      duration: 0.3, ease: "power2.out",
    })
  }

  function reset() {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" })
  }

  return (
    <div ref={ref} className="inline-block" onMouseMove={move} onMouseLeave={reset}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-6 overflow-hidden pt-14">

      {/* Background grid + orbs */}
      <div className="absolute inset-0 bg-[var(--tf-bg-panel)]">
        <div className="block dark:hidden absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }} />
        <div className="hidden dark:block absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }} />
        <div className="animate-float-orb-1 absolute top-[18%] left-[6%] w-[520px] h-[520px] bg-indigo-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="animate-float-orb-2 absolute bottom-[8%] right-[4%] w-[440px] h-[440px] bg-violet-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-[860px] mx-auto text-center w-full">

        {/* Badge */}
        <div data-hero className="inline-flex items-center gap-2 border border-indigo-400/20 bg-indigo-500/[0.06] rounded-full px-4 py-1.5 mb-8 cursor-default">
          <Sparkles size={11} className="text-indigo-400" />
          <span className="font-geist text-[12px] font-medium text-indigo-600 dark:text-indigo-300 tracking-wide">
            Now in beta — free for everyone
          </span>
        </div>

        {/* Headline */}
        <h1 data-hero className={`${$.h1} text-[36px] sm:text-[54px] md:text-[68px] mb-6`}>
          The workspace where<br />
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-400 bg-clip-text text-transparent">
            great teams ship
          </span>
        </h1>

        {/* Subtext */}
        <p data-hero className={`${$.body} max-w-[500px] mx-auto mb-10`}>
          Organize projects, track tasks, and collaborate seamlessly — all in one beautiful workspace built for speed.
        </p>

        {/* CTAs */}
        <div data-hero className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
          <Magnetic>
            <Link href="/register" className={$.btnPrimary}>
              <span className="relative z-10 flex items-center gap-2">
                Start for free
                <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
              {/* Shine sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/login" className={$.btnSecondary}>Sign in</Link>
          </Magnetic>
        </div>

        {/* Trust line */}
        <p data-hero className="font-geist text-[12px] text-[var(--tf-text-tertiary)] mb-16">
          No credit card · Free forever plan · 2-minute setup
        </p>

        {/* Stats */}
        <div data-hero className="flex items-center justify-center gap-10 sm:gap-16 mb-16">
          {[["12k+", "Teams"], ["1M+", "Tasks created"], ["99.9%", "Uptime"]] .map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-bricolage text-[30px] sm:text-[38px] font-extrabold text-[var(--tf-text-primary)] tabular-nums">{v}</p>
              <p className="font-geist text-[11.5px] text-[var(--tf-text-tertiary)] mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* App mockup */}
        <div data-hero className="relative">
          {/* Fade-out bottom */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-[var(--tf-bg-panel)] z-10 pointer-events-none" />
          {/* Glow ring */}
          <div className="absolute -inset-px rounded-[20px] bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-indigo-500/10 blur pointer-events-none" />

          <div className="relative border border-[var(--tf-border)] rounded-[18px] overflow-hidden shadow-[0_2px_0_1px_rgba(99,102,241,0.08),0_12px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_0_1px_rgba(99,102,241,0.1),0_12px_80px_rgba(0,0,0,0.72)]">
            {/* Browser chrome */}
            <div className="bg-[var(--tf-bg-panel)] border-b border-[var(--tf-border)] px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4 flex justify-center">
                <div className="bg-slate-100 dark:bg-[var(--tf-bg-dropdown)] rounded-[6px] px-3 py-1 text-[10px] text-[var(--tf-text-tertiary)] w-[180px] text-center">
                  app.taskflow.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="flex h-[240px] sm:h-[340px]">

              {/* Sidebar */}
              <div className="hidden sm:flex w-[152px] border-r border-[var(--tf-border)] bg-[var(--tf-bg-panel)] p-3 flex-col flex-shrink-0">
                <div className="flex items-center gap-2 px-1 mb-4">
                  <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0" />
                  <div className="h-2 w-12 bg-[var(--tf-text-tertiary)]/10 rounded" />
                </div>
                {[72, 56, 64, 50].map((w, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: preview
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-[7px] mb-0.5 ${i === 0 ? "bg-indigo-500/[0.07]" : ""}`}>
                    <div className={`w-3 h-3 rounded flex-shrink-0 ${i === 0 ? "bg-indigo-500/25" : "bg-[var(--tf-text-tertiary)]/8"}`} />
                    <div className={`h-1.5 rounded ${i === 0 ? "bg-indigo-400/20" : "bg-[var(--tf-text-tertiary)]/8"}`} style={{ width: `${w}%` }} />
                  </div>
                ))}
                <div className="mt-5 px-1 space-y-2.5">
                  <div className="h-1.5 w-8 bg-[var(--tf-text-tertiary)]/8 rounded" />
                  {[
                    { color: "#6366f1", w: 48 }, { color: "#0ea5e9", w: 42 },
                    { color: "#10b981", w: 45 }, { color: "#f59e0b", w: 39 },
                  ].map(({ color, w }, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: preview
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div className="h-1.5 rounded bg-[var(--tf-text-tertiary)]/8" style={{ width: `${w}px` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Board area */}
              <div className="flex-1 p-3 sm:p-4 bg-[var(--tf-bg-hover)]">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { n: "24", l: "Total",  c: "text-[var(--tf-text-primary)]" },
                    { n: "8",  l: "Active", c: "text-indigo-500 dark:text-indigo-400" },
                    { n: "12", l: "Done",   c: "text-emerald-600 dark:text-emerald-400" },
                    { n: "4",  l: "Todo",   c: "text-amber-600 dark:text-amber-400" },
                  ].map(s => (
                    <div key={s.l} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[8px] p-2">
                      <p className="text-[8px] text-[var(--tf-text-tertiary)] mb-0.5">{s.l}</p>
                      <p className={`text-[14px] sm:text-[20px] font-bold ${s.c}`}>{s.n}</p>
                    </div>
                  ))}
                </div>

                {/* Kanban */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: "Todo",     dot: "#94a3b8", tasks: ["Write specs", "Research"] },
                    { l: "Progress", dot: "#6366f1", tasks: ["Build API",   "Design UI"] },
                    { l: "Review",   dot: "#f59e0b", tasks: ["PR #42"] },
                    { l: "Done",     dot: "#10b981", tasks: ["Deploy v1"] },
                  ].map(col => (
                    <div key={col.l} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[8px] p-2">
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.dot }} />
                        <span className="text-[8px] text-[var(--tf-text-tertiary)] truncate">{col.l}</span>
                      </div>
                      {col.tasks.map(t => (
                        <div key={t} className="bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-[5px] p-1.5 mb-1 last:mb-0">
                          <p className="text-[8px] sm:text-[9.5px] text-[var(--tf-text-secondary)] truncate">{t}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Logo strip
// ─────────────────────────────────────────────────────────────────────────────
const LOGOS = [
  "Vercel", "Stripe", "Linear", "Figma", "Notion",
  "Loom", "Raycast", "Supabase", "Resend", "Clerk",
]

function LogoStrip() {
  const doubled = [...LOGOS, ...LOGOS]
  return (
    <div className="border-t border-b border-[var(--tf-border)] py-5 overflow-hidden">
      <p className="font-geist text-center text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.14em] mb-4">
        Trusted by teams at
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />
        <div className="flex w-max animate-marquee-left">
          {doubled.map((name, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: marquee
            <span key={i} className="font-geist inline-flex items-center gap-2 px-5 text-[13px] font-medium text-[var(--tf-text-tertiary)] whitespace-nowrap select-none">
              <span className="w-1 h-1 rounded-full bg-[var(--tf-text-tertiary)]/25 flex-shrink-0" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Features — 3-col grid, all cards identical
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: CheckSquare, tint: "text-indigo-500",  bg: "bg-indigo-500/[0.08]",  title: "Task management",   desc: "Create tasks with priorities, due dates, and statuses. Everything your team needs to stay on track." },
  { Icon: Zap,         tint: "text-violet-500",  bg: "bg-violet-500/[0.08]",  title: "Drag & drop board", desc: "Move tasks between columns with a smooth Kanban board. Status syncs instantly for your whole team." },
  { Icon: Users,       tint: "text-blue-500",    bg: "bg-blue-500/[0.08]",    title: "Team workspaces",   desc: "Invite teammates, assign tasks, and collaborate in shared workspaces. Everyone stays aligned." },
  { Icon: BarChart2,   tint: "text-emerald-500", bg: "bg-emerald-500/[0.08]", title: "Analytics",         desc: "Track completion rates, velocity, and project health. Make decisions backed by real data." },
  { Icon: Clock,       tint: "text-amber-500",   bg: "bg-amber-500/[0.08]",   title: "Activity feed",     desc: "See everything happening across your workspace in real time. Never miss a task update again." },
  { Icon: Shield,      tint: "text-rose-500",    bg: "bg-rose-500/[0.08]",    title: "Secure by default", desc: "bcrypt auth, JWT sessions, route-level protection. Your data is private, encrypted, and yours." },
]

function Features() {
  return (
    <section id="features" className={$.section}>
      <div className={$.container}>

        <div data-animate className="text-center mb-16">
          <div className={$.badge}><span className={$.badgeText}>Features</span></div>
          <h2 className={`${$.h2} mb-4`}>Everything your team needs</h2>
          <p className={`${$.body} max-w-[440px] mx-auto`}>
            Built for modern teams who want to move fast without the complexity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div data-animate key={f.title} className={`${$.card} group`}>
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center mb-4 ${f.bg}`}>
                <f.Icon size={16} className={f.tint} />
              </div>
              <h3 className={`${$.h3} mb-2`}>{f.title}</h3>
              <p className={$.small}>{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works — 4 numbered steps
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Create your workspace",  desc: "Sign up in 60 seconds. Your workspace is ready immediately — no setup, no config." },
  { n: "02", title: "Add your projects",       desc: "Create color-coded projects for each initiative. Organize work exactly how you think." },
  { n: "03", title: "Build your task board",   desc: "Add tasks with priorities and due dates. Assign to members so everyone knows what's next." },
  { n: "04", title: "Ship together",           desc: "Drag tasks across columns as work progresses. Watch your team's velocity grow every sprint." },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className={$.section}>
      <div className={$.container}>

        <div data-animate className="text-center mb-16">
          <div className={$.badge}><span className={$.badgeText}>How it works</span></div>
          <h2 className={`${$.h2} mb-4`}>Up and running in minutes</h2>
          <p className={`${$.body} max-w-[440px] mx-auto`}>
            No lengthy onboarding. No overwhelming settings. Just a clean workspace ready to use.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div data-animate key={s.n} className={`${$.card} relative`}>
              {/* Connector line between steps */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-[29px] left-[calc(50%+26px)] right-[calc(-50%+26px)] h-px bg-gradient-to-r from-[var(--tf-border)] to-transparent z-10" />
              )}
              <div className="w-10 h-10 rounded-[10px] bg-indigo-500/[0.07] border border-indigo-500/15 flex items-center justify-center mb-4">
                <span className="font-bricolage text-[13px] font-bold text-indigo-600 dark:text-indigo-400">{s.n}</span>
              </div>
              <h3 className={`${$.h3} mb-2`}>{s.title}</h3>
              <p className={$.small}>{s.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Testimonials — dual-row infinite marquee
// ─────────────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah Chen",    role: "Engineering Lead · Vercel",     av: "SC", color: "from-pink-500 to-rose-500",     quote: "TaskFlow replaced three different tools for us. Our team's velocity went up 40% in the first month." },
  { name: "Marcus Rivera", role: "CTO · Stripe",                  av: "MR", color: "from-blue-500 to-cyan-500",     quote: "No lengthy onboarding. We were productive on day one — and the design is genuinely beautiful." },
  { name: "Priya Patel",   role: "Product Manager · Linear",      av: "PP", color: "from-violet-500 to-purple-500", quote: "I've tried Jira, Asana, Notion. TaskFlow is the only one my entire team actually uses." },
  { name: "Alex Thompson", role: "Founder · Loom",                av: "AT", color: "from-emerald-500 to-teal-500",  quote: "The drag-and-drop board is buttery smooth. Feels like a product built by people who use it." },
  { name: "Jordan Kim",    role: "Head of Design · Figma",        av: "JK", color: "from-orange-400 to-amber-500",  quote: "Finally a task manager that doesn't feel like a spreadsheet. Clean, fast, and a joy to use." },
  { name: "Riley Morgan",  role: "Staff Engineer · Notion",       av: "RM", color: "from-indigo-500 to-blue-500",   quote: "Moved our whole team over in an afternoon. Real-time updates are a game changer for remote work." },
]

function TCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className={`flex-shrink-0 w-[290px] sm:w-[330px] border border-[var(--tf-border)] bg-[var(--tf-bg-card)] rounded-[16px] p-5 mx-2`}>
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stars
          <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className={`${$.small} mb-4`}>&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--tf-border)]">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
          {t.av}
        </div>
        <div className="min-w-0">
          <p className="font-geist text-[12.5px] font-semibold text-[var(--tf-text-primary)] truncate">{t.name}</p>
          <p className="font-geist text-[11px] text-[var(--tf-text-tertiary)] truncate">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

function Testimonials() {
  const row1 = TESTIMONIALS.slice(0, 3)
  const row2 = TESTIMONIALS.slice(3)
  return (
    <section className={`${$.section} overflow-hidden`}>

      <div className={`${$.container} mb-16`}>
        <div data-animate className="text-center">
          <div className={$.badge}>
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className={$.badgeText}>Loved by teams</span>
          </div>
          <h2 className={$.h2}>Teams that ship use TaskFlow</h2>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />
        <div className="mb-3 overflow-hidden">
          <div className="flex w-max animate-marquee-left">
            {[...row1, ...row1].map((t, i) => <TCard key={i} t={t} />)}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee-right">
            {[...row2, ...row2].map((t, i) => <TCard key={i} t={t} />)}
          </div>
        </div>
      </div>

    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA banner
// ─────────────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className={$.section}>
      <div className={$.container}>
        <div data-animate className="relative rounded-[22px] border border-indigo-200 dark:border-indigo-500/20 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/20 dark:via-[var(--tf-bg-card)] dark:to-violet-950/20 p-10 sm:p-16 text-center">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-indigo-500/[0.1] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-24 bg-violet-500/[0.07] rounded-full blur-[60px] pointer-events-none" />

          <div className="relative">
            <h2 className={`${$.h2} mb-4`}>Ready to ship faster?</h2>
            <p className={`${$.body} max-w-[380px] mx-auto mb-8`}>
              Join thousands of teams already using TaskFlow to organize work and move with clarity.
            </p>
            <Magnetic>
              <Link href="/register" className={$.btnPrimary}>
                <span className="relative z-10 flex items-center gap-2">
                  Get started free
                  <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
              </Link>
            </Magnetic>
            <p className="font-geist mt-4 text-[11.5px] text-[var(--tf-text-tertiary)]">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — manages the single unified GSAP context
// ─────────────────────────────────────────────────────────────────────────────
export function LandingPageClient() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Hero entrance — staggered, immediate
      gsap.fromTo("[data-hero]",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, delay: 0.05 }
      )

      // Scroll reveals — IDENTICAL easing/duration for every section
      ScrollTrigger.batch("[data-animate]", {
        onEnter: batch =>
          gsap.fromTo(batch,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power2.out", stagger: 0.07, overwrite: true }
          ),
        start:  "top 88%",
        once:   true,
      })

    }, ref)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref}>
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  )
}
