"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimateOnViewProps {
  children: React.ReactNode
  className?: string
  /** Delay in ms before the animation starts after the element enters the viewport */
  delay?: number
}

export function AnimateOnView({ children, className, delay = 0 }: AnimateOnViewProps) {
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

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={
        visible
          ? { animation: `fade-in-up 0.5s ease ${delay}ms both` }
          : { opacity: 0 }
      }
    >
      {children}
    </div>
  )
}
