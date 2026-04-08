"use client"

import { useEffect, useRef } from "react"

interface HeroMockupProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function HeroMockup({ children, className, style }: HeroMockupProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId: number
    function onScroll() {
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const drift = Math.min(scrollY * 0.07, 28)
        el.style.transform = `translateY(-${drift}px)`
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: "transform", transition: "transform 0.1s linear", ...style }}
    >
      {children}
    </div>
  )
}
