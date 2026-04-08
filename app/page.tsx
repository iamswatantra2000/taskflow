// app/page.tsx
import Link from "next/link"
import {
  CheckSquare, Zap, Shield, Users,
  ArrowRight, Star, BarChart2, Clock,
} from "lucide-react"
import { OnboardingTour } from "@/components/features/OnboardingTour"
import { PricingSection } from "@/components/features/PricingSection"
import { AnimateOnView } from "@/components/ui/AnimateOnView"
import { NavLinks } from "@/components/ui/NavLinks"
import { LogoMark } from "@/components/ui/LogoMark"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { getSession } from "@/lib/session"

// ——— Navbar ———
async function Navbar() {
  const session = await getSession()
  const isLoggedIn = !!session?.user

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200/80 dark:border-[var(--tf-border-subtle)] bg-white/90 dark:bg-[var(--tf-bg-panel)]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-full flex items-center justify-between">

        <div className="flex items-center gap-2">
          <LogoMark height={22} />
          <span className="text-[var(--tf-text-primary)] font-bricolage" style={{ fontWeight: 900, fontSize: 14 }}>TaskFlow</span>
        </div>

        <NavLinks />

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              {/* Greeting chip — desktop only */}
              <span className="hidden sm:block text-[12.5px] text-slate-500 dark:text-[var(--tf-text-tertiary)]">
                Hey, {session.user.name?.split(" ")[0] ?? "there"} 👋
              </span>
              <Link
                href="/dashboard"
                className="h-8 px-4 text-[12.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
              >
                Dashboard
                <ArrowRight size={12} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-[12.5px] text-slate-500 hover:text-slate-900 dark:text-[var(--tf-text-tertiary)] dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="h-8 px-4 text-[12.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// ——— Hero ———
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 sm:px-6 overflow-hidden pt-14">

      {/* Background */}
      <div className="absolute inset-0 bg-[var(--tf-bg-panel)]">
        {/* Light mode grid */}
        <div
          className="block dark:hidden absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Dark mode grid */}
        <div
          className="hidden dark:block absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-violet-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center w-full">

        {/* Badge */}
        <div
          style={{ animation: "fade-in-down 0.5s ease 0.05s both" }}
          className="inline-flex items-center gap-2 border border-indigo-500/25 bg-indigo-500/[0.07] rounded-full px-3.5 py-1.5 mb-7"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
          <span className="text-[11.5px] font-medium text-indigo-600 dark:text-indigo-300">
            Now in beta — free for everyone
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{ animation: "fade-in-up 0.65s ease 0.15s both" }}
          className="text-[40px] sm:text-[62px] md:text-[78px] font-bold text-[var(--tf-text-primary)] leading-[1.04] mb-5 sm:mb-6"
        >
          The workspace where<br className="hidden sm:block" />{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-400 bg-clip-text text-transparent">
            great teams ship
          </span>
        </h1>

        <p
          style={{ animation: "fade-in-up 0.65s ease 0.3s both" }}
          className="text-[15px] sm:text-[17px] text-[var(--tf-text-secondary)] max-w-[520px] mx-auto leading-relaxed mb-9 sm:mb-10"
        >
          Organize projects, track tasks, and collaborate seamlessly — all in one beautiful workspace built for speed.
        </p>

        {/* CTAs */}
        <div
          style={{ animation: "fade-in-up 0.6s ease 0.45s both" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 text-[13.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[9px] border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150 whitespace-nowrap"
          >
            Start for free
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 text-[13.5px] font-medium border border-slate-200 hover:border-slate-300 dark:border-[var(--tf-border)] dark:hover:border-white/18 text-slate-600 hover:text-slate-900 dark:text-[var(--tf-text-secondary)] dark:hover:text-white rounded-[9px] bg-white/70 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.05] shadow-[0_4px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.4)] active:translate-y-[4px] active:shadow-none transition-all duration-150 whitespace-nowrap"
          >
            Sign in
          </Link>
        </div>

        <p
          style={{ animation: "fade-in-up 0.5s ease 0.55s both" }}
          className="mt-5 text-[12px] text-[var(--tf-text-tertiary)]"
        >
          No credit card · Free forever plan · 2-minute setup
        </p>

        {/* Metrics */}
        <div
          style={{ animation: "fade-in-up 0.6s ease 0.65s both" }}
          className="flex items-center justify-center gap-8 sm:gap-14 mt-12 sm:mt-16 mb-12 sm:mb-16"
        >
          {[
            { value: "12k+",  label: "Teams" },
            { value: "1M+",   label: "Tasks created" },
            { value: "99.9%", label: "Uptime" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-[24px] sm:text-[30px] font-bold text-[var(--tf-text-primary)]">{m.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-[var(--tf-text-tertiary)] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* App preview */}
        <div style={{ animation: "fade-in-up 0.8s ease 0.75s both" }} className="relative">
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent to-slate-50 dark:to-[#080808] z-10 pointer-events-none" />
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-indigo-500/15 rounded-[20px] blur-sm" />
          <div className="relative border border-[var(--tf-border)] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[var(--tf-bg-card)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)]">

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
            <div className="flex h-[220px] sm:h-[310px]">

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

              {/* Main */}
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
                    { l: "In progress", dot: "#6366f1", t: ["Build API", "Fix auth"]   },
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
        </div>
      </div>
    </section>
  )
}

// ——— Features ———
function Features() {
  const features = [
    {
      icon: CheckSquare,
      color: "text-indigo-500 dark:text-indigo-400",
      bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20",
      title: "Task management",
      description: "Create tasks with priorities, due dates, and statuses. Everything your team needs to stay on track.",
    },
    {
      icon: Zap,
      color: "text-violet-500 dark:text-violet-400",
      bg: "bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/20",
      title: "Drag & drop board",
      description: "Move tasks between columns with a smooth Kanban board. Status syncs instantly for your whole team.",
    },
    {
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20",
      title: "Team workspaces",
      description: "Invite teammates, assign tasks, and collaborate in shared workspaces. Everyone stays aligned.",
    },
    {
      icon: BarChart2,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20",
      title: "Analytics & insights",
      description: "Track completion rates, team velocity, and project health. Make decisions backed by real data.",
    },
    {
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",
      title: "Activity feed",
      description: "See everything happening across your workspace in real time. Never miss a task update again.",
    },
    {
      icon: Shield,
      color: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20",
      title: "Secure by default",
      description: "bcrypt auth, JWT sessions, and route-level protection. Your data is private, encrypted, and yours.",
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-6xl mx-auto">

        <AnimateOnView className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">Features</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-[var(--tf-text-primary)] mb-3 sm:mb-4">
            Everything your team needs
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] max-w-[420px] mx-auto leading-relaxed">
            Built for modern teams who want to move fast without the complexity.
          </p>
        </AnimateOnView>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, index) => (
            <AnimateOnView key={f.title} delay={index * 70}>
            <div
              className="group p-5 sm:p-6 border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] hover:border-slate-300 dark:hover:border-white/10 hover:bg-[var(--tf-bg-hover)] shadow-sm dark:shadow-none rounded-[14px] sm:rounded-[16px] transition-all duration-200 h-full"
            >
              <div className={`w-9 h-9 rounded-[10px] border flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon size={15} className={f.color} />
              </div>
              <h3 className="text-[14px] font-semibold text-[var(--tf-text-primary)] mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[var(--tf-text-tertiary)] leading-relaxed">{f.description}</p>
            </div>
            </AnimateOnView>
          ))}
        </div>

      </div>
    </section>
  )
}

// ——— How it works ———
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create your workspace",
      desc: "Sign up in under 60 seconds. Your workspace is ready immediately — no setup, no config.",
    },
    {
      n: "02",
      title: "Add your projects",
      desc: "Create color-coded projects for each initiative. Organize work exactly how you think.",
    },
    {
      n: "03",
      title: "Build your task board",
      desc: "Add tasks with priorities and due dates. Assign to team members so everyone knows what's next.",
    },
    {
      n: "04",
      title: "Ship together",
      desc: "Drag tasks across columns as work progresses. Watch your team's velocity grow every sprint.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-6xl mx-auto">

        <AnimateOnView className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">How it works</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-[var(--tf-text-primary)] mb-3 sm:mb-4">
            Up and running in minutes
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] max-w-[420px] mx-auto leading-relaxed">
            No lengthy onboarding. No overwhelming settings. Just a clean workspace ready to use.
          </p>
        </AnimateOnView>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, index) => (
            <AnimateOnView key={step.n} className="relative" delay={index * 80}>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[22px] left-[calc(50%+30px)] right-[-calc(50%-30px)] h-px bg-gradient-to-r from-slate-300 dark:from-white/8 to-transparent z-10" />
              )}
              <div className="border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] shadow-sm dark:shadow-none rounded-[14px] sm:rounded-[16px] p-5 h-full">
                <div className="w-10 h-10 rounded-[11px] bg-indigo-50 dark:bg-indigo-600/12 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center mb-4">
                  <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">{step.n}</span>
                </div>
                <h3 className="text-[13.5px] font-semibold text-[var(--tf-text-primary)] mb-2">{step.title}</h3>
                <p className="text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            </AnimateOnView>
          ))}
        </div>

      </div>
    </section>
  )
}

// ——— Testimonials ———
function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Engineering Lead · Vercel",
      avatar: "SC",
      color: "from-pink-500 to-rose-500",
      quote: "TaskFlow replaced three different tools for us. Our team's velocity went up 40% in the first month. The board just works.",
    },
    {
      name: "Marcus Rivera",
      role: "CTO · Stripe",
      avatar: "MR",
      color: "from-blue-500 to-cyan-500",
      quote: "No lengthy onboarding. No overwhelming settings. We were productive on day one — and the design is genuinely beautiful.",
    },
    {
      name: "Priya Patel",
      role: "Product Manager · Linear",
      avatar: "PP",
      color: "from-violet-500 to-purple-500",
      quote: "I've tried Jira, Asana, Notion. TaskFlow is the only one my entire team actually uses without complaining.",
    },
  ]

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-6xl mx-auto">

        <AnimateOnView className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">Loved by teams</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-[var(--tf-text-primary)]">
            Teams that ship use TaskFlow
          </h2>
        </AnimateOnView>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {testimonials.map((t, index) => (
            <AnimateOnView key={t.name} delay={index * 80}>
            <div
              className="border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] shadow-sm dark:shadow-none rounded-[14px] sm:rounded-[16px] p-5 sm:p-6 flex flex-col gap-4 h-full"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stars
                  <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[13.5px] text-[var(--tf-text-secondary)] leading-[1.75] flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-[var(--tf-border-subtle)]">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--tf-text-primary)]">{t.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[var(--tf-text-tertiary)]">{t.role}</p>
                </div>
              </div>
            </div>
            </AnimateOnView>
          ))}
        </div>

      </div>
    </section>
  )
}


// ——— CTA Banner ———
function CTABanner() {
  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-3xl mx-auto">
        <AnimateOnView>
        <div className="relative rounded-[20px] border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-[#0c0c0c] dark:to-violet-950/20 p-8 sm:p-14 text-center overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-[26px] sm:text-[40px] font-bold text-[var(--tf-text-primary)] mb-3 sm:mb-4">
              Ready to ship faster?
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of teams already using TaskFlow to organize work and move with clarity.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-10 px-6 text-[13.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[9px] border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150 whitespace-nowrap"
            >
              Get started free
              <ArrowRight size={14} />
            </Link>
            <p className="mt-4 text-[11.5px] text-[var(--tf-text-tertiary)]">No credit card required · Cancel anytime</p>
          </div>
        </div>
        </AnimateOnView>
      </div>
    </section>
  )
}

// ——— Footer ———
function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal",   links: ["Privacy", "Terms", "Cookies"] },
  ]

  return (
    <footer className="border-t border-[var(--tf-border-subtle)] py-10 sm:py-12 px-5 sm:px-6 bg-[var(--tf-bg-panel)]">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 sm:mb-12">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoMark height={20} />
              <span className="text-[var(--tf-text-primary)] font-bricolage" style={{ fontWeight: 900, fontSize: 14 }}>TaskFlow</span>
            </div>
            <p className="text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed max-w-[190px]">
              The project management tool built for teams that care about speed.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-3">
                {col.title}
              </p>
              {col.links.map((link) => (
                <a
                  key={link}
                  // biome-ignore lint/a11y/useValidAnchor: placeholder
                  href="#"
                  className="block text-[12.5px] text-[var(--tf-text-tertiary)] hover:text-slate-900 dark:hover:text-[#777] transition-colors mb-2"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--tf-border-subtle)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">© 2025 TaskFlow. All rights reserved.</p>
          <p className="text-[11.5px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">Built with Next.js · Drizzle · shadcn/ui</p>
        </div>

      </div>
    </footer>
  )
}

// ——— Main page ———
export default async function LandingPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-[var(--tf-bg-panel)] text-[var(--tf-text-primary)]">
      <OnboardingTour />
      <Navbar />
      <main className="pt-14">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <PricingSection userId={session?.user?.id ?? null} />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
