"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MagneticButton } from "./MagneticButton"

gsap.registerPlugin(ScrollTrigger)

export function LandingCTA() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta-content",
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: ".cta-content", start: "top 85%", once: true },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-3xl mx-auto">
        <div className="cta-content relative rounded-[22px] border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-[#0c0c0c] dark:to-violet-950/20 p-8 sm:p-14 text-center overflow-hidden">

          {/* Background glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-32 bg-violet-500/8 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative">
            <h2 className="font-bricolage text-[28px] sm:text-[42px] font-extrabold text-[var(--tf-text-primary)] mb-3 sm:mb-4 tracking-tight">
              Ready to ship faster?
            </h2>
            <p className="font-geist text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of teams already using TaskFlow to organize work and move with clarity.
            </p>

            <MagneticButton className="inline-block">
              <Link
                href="/register"
                className="font-inter-landing group relative inline-flex items-center gap-2 h-11 px-8 text-[14px] font-semibold bg-[var(--tf-accent)] text-white rounded-[10px] border border-indigo-600/70 shadow-[0_4px_0_0_#3730a3,0_8px_28px_rgba(99,102,241,0.3)] active:translate-y-[4px] active:shadow-[0_0px_0_0_#3730a3] transition-all duration-150 whitespace-nowrap overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get started free
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
              </Link>
            </MagneticButton>

            <p className="font-geist mt-4 text-[11.5px] text-[var(--tf-text-tertiary)]">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
