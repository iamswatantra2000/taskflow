// context/ThemeStyleContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

// ── Theme definitions ────────────────────────────────────────────────────────

export const STYLE_THEMES = [
  // ── Dark themes ──────────────────────────────────────────────────────────
  {
    id:            "midnight",
    name:          "Midnight",
    type:          "dark" as const,
    desc:          "Classic deep dark",
    accent:        "#6366f1",
    accentMuted:   "rgba(99,102,241,0.12)",
    accentText:    "#818cf8",
    bg:            "#0f0f0f",
    surface:       "#161616",
    sidebar:       "#0f0f0f",
    sidebarBorder: "rgba(255,255,255,0.06)",
    // CSS-variable overrides injected into :root
    cssVars: {
      "--background":  "0 0% 6%",
      "--foreground":  "0 0% 90%",
      "--card":        "0 0% 7%",
      "--primary":     "239 84% 63%",
      "--border":      "0 0% 11%",
    },
  },
  {
    id:            "obsidian",
    name:          "Obsidian",
    type:          "dark" as const,
    desc:          "True black, violet glow",
    accent:        "#8b5cf6",
    accentMuted:   "rgba(139,92,246,0.13)",
    accentText:    "#a78bfa",
    bg:            "#040408",
    surface:       "#0c0c18",
    sidebar:       "#07070d",
    sidebarBorder: "rgba(255,255,255,0.04)",
    cssVars: {
      "--background":  "240 50% 2%",
      "--foreground":  "240 10% 91%",
      "--card":        "240 40% 4%",
      "--primary":     "263 70% 58%",
      "--border":      "240 30% 8%",
    },
  },
  {
    id:            "nord",
    name:          "Nord",
    type:          "dark" as const,
    desc:          "Nordic blue-gray",
    accent:        "#88c0d0",
    accentMuted:   "rgba(136,192,208,0.14)",
    accentText:    "#8fbcbb",
    bg:            "#2e3440",
    surface:       "#3b4252",
    sidebar:       "#282c35",
    sidebarBorder: "rgba(255,255,255,0.08)",
    cssVars: {
      "--background":  "220 17% 21%",
      "--foreground":  "218 27% 92%",
      "--card":        "222 16% 26%",
      "--primary":     "192 38% 68%",
      "--border":      "220 12% 30%",
    },
  },
  {
    id:            "ember",
    name:          "Ember",
    type:          "dark" as const,
    desc:          "Warm amber, firelight",
    accent:        "#f59e0b",
    accentMuted:   "rgba(245,158,11,0.12)",
    accentText:    "#fbbf24",
    bg:            "#130a05",
    surface:       "#1c1008",
    sidebar:       "#0e0704",
    sidebarBorder: "rgba(255,255,255,0.05)",
    cssVars: {
      "--background":  "24 55% 6%",
      "--foreground":  "30 30% 90%",
      "--card":        "24 50% 9%",
      "--primary":     "38 92% 50%",
      "--border":      "24 35% 14%",
    },
  },
  // ── Light themes ─────────────────────────────────────────────────────────
  {
    id:            "cloud",
    name:          "Cloud",
    type:          "light" as const,
    desc:          "Clean white, default",
    accent:        "#6366f1",
    accentMuted:   "rgba(99,102,241,0.08)",
    accentText:    "#4338ca",
    bg:            "#ffffff",
    surface:       "#f8fafc",
    sidebar:       "#fafafa",
    sidebarBorder: "#e2e8f0",
    cssVars: {
      "--background":  "0 0% 100%",
      "--foreground":  "220 25% 12%",
      "--card":        "0 0% 100%",
      "--primary":     "239 84% 60%",
      "--border":      "220 16% 84%",
    },
  },
  {
    id:            "parchment",
    name:          "Parchment",
    type:          "light" as const,
    desc:          "Warm cream, editorial",
    accent:        "#b45309",
    accentMuted:   "rgba(180,83,9,0.09)",
    accentText:    "#92400e",
    bg:            "#faf8f3",
    surface:       "#fffcf5",
    sidebar:       "#f5f0e8",
    sidebarBorder: "#ddd5c4",
    cssVars: {
      "--background":  "40 33% 97%",
      "--foreground":  "30 20% 18%",
      "--card":        "40 30% 99%",
      "--primary":     "38 90% 36%",
      "--border":      "35 20% 84%",
    },
  },
  {
    id:            "arctic",
    name:          "Arctic",
    type:          "light" as const,
    desc:          "Cool blue, crisp",
    accent:        "#0d9488",
    accentMuted:   "rgba(13,148,136,0.09)",
    accentText:    "#0f766e",
    bg:            "#eef7fc",
    surface:       "#f8fcff",
    sidebar:       "#e2f0f8",
    sidebarBorder: "#c1ddf0",
    cssVars: {
      "--background":  "200 60% 96%",
      "--foreground":  "210 25% 15%",
      "--card":        "200 50% 99%",
      "--primary":     "174 72% 35%",
      "--border":      "200 30% 86%",
    },
  },
  {
    id:            "blossom",
    name:          "Blossom",
    type:          "light" as const,
    desc:          "Soft rose, vibrant",
    accent:        "#db2777",
    accentMuted:   "rgba(219,39,119,0.08)",
    accentText:    "#be185d",
    bg:            "#fdf2f6",
    surface:       "#fff8fb",
    sidebar:       "#f9e8f0",
    sidebarBorder: "#f0d0e4",
    cssVars: {
      "--background":  "340 80% 97%",
      "--foreground":  "340 20% 15%",
      "--card":        "340 60% 99%",
      "--primary":     "336 72% 52%",
      "--border":      "340 30% 88%",
    },
  },
] as const

