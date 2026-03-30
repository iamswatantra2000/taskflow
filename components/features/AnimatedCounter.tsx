// components/features/AnimatedCounter.tsx
"use client"

import { useEffect, useState, useRef } from "react"

type Props = {
  value:    number
  duration?: number
}

export function AnimatedCounter({ value, duration = 1000 }: Props) {
  const [display, setDisplay] = useState(0)
  const startTime              = useRef<number | null>(null)
  const frameRef               = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null

    function animate(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp
      const elapsed  = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return <span>{display}</span>
}