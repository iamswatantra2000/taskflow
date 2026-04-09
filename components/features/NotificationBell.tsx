// components/features/NotificationBell.tsx
"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useTheme } from "next-themes"
import {
  Bell, AtSign, CornerDownRight, UserPlus,
  ArrowRightLeft, Clock, Loader2, CheckCheck, Trash2,
} from "lucide-react"
import {
  getNotifications,
  markAllNotificationsRead,
  markOneNotificationRead,
  clearAllNotifications,
} from "@/lib/notification-actions"

type Notification = {
  id: string; type: string; message: string
  taskId: string | null; isRead: boolean; createdAt: Date
}

// ── Per-type visual config ────────────────────────────────────────
const TYPE_META: Record<string, {
  icon:    React.ElementType
  iconBg:  string
  iconColor: string
  accent:  string
}> = {
  MENTION:       { icon: AtSign,          iconBg: "bg-indigo-500/[0.12]",   iconColor: "text-indigo-400",  accent: "border-l-indigo-500/50"  },
  REPLY:         { icon: CornerDownRight,  iconBg: "bg-violet-500/[0.12]",   iconColor: "text-violet-400",  accent: "border-l-violet-500/50"  },
  TASK_ASSIGNED: { icon: UserPlus,         iconBg: "bg-emerald-500/[0.12]",  iconColor: "text-emerald-400", accent: "border-l-emerald-500/50" },
  STATUS_CHANGE: { icon: ArrowRightLeft,   iconBg: "bg-amber-500/[0.12]",    iconColor: "text-amber-400",   accent: "border-l-amber-500/50"   },
  DUE_DATE:      { icon: Clock,            iconBg: "bg-red-500/[0.12]",       iconColor: "text-red-400",    accent: "border-l-red-500/50"     },
}

const FALLBACK_META = TYPE_META.MENTION

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)    return "just now"
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function groupByDate(items: Notification[]) {
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  const groups: { label: string; items: Notification[] }[] = []
  const map: Record<string, Notification[]> = {}

  for (const n of items) {
    const d = new Date(n.createdAt).toDateString()
    const label = d === today ? "Today" : d === yesterday ? "Yesterday" : "Earlier"
    if (!map[label]) { map[label] = []; groups.push({ label, items: map[label] }) }
    map[label].push(n)
  }

  return groups
}

// ── Component ─────────────────────────────────────────────────────
export function NotificationBell() {
  const [open, setOpen]           = useState(false)
  const [items, setItems]         = useState<Notification[]>([])
  const [pending, startTransition] = useTransition()
  const ref                       = useRef<HTMLDivElement>(null)
  const { resolvedTheme }         = useTheme()
  const isDark                    = resolvedTheme === "dark"

  const unread = items.filter((n) => !n.isRead).length
  const groups = groupByDate(items)

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onOut)
    return () => document.removeEventListener("mousedown", onOut)
  }, [])

  async function load() {
    try {
      const data = await getNotifications()
      setItems(data as Notification[])
    } catch {}
  }

  function handleToggle() {
    setOpen((v) => !v)
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    })
  }

  function handleClearAll() {
    startTransition(async () => {
      await clearAllNotifications()
      setItems([])
    })
  }

  function handleClickItem(n: Notification) {
    if (!n.isRead) {
      startTransition(async () => {
        await markOneNotificationRead(n.id)
        setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x))
      })
    }
  }

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative w-7 h-7 flex items-center justify-center rounded-[8px] border transition-all duration-150
          ${open
            ? "text-[var(--tf-text-secondary)] bg-[var(--tf-bg-hover)] border-[var(--tf-border)]"
            : "text-[var(--tf-text-tertiary)] hover:text-[var(--tf-text-secondary)] hover:bg-[var(--tf-bg-hover)] border-transparent hover:border-[var(--tf-border)]"
          }`}
      >
        <Bell size={14} className={unread > 0 ? "animate-[wiggle_0.4s_ease-in-out]" : ""} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center
            bg-[var(--tf-accent)] text-white text-[9px] font-bold rounded-full px-1 leading-none
            ring-2 ring-[var(--tf-bg-panel)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] bg-[var(--tf-bg-dropdown)] border border-[var(--tf-border)] rounded-[16px] overflow-hidden z-[200]"
          style={{
            boxShadow: isDark
              ? "0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)"
              : "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)",
            animation: "fadeSlideIn 0.15s ease-out",
          }}
        >
          {/* Top glow line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--tf-border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[7px] bg-indigo-500/[0.12] border border-indigo-500/20 flex items-center justify-center">
                <Bell size={11} className="text-indigo-400" />
              </div>
              <span className="text-[13px] font-bold text-[var(--tf-text-primary)] tracking-tight">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/[0.12] border border-indigo-500/25 rounded-full px-1.5 py-0.5 leading-none">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {pending && <Loader2 size={11} className="animate-spin text-[var(--tf-text-tertiary)] mr-1" />}
              {unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  title="Mark all read"
                  className="w-6 h-6 flex items-center justify-center rounded-[6px] text-[var(--tf-text-tertiary)] hover:text-emerald-400 hover:bg-emerald-500/[0.08] transition-all"
                >
                  <CheckCheck size={12} />
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  title="Clear all"
                  className="w-6 h-6 flex items-center justify-center rounded-[6px] text-[var(--tf-text-tertiary)] hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-[12px] bg-[var(--tf-bg-hover)] border border-[var(--tf-border-subtle)] flex items-center justify-center mb-3">
                  <Bell size={18} className="text-[var(--tf-text-tertiary)]" />
                </div>
                <p className="text-[12.5px] font-semibold text-[var(--tf-text-tertiary)]">All caught up</p>
                <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-1">Assignments, mentions & due dates appear here</p>
              </div>
            ) : (
              groups.map(({ label, items: groupItems }) => (
                <div key={label}>
                  {/* Date group label */}
                  <div className="px-4 py-1.5 sticky top-0 bg-[var(--tf-bg-dropdown)]/95 backdrop-blur-sm z-10">
                    <span className="text-[10px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">{label}</span>
                  </div>

                  {groupItems.map((n) => {
                    const meta = TYPE_META[n.type] ?? FALLBACK_META
                    const Icon = meta.icon
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleClickItem(n)}
                        className={`flex items-start gap-3 w-full px-4 py-3 text-left border-b border-[var(--tf-border-subtle)] last:border-0
                          border-l-2 transition-colors duration-100
                          ${n.isRead
                            ? `border-l-transparent hover:bg-[var(--tf-bg-hover)]`
                            : `${meta.accent} bg-[var(--tf-bg-hover)] hover:bg-[var(--tf-bg-card)]`
                          }`}
                      >
                        {/* Icon chip */}
                        <div className={`w-7 h-7 rounded-[8px] ${meta.iconBg} border border-[var(--tf-border-subtle)] flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon size={13} className={meta.iconColor} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12.5px] leading-snug ${n.isRead ? "text-[var(--tf-text-tertiary)]" : "text-[var(--tf-text-secondary)]"}`}>
                            {n.message}
                          </p>
                          <p className="text-[10.5px] text-[var(--tf-text-tertiary)] mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>

                        {/* Unread dot */}
                        {!n.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--tf-accent-text)] flex-shrink-0 mt-2" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
