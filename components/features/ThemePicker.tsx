// components/features/ThemePicker.tsx
"use client"

import { STYLE_THEMES, useStyleTheme, type StyleThemeDef } from "@/context/ThemeStyleContext"
import { Check } from "lucide-react"
import { toast } from "sonner"

// Mini app mock-up preview for each theme card
function ThemePreview({ def }: { def: StyleThemeDef }) {
  const isDark = def.type === "dark"
  const textPrimary   = isDark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.75)"
  const textSecondary = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"
  const borderColor   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"
  const cardBg        = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)"
  const tagBg         = `${def.accent}22`

  return (
    <div
      className="w-full h-[72px] rounded-[8px] overflow-hidden flex"
      style={{ background: def.bg, border: `1px solid ${borderColor}` }}
    >
      {/* Sidebar strip */}
      <div
        className="w-[30px] flex-shrink-0 flex flex-col gap-1.5 p-1.5 pt-2"
        style={{
          background:   def.sidebar,
          borderRight:  `1px solid ${def.sidebarBorder}`,
        }}
      >
        {/* Logo dot */}
        <div className="w-3.5 h-3.5 rounded-[3px]" style={{ background: def.accent }} />
        {/* Nav items */}
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{
              background: i === 1 ? `${def.accent}50` : textSecondary,
              width: i === 1 ? "70%" : i === 2 ? "80%" : "55%",
            }}
          />
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col gap-1.5 p-2">
        {/* Top bar */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 rounded-full flex-1" style={{ background: textPrimary, opacity: 0.5 }} />
          <div className="w-4 h-3 rounded-[3px]" style={{ background: def.accent }} />
        </div>
        {/* Kanban columns */}
        <div className="flex gap-1 flex-1">
          {[0.7, 1, 0.5].map((opacity, ci) => (
            <div
              key={ci}
              className="flex-1 rounded-[4px] flex flex-col gap-1 p-1"
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)" }}
            >
              <div className="h-1 rounded-full" style={{ background: textSecondary }} />
              {ci === 0 && (
                <div className="rounded-[3px] p-1" style={{ background: cardBg }}>
                  <div className="h-1 rounded-full mb-0.5" style={{ background: textSecondary }} />
                  <div
                    className="h-1 rounded-full w-[60%]"
                    style={{ background: def.accent, opacity: opacity }}
                  />
                </div>
              )}
              {ci === 1 && (
                <>
                  <div className="rounded-[3px] p-1" style={{ background: cardBg }}>
                    <div className="h-1 rounded-full" style={{ background: textSecondary }} />
                  </div>
                  <div className="h-1.5 rounded-[3px]" style={{ background: tagBg }} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Individual theme card
function ThemeCard({ def, isSelected, onSelect }: {
  def:        StyleThemeDef
  isSelected: boolean
  onSelect:   () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col gap-2.5 p-3 rounded-[14px] border text-left transition-all duration-150"
      style={{
        borderColor:     isSelected ? def.accent : undefined,
        backgroundColor: isSelected ? `${def.accent}08` : undefined,
        boxShadow:       isSelected ? `0 0 0 1px ${def.accent}30, 0 4px 20px ${def.accent}10` : undefined,
      }}
      data-selected={isSelected}
    >
      {/* Selection ring fallback via Tailwind when not selected */}
      {!isSelected && (
        <span className="absolute inset-0 rounded-[14px] border border-slate-200 dark:border-white/[0.07] group-hover:border-slate-300 dark:group-hover:border-white/[0.13] group-hover:bg-slate-50/50 dark:group-hover:bg-white/[0.02] transition-all pointer-events-none" />
      )}

      <ThemePreview def={def} />

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-[12.5px] font-semibold leading-none mb-0.5 ${isSelected ? "" : "text-[var(--tf-text-secondary)]"}`}
            style={isSelected ? { color: def.accent } : undefined}
          >
            {def.name}
          </p>
          <p className="text-[10.5px] text-[var(--tf-text-tertiary)]">{def.desc}</p>
        </div>

        {/* Check indicator */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={isSelected ? {
            backgroundColor: `${def.accent}20`,
            border:          `1.5px solid ${def.accent}60`,
          } : {
            border: "1.5px solid rgba(150,150,150,0.2)",
          }}
        >
          {isSelected && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke={def.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Main picker ───────────────────────────────────────────────────────────────

export function ThemePicker() {
  const { styleTheme, setStyleTheme } = useStyleTheme()

  const darkThemes  = STYLE_THEMES.filter(t => t.type === "dark")
  const lightThemes = STYLE_THEMES.filter(t => t.type === "light")

  function handleSelect(id: typeof STYLE_THEMES[number]["id"]) {
    setStyleTheme(id)
    const def = STYLE_THEMES.find(t => t.id === id)!
    toast.success(`${def.name} theme applied`)
  }

  return (
    <div className="space-y-5">
      {/* Dark themes */}
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--tf-text-tertiary)] mb-3">
          Dark
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {darkThemes.map(def => (
            <ThemeCard
              key={def.id}
              def={def}
              isSelected={styleTheme === def.id}
              onSelect={() => handleSelect(def.id)}
            />
          ))}
        </div>
      </div>

      {/* Light themes */}
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--tf-text-tertiary)] mb-3">
          Light
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {lightThemes.map(def => (
            <ThemeCard
              key={def.id}
              def={def}
              isSelected={styleTheme === def.id}
              onSelect={() => handleSelect(def.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
