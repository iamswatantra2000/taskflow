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
  if (!mounted) return <div className="w-7 h-7 rounded-[8px]" />

  const isDark = resolvedTheme === "dark"

  function toggle() {
    setSpinning(true)
    setTheme(isDark ? "light" : "dark")
    setTimeout(() => setSpinning(false), 350)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "relative w-7 h-7 flex items-center justify-center rounded-[8px]",
        "transition-all duration-200 flex-shrink-0",
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
        className={spinning ? "rotate-[200deg]" : "rotate-0"}
      >
        {isDark
          ? <Sun  size={13} strokeWidth={2.2} />
          : <Moon size={13} strokeWidth={2.2} />
        }
      </span>
    </button>
  )
}
