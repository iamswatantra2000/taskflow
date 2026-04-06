"use client"

import { useEffect, useState, useRef } from "react"

export type PresenceUser = {
  userId:   string
  name:     string
  color:    string
  lastSeen: number
}

// Deterministic color from userId — same user always gets the same color
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#f97316", "#84cc16",
]

export function presenceColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return COLORS[hash % COLORS.length]
}

const HEARTBEAT_INTERVAL = 20_000 // 20 seconds

export function usePresence(
  projectId: string,
  currentUser: { userId: string; name: string }
) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])
  const userRef = useRef(currentUser)
  userRef.current = currentUser

  useEffect(() => {
    const color = presenceColor(currentUser.userId)

    async function ping() {
      try {
        const res = await fetch(`/api/presence/${projectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userRef.current.userId,
            name:   userRef.current.name,
            color,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setActiveUsers(data.users ?? [])
        }
      } catch {
        // Network error — silently ignore, presence is best-effort
      }
    }

    ping()
    const interval = setInterval(ping, HEARTBEAT_INTERVAL)

    return () => {
      clearInterval(interval)
      // Best-effort cleanup when navigating away
      const payload = JSON.stringify({ userId: currentUser.userId })
      try {
        navigator.sendBeacon(`/api/presence/${projectId}`, new Blob([payload], { type: "application/json" }))
      } catch {
        // sendBeacon not available (SSR guard)
      }
    }
  }, [projectId, currentUser.userId])

  return activeUsers
}
