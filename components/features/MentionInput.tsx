// components/features/MentionInput.tsx
"use client"

import { useState, useRef } from "react"

type Member = { id: string; name: string }

type Props = {
  value:       string
  onChange:    (value: string, mentionedIds: string[]) => void
  members:     Member[]
  placeholder?: string
  rows?:        number
  className?:   string
  onSubmit?:    () => void
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function MentionInput({
  value, onChange, members, placeholder, rows = 3, className = "", onSubmit,
}: Props) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(0)
  const [mentionedIds, setMentionedIds] = useState<string[]>([])
  const [dropdownIdx, setDropdownIdx]   = useState(0)
  const textareaRef                     = useRef<HTMLTextAreaElement>(null)

  const filtered = mentionQuery !== null
    ? members
        .filter((m) => m.name.toLowerCase().startsWith(mentionQuery.toLowerCase()))
        .slice(0, 6)
    : []

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val    = e.target.value
    const cursor = e.target.selectionStart ?? 0

    // Detect @query at cursor
    const textToCursor = val.slice(0, cursor)
    const atMatch      = textToCursor.match(/@(\w[\w ]*)$/)

    if (atMatch) {
      setMentionQuery(atMatch[1])
      setMentionStart(cursor - atMatch[0].length)
      setDropdownIdx(0)
    } else {
      setMentionQuery(null)
    }

    // Keep only ids whose @Name still appears in the text
    const kept = mentionedIds.filter((id) => {
      const m = members.find((m) => m.id === id)
      return m && val.includes(`@${m.name}`)
    })
    setMentionedIds(kept)
    onChange(val, kept)
  }

  function selectMember(member: Member) {
    const cursorPos = textareaRef.current?.selectionStart ?? (mentionStart + (mentionQuery?.length ?? 0) + 1)
    const before    = value.slice(0, mentionStart)
    const after     = value.slice(cursorPos)
    const newVal    = `${before}@${member.name} ${after}`

    const newIds = mentionedIds.includes(member.id)
      ? mentionedIds
      : [...mentionedIds, member.id]

    setMentionedIds(newIds)
    setMentionQuery(null)
    onChange(newVal, newIds)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const pos = before.length + member.name.length + 2
        textareaRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && filtered.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setDropdownIdx((i) => (i + 1) % filtered.length); return }
      if (e.key === "ArrowUp")   { e.preventDefault(); setDropdownIdx((i) => (i - 1 + filtered.length) % filtered.length); return }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); selectMember(filtered[dropdownIdx]); return }
      if (e.key === "Escape")    { setMentionQuery(null); return }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={`w-full bg-[#0d0d0d] border border-white/[0.08] rounded-[10px] px-3 py-2.5
          text-[13px] text-[#ccc] placeholder-[#333] outline-none
          hover:border-white/[0.12] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/[0.08]
          transition-all duration-150 resize-none ${className}`}
      />

      {/* Mention dropdown */}
      {mentionQuery !== null && filtered.length > 0 && (
        <div
          className="absolute left-0 bottom-full mb-1.5 w-[220px] bg-[#0d0d0d] border border-white/[0.1] rounded-[12px] overflow-hidden z-50"
          style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)" }}
        >
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <p className="text-[10px] font-semibold text-[#333] uppercase tracking-[0.08em]">Mention</p>
          </div>
          {filtered.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectMember(m) }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors duration-75
                ${i === dropdownIdx ? "bg-indigo-500/[0.1]" : "hover:bg-white/[0.04]"}`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/60 to-violet-600/60 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white">{getInitials(m.name)}</span>
              </div>
              <span className={`text-[12.5px] font-medium truncate ${i === dropdownIdx ? "text-indigo-300" : "text-[#777]"}`}>
                {m.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
