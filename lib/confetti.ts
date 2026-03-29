// lib/confetti.ts
import confetti from "canvas-confetti"

export function fireConfetti() {
  // First burst — left side
  confetti({
    particleCount: 80,
    spread:        60,
    origin:        { x: 0.3, y: 0.6 },
    colors:        ["#6366f1", "#8b5cf6", "#ec4899", "#4ade80", "#fbbf24"],
    zIndex:        9999,
  })

  // Second burst — right side (slight delay)
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread:        60,
      origin:        { x: 0.7, y: 0.6 },
      colors:        ["#6366f1", "#8b5cf6", "#ec4899", "#4ade80", "#fbbf24"],
      zIndex:        9999,
    })
  }, 150)

  // Final center burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread:        80,
      origin:        { x: 0.5, y: 0.5 },
      colors:        ["#6366f1", "#8b5cf6", "#ec4899"],
      zIndex:        9999,
      scalar:        1.2,
    })
  }, 300)
}