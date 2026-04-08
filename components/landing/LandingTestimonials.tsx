"use client"

import { useEffect, useRef } from "react"
import { Star } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Lead · Vercel",
    avatar: "SC",
    color: "from-pink-500 to-rose-500",
    quote: "TaskFlow replaced three different tools for us. Our team's velocity went up 40% in the first month.",
  },
  {
    name: "Marcus Rivera",
    role: "CTO · Stripe",
    avatar: "MR",
    color: "from-blue-500 to-cyan-500",
    quote: "No lengthy onboarding. We were productive on day one — and the design is genuinely beautiful.",
  },
  {
    name: "Priya Patel",
    role: "Product Manager · Linear",
    avatar: "PP",
    color: "from-violet-500 to-purple-500",
    quote: "I've tried Jira, Asana, Notion. TaskFlow is the only one my entire team actually uses without complaining.",
  },
  {
    name: "Alex Thompson",
    role: "Founder · Loom",
    avatar: "AT",
    color: "from-emerald-500 to-teal-500",
    quote: "The drag-and-drop board is buttery smooth. Feels like a product built by people who actually use it.",
  },
  {
    name: "Jordan Kim",
    role: "Head of Design · Figma",
    avatar: "JK",
    color: "from-orange-500 to-amber-500",
    quote: "Finally a task manager that doesn't feel like a spreadsheet. The UX is impeccable.",
  },
  {
    name: "Riley Morgan",
    role: "Staff Engineer · Notion",
    avatar: "RM",
    color: "from-indigo-500 to-blue-500",
    quote: "Moved our whole team over in an afternoon. The real-time updates are a game changer for remote work.",
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px] p-5 border border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)] rounded-[14px] sm:rounded-[16px] mx-2 hover:border-slate-300 dark:hover:border-white/10 transition-colors duration-200">
      <div className="flex gap-0.5 mb-3">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stars
          <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="font-geist text-[13px] text-[var(--tf-text-secondary)] leading-[1.7] mb-4">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--tf-border-subtle)]">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0`}>
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="font-geist text-[12.5px] font-semibold text-[var(--tf-text-primary)]">{t.name}</p>
          <p className="font-geist text-[11px] text-[var(--tf-text-tertiary)]">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, reverse = false }: { items: typeof testimonials; reverse?: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden mb-3">
      <div className={`flex items-stretch w-max ${reverse ? "animate-marquee-right" : "animate-marquee-left"}`}>
        {doubled.map((t, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicate
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  )
}

export function LandingTestimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".testimonials-heading",
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.65,
          scrollTrigger: { trigger: ".testimonials-heading", start: "top 85%", once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const row1 = testimonials.slice(0, 3)
  const row2 = testimonials.slice(3, 6)

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 border-t border-[var(--tf-border-subtle)] overflow-hidden">

      <div className="max-w-6xl mx-auto px-5 sm:px-6 mb-12 sm:mb-14">
        <div className="testimonials-heading text-center">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-slate-100/50 dark:bg-white/[0.02] rounded-full px-4 py-1.5 mb-5">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="font-geist text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">Loved by teams</span>
          </div>
          <h2 className="font-bricolage text-[30px] sm:text-[46px] font-extrabold text-[var(--tf-text-primary)] tracking-tight">
            Teams that ship use TaskFlow
          </h2>
        </div>
      </div>

      {/* Dual-row marquee */}
      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[var(--tf-bg-panel)] to-transparent z-10 pointer-events-none" />

        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  )
}
