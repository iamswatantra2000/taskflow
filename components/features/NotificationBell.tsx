// components/features/NotificationBell.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, AtSign, Loader2 } from "lucide-react"
import { getNotifications, markAllNotificationsRead } from "@/lib/notification-actions"

type Notification = {
  id: string; type: string; message: string
  taskId: string | null; isRead: boolean; createdAt: Date
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)    return "just now"
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function NotificationBell() {
  const [open, setOpen]       = useState(false)
  const [items, setItems]     = useState<Notification[]>([])
  const [marking, setMarking] = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)

  const unread = items.filter((n) => !n.isRead).length

  // Load on mount + poll every 30s
  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  async function load() {
    try {
      const data = await getNotifications()
      setItems(data as Notification[])
    } catch {}
  }

  async function handleToggle() {
    const opening = !open
    setOpen(opening)
    if (opening && unread > 0) {
      setMarking(true)
      try {
        await markAllNotificationsRead()
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
      } finally {
        setMarking(false)
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative w-7 h-7 flex items-center justify-center rounded-[8px]
          text-[#555] hover:text-[#888] hover:bg-white/[0.05] border border-transparent
          hover:border-white/[0.08] transition-all duration-150"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center
            bg-indigo-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[300px] bg-[#0d0d0d] border border-white/[0.08] rounded-[14px] overflow-hidden z-[200]"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)" }}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bell size={12} className="text-[#444]" />
              <span className="text-[12px] font-bold text-[#777]">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/[0.1] border border-indigo-500/20 rounded-full px-1.5 py-0.5 leading-none">
                  {unread} new
                </span>
              )}
            </div>
            {marking && <Loader2 size={11} className="animate-spin text-[#333]" />}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-[10px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                  <Bell size={16} className="text-[#222]" />
                </div>
                <p className="text-[12px] text-[#333]">No notifications yet</p>
                <p className="text-[11px] text-[#222] mt-1">Mentions will show up here</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0
                    ${n.isRead ? "" : "bg-indigo-500/[0.04]"}`}
                >
                  <div className="w-7 h-7 rounded-[8px] bg-indigo-500/[0.1] border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AtSign size={12} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] leading-relaxed ${n.isRead ? "text-[#444]" : "text-[#888]"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10.5px] text-[#333] mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
