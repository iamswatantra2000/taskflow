"use client"

import { useState, useEffect, useCallback } from "react"
import { Video, Loader2 } from "lucide-react"
import { MeetingRoom } from "./MeetingRoom"

type Meeting = {
  id:          string
  roomName:    string
  createdById: string
  status:      string
}

type Props = {
  projectId:   string
  currentUser: { userId: string; name: string }
}

export function MeetingButton({ projectId, currentUser }: Props) {
  const [meeting, setMeeting]   = useState<Meeting | null>(null)
  const [loading, setLoading]   = useState(false)
  const [inCall, setInCall]     = useState(false)
  const [checked, setChecked]   = useState(false)

  const fetchMeeting = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data.meeting)
      }
    } catch {
      // silently ignore network errors
    } finally {
      setChecked(true)
    }
  }, [projectId])

  // Initial check + poll every 8 seconds to pick up meetings started by others
  useEffect(() => {
    fetchMeeting()
    const id = setInterval(fetchMeeting, 8000)
    return () => clearInterval(id)
  }, [fetchMeeting])

  async function startMeeting() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/meetings/${projectId}`, { method: "POST" })
      const data = await res.json()
      setMeeting(data.meeting)
      setInCall(true)
    } finally {
      setLoading(false)
    }
  }

  async function joinMeeting() {
    setInCall(true)
  }

  async function endMeeting() {
    await fetch(`/api/meetings/${projectId}`, { method: "DELETE" })
    setMeeting(null)
    setInCall(false)
  }

  function leaveMeeting() {
    setInCall(false)
    // Re-poll so button reflects real state
    fetchMeeting()
  }

  const isHost = meeting?.createdById === currentUser.userId

  // While meeting is open, render full-screen overlay
  if (inCall && meeting) {
    return (
      <MeetingRoom
        roomName={meeting.roomName}
        displayName={currentUser.name}
        isHost={isHost}
        onLeave={leaveMeeting}
        onEnd={endMeeting}
      />
    )
  }

  const hasMeeting = !!meeting

  return (
    <button
      type="button"
      onClick={hasMeeting ? joinMeeting : startMeeting}
      disabled={loading}
      className={`
        flex items-center gap-1.5 h-7 px-2 sm:px-3 rounded-md text-[12px] font-medium
        transition-all disabled:opacity-60
        ${hasMeeting
          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
          : "bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)]"
        }
      `}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <>
          {hasMeeting && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" />
          )}
          <Video size={13} className="flex-shrink-0" />
          <span className="hidden sm:inline">
            {hasMeeting ? "Join meeting" : "Start meeting"}
          </span>
        </>
      )}
    </button>
  )
}
