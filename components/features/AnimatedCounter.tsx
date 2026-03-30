// components/features/AnimatedCounter.tsx
"use client"

import { useEffect, useState, useRef } from "react"

type Props = {
  value:     number
  duration?: number
  delay?:    number
}

export function AnimatedCounter({ value, duration = 1500, delay = 200 }: Props) {
  const [display, setDisplay]   = useState(0)
  const startTime               = useRef<number | null>(null)
  const frameRef                = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null

    // Wait for delay before starting animation
    const delayTimer = setTimeout(() => {
      function animate(timestamp: number) {
        if (!startTime.current) startTime.current = timestamp
        const elapsed  = timestamp - startTime.current
        const progress = Math.min(elapsed / duration, 1)

        // Ease out cubic — starts fast, slows down
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * value))

        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(animate)
        }
      }

      frameRef.current = window.requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(delayTimer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration, delay])

  return <span>{display}</span>
}