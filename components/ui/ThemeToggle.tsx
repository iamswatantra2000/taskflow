"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted]       = useState(false)
  const [spinning, setSpinning]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) return <div className="w-7 h-7 rounded-lg" />

  const isDark = resolvedTheme === "dark"

  function toggle() {
    // Suppress all transitions while the theme class swaps to prevent
    // hundreds of elements animating at once (causes perceived lag)
    const style = document.createElement("style")
    style.dataset.themeSwitch = "1"
    style.textContent = "*,*::before,*::after{transition:none!important}"
    document.head.appendChild(style)

    setTheme(isDark ? "light" : "dark")

    // Double rAF ensures the browser paints the new theme before
    // transitions are restored, so re-enabling is invisible
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.head.removeChild(style))
    )

    setSpinning(true)
    setTimeout(() => setSpinning(false), 350)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "relative w-7 h-7 flex items-center justify-center rounded-lg",
        "transition-all duration-200 shrink-0",
        isDark
          ? [
              "bg-amber-950/40 hover:bg-amber-950/70",
              "border border-amber-700/40",
              "text-amber-400 hover:text-amber-300",
              "shadow-[0_0_8px_rgba(251,191,36,0.12)] hover:shadow-[0_0_14px_rgba(251,191,36,0.22)]",
            ].join(" ")
          : [
              "bg-indigo-50 hover:bg-indigo-100",
              "border border-indigo-200",
              "text-indigo-500 hover:text-indigo-600",
            ].join(" "),
        spinning ? "scale-90" : "scale-100 active:scale-90",
      ].join(" ")}
    >
      <span
        style={{ display: "flex", transition: "transform 350ms cubic-bezier(.4,0,.2,1)" }}
        className={spinning ? "rotate-200" : "rotate-0"}
      >
        {isDark
          ? <Sun  size={13} strokeWidth={2.2} />
          : <Moon size={13} strokeWidth={2.2} />
        }
      </span>
    </button>
  )
}
