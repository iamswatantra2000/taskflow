// app/page.tsx
import Link from "next/link"
import {
  CheckSquare, Zap, Shield, Users,
  ArrowRight, Star, Check, Github
} from "lucide-react"

// ——— Navbar ———
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">T</span>
          </div>
          <span className="text-[14px] font-semibold text-white">TaskFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {["Features", "How it works", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-[13px] text-[#888] hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-[13px] text-[#888] hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="h-8 px-3 sm:px-4 text-[12px] sm:text-[13px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-[8px] transition-colors flex items-center"
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
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[12px] font-medium text-indigo-300">
            Now in beta — free for everyone
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-6">
          Where teams{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            ship faster
          </span>
        </h1>

        <p className="text-[17px] text-[#888] max-w-xl mx-auto leading-relaxed mb-10">
          TaskFlow brings your team work together — tasks, projects, and progress
          in one beautiful workspace. Stop context switching. Start shipping.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-11 px-6 text-[14px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started for free
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 h-11 px-6 text-[14px] font-medium border border-white/10 hover:border-white/20 text-[#ccc] hover:text-white rounded-[10px] transition-all bg-white/5 hover:bg-white/8"
          >
            Try the demo
          </Link>
        </div>

        {/* Social proof nudge */}
        <p className="mt-6 text-[12px] text-[#555]">
          No credit card required · Free forever plan · Setup in 2 minutes
        </p>

        {/* App preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10 pointer-events-none" />
          <div className="border border-white/8 rounded-[16px] overflow-hidden bg-[#111] shadow-2xl shadow-black/50">

            {/* Fake browser chrome */}
            <div className="bg-[#161616] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-[#1f1f1f] rounded-md px-3 py-1 text-[11px] text-[#555] max-w-[200px] mx-auto text-center">
                  taskflow.app/dashboard
                </div>
              </div>
            </div>

            {/* Fake dashboard preview */}
            <div className="flex h-[320px]">
              {/* Sidebar */}
              <div className="w-[180px] border-r border-white/5 bg-[#111] p-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-indigo-500 to-violet-600" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
                {[80, 60, 70].map((w, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5">
                    <div className="w-3 h-3 bg-white/10 rounded" />
                    <div className={`h-2.5 bg-white/10 rounded`} style={{ width: `${w}%` }} />
                  </div>
                ))}
                <div className="mt-3 px-2">
                  <div className="h-2 w-12 bg-white/5 rounded mb-2" />
                  {["#6366f1", "#0ea5e9", "#10b981"].map((color, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={i} className="flex items-center gap-2 py-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <div className="h-2 w-20 bg-white/8 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-4">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Total", value: "24", color: "text-white" },
                    { label: "Active", value: "8",  color: "text-indigo-400" },
                    { label: "Done",  value: "12", color: "text-emerald-400" },
                    { label: "Todo",  value: "4",  color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#161616] border border-white/5 rounded-[8px] p-2.5">
                      <div className="text-[10px] text-[#555] mb-1">{s.label}</div>
                      <div className={`text-[18px] font-semibold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Board columns */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Todo",        dot: "#555",    tasks: ["Write docs", "Add tests"] },
                    { label: "In progress", dot: "#6366f1", tasks: ["Build API", "Fix auth"] },
                    { label: "In review",   dot: "#f59e0b", tasks: ["PR review"] },
                    { label: "Done",        dot: "#10b981", tasks: ["Deploy v1"] },
                  ].map((col) => (
                    <div key={col.label} className="bg-[#161616] border border-white/5 rounded-[8px] p-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />
                        <span className="text-[10px] text-[#555]">{col.label}</span>
                      </div>
                      {col.tasks.map((t) => (
                        <div key={t} className="bg-[#1a1a1a] border border-white/5 rounded-[6px] p-2 mb-1.5">
                          <div className="text-[10px] text-[#aaa]">{t}</div>
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
      title: "Task management",
      description: "Create, assign, and track tasks with priorities, due dates, and status columns. Everything your team needs in one place.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Zap,
      title: "Drag and drop board",
      description: "Move tasks between columns with smooth drag and drop. Status updates instantly sync across your whole team.",
      color: "from-violet-500 to-violet-600",
    },
    {
      icon: Users,
      title: "Team workspaces",
      description: "Invite your team, assign tasks, and collaborate in shared workspaces. Everyone stays on the same page.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: "Secure by default",
      description: "Enterprise-grade auth with bcrypt password hashing, JWT sessions, and route-level protection. Your data stays yours.",
      color: "from-emerald-500 to-emerald-600",
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-[12px] text-[#888]">Features</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Everything your team needs
          </h2>
          <p className="text-[16px] text-[#666] max-w-md mx-auto">
            Built for modern teams who want to move fast without the complexity of enterprise tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group border border-white/5 bg-[#111] hover:border-white/10 rounded-[14px] p-6 transition-all hover:bg-[#141414]"
            >
              <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={18} className="text-white" />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-[14px] text-[#666] leading-relaxed">{f.description}</p>
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
      number: "01",
      title: "Create your workspace",
      description: "Sign up in seconds. Your personal workspace is ready instantly — no setup, no config.",
    },
    {
      number: "02",
      title: "Add your projects",
      description: "Create projects for each initiative. Color-code them and organize your work exactly how you think.",
    },
    {
      number: "03",
      title: "Create and assign tasks",
      description: "Add tasks with priorities and due dates. Assign them to team members so everyone knows what's next.",
    },
    {
      number: "04",
      title: "Ship faster together",
      description: "Drag tasks across the board as work progresses. Watch your team's velocity improve every sprint.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-[12px] text-[#888]">How it works</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Up and running in minutes
          </h2>
          <p className="text-[16px] text-[#666] max-w-md mx-auto">
            No lengthy onboarding. No overwhelming settings. Just a clean workspace ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}

              <div className="border border-white/5 bg-[#111] rounded-[14px] p-5">
                <div className="w-10 h-10 rounded-[10px] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <span className="text-[13px] font-bold text-indigo-400">{step.number}</span>
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{step.description}</p>
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
      role: "Engineering Lead at Vercel",
      avatar: "SC",
      color: "from-pink-500 to-rose-500",
      quote: "TaskFlow replaced three different tools for us. Our team's velocity went up by 40% in the first month. The drag-and-drop board just works.",
    },
    {
      name: "Marcus Rivera",
      role: "CTO at Stripe",
      avatar: "MR",
      color: "from-blue-500 to-cyan-500",
      quote: "Finally a project tool that doesn't require a 2-hour onboarding session. We were productive on day one. The dark UI is just beautiful.",
    },
    {
      name: "Priya Patel",
      role: "Product Manager at Linear",
      avatar: "PP",
      color: "from-violet-500 to-purple-500",
      quote: "I've tried everything — Jira, Asana, Notion. TaskFlow is the only one my whole team actually uses without complaining.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[12px] text-[#888]">Loved by teams</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Teams that ship use TaskFlow
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-white/5 bg-[#111] rounded-[14px] p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-[14px] text-[#888] leading-relaxed flex-1">
                {t.quote}
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{t.name}</p>
                  <p className="text-[11px] text-[#555]">{t.role}</p>
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
        "Drag and drop board",
        "Basic filters",
        "1 workspace",
      ],
      cta: "Get started free",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per user / month",
      description: "For growing teams that need more power and collaboration.",
      features: [
        "Unlimited projects",
        "Unlimited tasks",
        "Advanced filters + search",
        "Team workspaces",
        "Priority support",
        "Activity feed",
        "Custom fields",
      ],
      cta: "Start free trial",
      href: "/register",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with advanced security and compliance needs.",
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
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-[12px] text-[#888]">Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-[#666] max-w-md mx-auto">
            Start free. Upgrade when your team grows. No hidden fees, ever.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[14px] p-6 border flex flex-col gap-5 ${
                plan.highlighted
                  ? "border-indigo-500/50 bg-indigo-950/20"
                  : "border-white/5 bg-[#111]"
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div>
                <p className="text-[13px] font-medium text-[#888] mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-[12px] text-[#555]">{plan.period}</span>
                </div>
                <p className="text-[13px] text-[#666]">{plan.description}</p>
              </div>

              <Link
                href={plan.href}
                className={`w-full h-9 flex items-center justify-center text-[13px] font-medium rounded-[8px] transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "border border-white/10 hover:border-white/20 text-[#ccc] hover:text-white bg-white/5"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? "bg-indigo-600/20" : "bg-white/5"
                    }`}>
                      <Check size={10} className={plan.highlighted ? "text-indigo-400" : "text-[#555]"} />
                    </div>
                    <span className="text-[13px] text-[#888]">{f}</span>
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
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Ready to ship faster?
        </h2>
        <p className="text-[16px] text-[#666] mb-8">
          Join thousands of teams already using TaskFlow to organize their work and move faster.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 h-11 px-8 text-[14px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-[10px] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Get started for free
          <ArrowRight size={15} />
        </Link>
        <p className="mt-4 text-[12px] text-[#444]">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}

// ——— Footer ———
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">T</span>
              </div>
              <span className="text-[14px] font-semibold text-white">TaskFlow</span>
            </div>
            <p className="text-[13px] text-[#555] leading-relaxed">
              The project management tool built for teams that care about quality.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-[12px] font-medium text-[#888] uppercase tracking-wider mb-3">
              Product
            </p>
            {["Features", "Pricing", "Changelog", "Roadmap"].map((item) => (
              <a
                key={item}
                // biome-ignore lint/a11y/useValidAnchor: <explanation>
                href="#"
                className="block text-[13px] text-[#555] hover:text-white transition-colors mb-2"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Company links */}
          <div>
            <p className="text-[12px] font-medium text-[#888] uppercase tracking-wider mb-3">
              Company
            </p>
            {["About", "Blog", "Careers", "Contact"].map((item) => (
              <a
                key={item}
                // biome-ignore lint/a11y/useValidAnchor: <explanation>
                href="#"
                className="block text-[13px] text-[#555] hover:text-white transition-colors mb-2"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div>
            <p className="text-[12px] font-medium text-[#888] uppercase tracking-wider mb-3">
              Legal
            </p>
            {["Privacy policy", "Terms of service", "Cookie policy"].map((item) => (
              <a
                key={item}
                // biome-ignore lint/a11y/useValidAnchor: <explanation>
                href="#"
                className="block text-[13px] text-[#555] hover:text-white transition-colors mb-2"
              >
                {item}
              </a>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[12px] text-[#444]">
            © 2025 TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              className="text-[#444] hover:text-white transition-colors"
            >
              <Github size={16} />
            </a>
            <span className="text-[12px] text-[#444]">
              Built with Next.js + Drizzle + shadcn/ui
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}

// ——— Main page ———
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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