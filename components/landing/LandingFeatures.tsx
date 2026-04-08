"use client"

import { useEffect, useRef } from "react"
import { CheckSquare, Zap, Users, BarChart2, Clock, Shield, ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: CheckSquare,
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
    title: "Task management",
    description: "Create tasks with priorities, due dates, and statuses. Everything your team needs to stay on track and ship faster.",
    large: true,
    accent: "from-indigo-500/10 via-transparent to-transparent",
  },
  {
    icon: Zap,
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200 dark:border-violet-500/20",
    title: "Drag & drop board",
    description: "Move tasks between columns with a smooth Kanban board. Status syncs instantly.",
    large: false,
    accent: "from-violet-500/10 via-transparent to-transparent",
  },
  {
    icon: Users,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    title: "Team workspaces",
    description: "Invite teammates, assign tasks, and collaborate in shared workspaces.",
    large: false,
    accent: "from-blue-500/10 via-transparent to-transparent",
  },
  {
    icon: BarChart2,
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    title: "Analytics & insights",
    description: "Track completion rates, velocity, and project health. Make decisions backed by real data.",
    large: false,
    accent: "from-emerald-500/10 via-transparent to-transparent",
  },
  {
    icon: Clock,
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    title: "Activity feed",
    description: "See everything happening across your workspace in real time.",
    large: false,
    accent: "from-amber-500/10 via-transparent to-transparent",
  },
  {
    icon: Shield,
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/20",
    title: "Secure by default",
    description: "bcrypt auth, JWT sessions, and route-level protection. Your data is private.",
    large: true,
    accent: "from-rose-500/10 via-transparent to-transparent",
  },
]

function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -4
    const rotY = ((x - cx) / cx) * 4
    gsap.to(el, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 800,
    })
  }

  function onMouseLeave() {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`feature-card group relative p-5 sm:p-6 border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] hover:border-slate-300 dark:hover:border-white/10 rounded-[16px] sm:rounded-[18px] transition-colors duration-200 h-full overflow-hidden cursor-default ${
        f.large ? "sm:col-span-2" : ""
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative z-10">
        <div className={`w-9 h-9 rounded-[10px] border flex items-center justify-center mb-4 ${f.bg} ${f.border}`}>
          <f.icon size={15} className={f.color} />
        </div>
        <h3 className="font-bricolage text-[15px] font-bold text-[var(--tf-text-primary)] mb-1.5">{f.title}</h3>
        <p className="font-geist text-[13px] text-[var(--tf-text-tertiary)] leading-relaxed">{f.description}</p>

        {f.large && (
          <button type="button" className="font-inter-landing mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--tf-accent)] hover:underline transition-all">
            Learn more <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

export function LandingFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".features-heading",
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.7,
          scrollTrigger: { trigger: ".features-heading", start: "top 85%", once: true },
        }
      )
      gsap.fromTo(".feature-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: ".feature-card", start: "top 88%", once: true },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-6xl mx-auto">

        <div className="features-heading text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <span className="font-geist text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">Features</span>
          </div>
          <h2 className="font-bricolage text-[30px] sm:text-[46px] font-extrabold text-[var(--tf-text-primary)] mb-3 sm:mb-4 tracking-tight">
            Everything your team needs
          </h2>
          <p className="font-geist text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] max-w-[420px] mx-auto leading-relaxed">
            Built for modern teams who want to move fast without the complexity.
          </p>
        </div>

        {/* Bento grid: row 1 = large + regular; row 2 = regular + regular + regular; row 3 = large */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
