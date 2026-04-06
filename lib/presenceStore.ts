/**
 * Module-level in-memory presence store.
 * Each user pings every 20s; entries older than 45s are considered gone.
 */

export type PresenceUser = {
  userId: string
  name:   string
  color:  string
  lastSeen: number
}

const TTL = 45_000 // ms

// projectId → (userId → PresenceUser)
const store = new Map<string, Map<string, PresenceUser>>()

export function heartbeat(
  projectId: string,
  user: Omit<PresenceUser, "lastSeen">
) {
  if (!store.has(projectId)) store.set(projectId, new Map())
  store.get(projectId)!.set(user.userId, { ...user, lastSeen: Date.now() })
}

export function leave(projectId: string, userId: string) {
  store.get(projectId)?.delete(userId)
}

export function getActiveUsers(projectId: string): PresenceUser[] {
  const now  = Date.now()
  const room = store.get(projectId)
  if (!room) return []

  // Prune stale entries in-place
  for (const [uid, u] of room) {
    if (now - u.lastSeen > TTL) room.delete(uid)
  }

  return Array.from(room.values())
}
