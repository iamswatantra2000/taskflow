"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimateOnViewProps {
  children: React.ReactNode
  className?: string
  /** Delay in ms before the animation starts after the element enters the viewport */
  delay?: number
  /** Animation direction — default is "up" */
  direction?: "up" | "left" | "right" | "fade"
  /** Duration in ms */
  duration?: number
}

const ANIMATION_MAP: Record<string, string> = {
  up:    "fade-in-up",
  left:  "slide-in-from-left",
  right: "slide-in-from-right",
  fade:  "fade-in",
}

export function AnimateOnView({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 500,
}: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const animName = ANIMATION_MAP[direction] ?? "fade-in-up"

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={
        visible
          ? { animation: `${animName} ${duration}ms ease ${delay}ms both` }
          : { opacity: 0 }
      }
    >
      {children}
    </div>
  )
}
