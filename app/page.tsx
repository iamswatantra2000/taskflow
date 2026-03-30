// app/page.tsx
import Link from "next/link"
import {
  CheckSquare, Zap, Shield, Users,
  ArrowRight, Star, Check, BarChart2, Clock,
} from "lucide-react"
import { OnboardingTour } from "@/components/features/OnboardingTour"

// ——— Navbar ———
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/[0.06] bg-[#080808]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-full flex items-center justify-between">

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <span className="text-white text-[11px] font-bold">T</span>
          </div>
          <span className="text-[14px] font-semibold text-white">TaskFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-[13px] text-[#555] hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-[13px] text-[#555] hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="h-8 px-4 text-[12.5px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center"
          >
            Get started
          </Link>
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
      <div className="absolute inset-0 bg-[#080808]">
        <div
          className="absolute inset-0 opacity-[0.025]"
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
        <div className="inline-flex items-center gap-2 border border-indigo-500/25 bg-indigo-500/[0.07] rounded-full px-3.5 py-1.5 mb-7">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
          <span className="text-[11.5px] font-medium text-indigo-300">
            Now in beta — free for everyone
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[40px] sm:text-[62px] md:text-[78px] font-bold text-white leading-[1.04] mb-5 sm:mb-6">
          The workspace where<br className="hidden sm:block" />{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">
            great teams ship
          </span>
        </h1>

        <p className="text-[15px] sm:text-[17px] text-[#666] max-w-[520px] mx-auto leading-relaxed mb-9 sm:mb-10">
          Organize projects, track tasks, and collaborate seamlessly — all in one beautiful workspace built for speed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-7 text-[14px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-[10px] transition-all shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px active:translate-y-0"
          >
            Start for free
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-7 text-[14px] font-medium border border-white/10 hover:border-white/20 text-[#999] hover:text-white rounded-[10px] transition-all hover:bg-white/[0.03]"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-5 text-[12px] text-[#3a3a3a]">
          No credit card · Free forever plan · 2-minute setup
        </p>

        {/* Metrics */}
        <div className="flex items-center justify-center gap-8 sm:gap-14 mt-12 sm:mt-16 mb-12 sm:mb-16">
          {[
            { value: "12k+",  label: "Teams" },
            { value: "1M+",   label: "Tasks created" },
            { value: "99.9%", label: "Uptime" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-[24px] sm:text-[30px] font-bold text-white">{m.value}</p>
              <p className="text-[11px] text-[#444] mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* App preview */}
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent to-[#080808] z-10 pointer-events-none" />
          <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-indigo-500/15 rounded-[20px] blur-sm" />
          <div className="relative border border-white/[0.07] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#0c0c0c] shadow-2xl shadow-black/60">

            {/* Browser bar */}
            <div className="bg-[#111] border-b border-white/[0.05] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#1a1a1a] rounded-md px-3 py-1 text-[10px] text-[#3a3a3a] max-w-[200px] mx-auto text-center">
                  app.taskflow.io/dashboard
                </div>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="flex h-[220px] sm:h-[310px]">

              {/* Sidebar */}
              <div className="hidden sm:flex w-[160px] border-r border-white/[0.05] p-3 flex-col gap-0.5 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0" />
                  <div className="h-2 w-14 bg-white/8 rounded" />
                </div>
                {[75, 58, 65].map((w, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: preview
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                    <div className="w-3 h-3 bg-white/8 rounded flex-shrink-0" />
                    <div className="h-2 bg-white/8 rounded" style={{ width: `${w}%` }} />
                  </div>
                ))}
                <div className="mt-3 px-2 space-y-1.5">
                  <div className="h-1.5 w-10 bg-white/[0.04] rounded mb-2" />
                  {["#6366f1", "#0ea5e9", "#10b981"].map((color, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: preview
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div className="h-1.5 w-14 bg-white/6 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main */}
              <div className="flex-1 p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
                  {[
                    { n: "24", c: "text-white",       l: "Total"  },
                    { n: "8",  c: "text-indigo-400",  l: "Active" },
                    { n: "12", c: "text-emerald-400", l: "Done"   },
                    { n: "4",  c: "text-amber-400",   l: "Todo"   },
                  ].map((s) => (
                    <div key={s.l} className="bg-[#111] border border-white/[0.05] rounded-[8px] p-2.5">
                      <div className="text-[9px] text-[#3a3a3a] mb-1">{s.l}</div>
                      <div className={`text-[15px] sm:text-[20px] font-bold ${s.c}`}>{s.n}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { l: "Todo",        dot: "#333",    t: ["Write docs", "Add tests"] },
                    { l: "In progress", dot: "#6366f1", t: ["Build API", "Fix auth"]   },
                    { l: "In review",   dot: "#f59e0b", t: ["PR review"]               },
                    { l: "Done",        dot: "#10b981", t: ["Deploy v1"]               },
                  ].map((col) => (
                    <div key={col.l} className="bg-[#111] border border-white/[0.05] rounded-[8px] p-2">
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.dot }} />
                        <span className="text-[8.5px] sm:text-[10px] text-[#3a3a3a] truncate">{col.l}</span>
                      </div>
                      {col.t.map((t) => (
                        <div key={t} className="bg-[#161616] border border-white/[0.04] rounded-[5px] p-1.5 mb-1">
                          <div className="text-[8.5px] sm:text-[10px] text-[#777] truncate">{t}</div>
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
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      title: "Task management",
      description: "Create tasks with priorities, due dates, and statuses. Everything your team needs to stay on track.",
    },
    {
      icon: Zap,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
      title: "Drag & drop board",
      description: "Move tasks between columns with a smooth Kanban board. Status syncs instantly for your whole team.",
    },
    {
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      title: "Team workspaces",
      description: "Invite teammates, assign tasks, and collaborate in shared workspaces. Everyone stays aligned.",
    },
    {
      icon: BarChart2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      title: "Analytics & insights",
      description: "Track completion rates, team velocity, and project health. Make decisions backed by real data.",
    },
    {
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      title: "Activity feed",
      description: "See everything happening across your workspace in real time. Never miss a task update again.",
    },
    {
      icon: Shield,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      title: "Secure by default",
      description: "bcrypt auth, JWT sessions, and route-level protection. Your data is private, encrypted, and yours.",
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-white/8 bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[#555]">Features</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-white mb-3 sm:mb-4">
            Everything your team needs
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#555] max-w-[420px] mx-auto leading-relaxed">
            Built for modern teams who want to move fast without the complexity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-5 sm:p-6 border border-white/[0.06] bg-[#0c0c0c] hover:border-white/10 hover:bg-[#0e0e0e] rounded-[14px] sm:rounded-[16px] transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-[10px] border flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon size={15} className={f.color} />
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[#555] leading-relaxed">{f.description}</p>
            </div>
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
    <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-white/8 bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[#555]">How it works</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-white mb-3 sm:mb-4">
            Up and running in minutes
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#555] max-w-[420px] mx-auto leading-relaxed">
            No lengthy onboarding. No overwhelming settings. Just a clean workspace ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {steps.map((step, index) => (
            <div key={step.n} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-[22px] left-[calc(50%+30px)] right-[-calc(50%-30px)] h-px bg-gradient-to-r from-white/8 to-transparent z-10" />
              )}
              <div className="border border-white/[0.06] bg-[#0c0c0c] rounded-[14px] sm:rounded-[16px] p-5 h-full">
                <div className="w-10 h-10 rounded-[11px] bg-indigo-600/12 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <span className="text-[13px] font-bold text-indigo-400">{step.n}</span>
                </div>
                <h3 className="text-[13.5px] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[12.5px] text-[#555] leading-relaxed">{step.desc}</p>
              </div>
            </div>
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
    <section className="py-20 sm:py-28 px-5 sm:px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-white/8 bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[11.5px] font-medium text-[#555]">Loved by teams</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-white">
            Teams that ship use TaskFlow
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-white/[0.06] bg-[#0c0c0c] rounded-[14px] sm:rounded-[16px] p-5 sm:p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stars
                  <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[13.5px] text-[#666] leading-[1.75] flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white">{t.name}</p>
                  <p className="text-[11px] text-[#444]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ——— Pricing ———
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small teams getting started.",
      features: [
        "Up to 3 projects",
        "Unlimited tasks",
        "Kanban board",
        "Basic filters & search",
        "1 workspace",
      ],
      cta: "Get started free",
      href: "/register",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per user / month",
      description: "For growing teams that need more power and collaboration.",
      features: [
        "Unlimited projects",
        "Unlimited tasks",
        "Advanced filters",
        "Team workspaces",
        "Priority support",
        "Activity feed",
        "Analytics",
      ],
      cta: "Start free trial",
      href: "/register",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large orgs with advanced security and compliance needs.",
      features: [
        "Everything in Pro",
        "SSO / SAML",
        "Audit logs",
        "SLA guarantee",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Contact sales",
      href: "/register",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-white/8 bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[#555]">Pricing</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-white mb-3 sm:mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#555] max-w-[420px] mx-auto leading-relaxed">
            Start free. Upgrade when your team grows. No hidden fees, ever.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[16px] p-5 sm:p-6 border flex flex-col gap-5 ${
                plan.popular
                  ? "border-indigo-500/35 bg-indigo-950/[0.12] ring-1 ring-indigo-500/15"
                  : "border-white/[0.06] bg-[#0c0c0c]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10.5px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap tracking-wide">
                  Most popular
                </div>
              )}

              <div>
                <p className="text-[12px] font-medium text-[#555] mb-2.5">{plan.name}</p>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[38px] font-bold text-white">{plan.price}</span>
                  <span className="text-[11px] text-[#444]">{plan.period}</span>
                </div>
                <p className="text-[12.5px] text-[#555] leading-relaxed">{plan.description}</p>
              </div>

              <Link
                href={plan.href}
                className={`w-full h-9 flex items-center justify-center text-[13px] font-medium rounded-[9px] transition-all ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "border border-white/10 hover:border-white/20 text-[#888] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.popular ? "bg-indigo-500/15" : "bg-white/[0.04]"
                    }`}>
                      <Check size={10} className={plan.popular ? "text-indigo-400" : "text-[#444]"} />
                    </div>
                    <span className="text-[12.5px] text-[#666]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ——— CTA Banner ———
function CTABanner() {
  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-[20px] border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-[#0c0c0c] to-violet-950/20 p-8 sm:p-14 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-[26px] sm:text-[40px] font-bold text-white mb-3 sm:mb-4">
              Ready to ship faster?
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#555] mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of teams already using TaskFlow to organize work and move with clarity.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-11 px-7 text-[14px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-[10px] transition-all shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px"
            >
              Get started for free
              <ArrowRight size={15} />
            </Link>
            <p className="mt-4 text-[11.5px] text-[#333]">No credit card required · Cancel anytime</p>
          </div>
        </div>
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
    <footer className="border-t border-white/[0.06] py-10 sm:py-12 px-5 sm:px-6 bg-[#080808]">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 sm:mb-12">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">T</span>
              </div>
              <span className="text-[14px] font-semibold text-white">TaskFlow</span>
            </div>
            <p className="text-[12.5px] text-[#333] leading-relaxed max-w-[190px]">
              The project management tool built for teams that care about speed.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[10.5px] font-semibold text-[#333] uppercase tracking-[0.1em] mb-3">
                {col.title}
              </p>
              {col.links.map((link) => (
                <a
                  key={link}
                  // biome-ignore lint/a11y/useValidAnchor: placeholder
                  href="#"
                  className="block text-[12.5px] text-[#333] hover:text-[#777] transition-colors mb-2"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11.5px] text-[#2a2a2a]">© 2025 TaskFlow. All rights reserved.</p>
          <p className="text-[11.5px] text-[#2a2a2a]">Built with Next.js · Drizzle · shadcn/ui</p>
        </div>

      </div>
    </footer>
  )
}

// ——— Main page ———
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <OnboardingTour />
      <Navbar />
      <main className="pt-14">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