export type StyleThemeId  = typeof STYLE_THEMES[number]["id"]
export type StyleThemeDef = typeof STYLE_THEMES[number]

export function getThemeDef(id: StyleThemeId): StyleThemeDef {
  return (STYLE_THEMES.find(t => t.id === id) ?? STYLE_THEMES[0]) as StyleThemeDef
}

// ── Context ───────────────────────────────────────────────────────────────────

type ThemeStyleCtx = {
  styleTheme:    StyleThemeId
  themeDef:      StyleThemeDef
  setStyleTheme: (id: StyleThemeId) => void
}

const Ctx = createContext<ThemeStyleCtx>({
  styleTheme:    "midnight",
  themeDef:      STYLE_THEMES[0],
  setStyleTheme: () => {},
})

export function useStyleTheme() { return useContext(Ctx) }

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyThemeVars(def: StyleThemeDef) {
  const root = document.documentElement
  root.setAttribute("data-theme", def.id)

  // CSS custom properties for components to consume
  root.style.setProperty("--tf-accent",         def.accent)
  root.style.setProperty("--tf-accent-muted",   def.accentMuted)
  root.style.setProperty("--tf-accent-text",     def.accentText)
  root.style.setProperty("--tf-sidebar-bg",      def.sidebar)
  root.style.setProperty("--tf-sidebar-border",  def.sidebarBorder)

  // Override base Tailwind CSS vars so body bg, card bg, text etc. update
  for (const [key, val] of Object.entries(def.cssVars)) {
    root.style.setProperty(key, val)
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const [styleTheme, setStyleThemeState] = useState<StyleThemeId>("midnight")

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tf-style-theme") as StyleThemeId | null
    const initial: StyleThemeId =
      saved && STYLE_THEMES.find(t => t.id === saved) ? saved : "midnight"
    const def = getThemeDef(initial)
    setStyleThemeState(initial)
    applyThemeVars(def)
    setTheme(def.type)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setStyleTheme(id: StyleThemeId) {
    const def = getThemeDef(id)
    setStyleThemeState(id)
    localStorage.setItem("tf-style-theme", id)

    // Suppress transitions during the full theme swap
    const style = document.createElement("style")
    style.textContent = "*,*::before,*::after{transition:none!important}"
    document.head.appendChild(style)

    applyThemeVars(def)
    setTheme(def.type)

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (document.head.contains(style)) document.head.removeChild(style)
      })
    )
  }

  return (
    <Ctx.Provider value={{ styleTheme, themeDef: getThemeDef(styleTheme), setStyleTheme }}>
      {children}
    </Ctx.Provider>
  )
}
