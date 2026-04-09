"use client"

import { useEffect, useRef } from "react"
import { X, Mic, Video, PhoneOff } from "lucide-react"

type Props = {
  roomName:    string
  displayName: string
  onLeave:     () => void
  onEnd:       () => void
  isHost:      boolean
}

export function MeetingRoom({ roomName, displayName, onLeave, onEnd, isHost }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll while meeting is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const jitsiUrl =
    `https://meet.jit.si/${roomName}` +
    `#userInfo.displayName="${encodeURIComponent(displayName)}"` +
    `&config.prejoinPageEnabled=false` +
    `&config.startWithAudioMuted=false` +
    `&config.startWithVideoMuted=false` +
    `&config.toolbarButtons=["microphone","camera","chat","tileview","hangup"]` +
    `&interfaceConfig.SHOW_JITSI_WATERMARK=false` +
    `&interfaceConfig.SHOW_BRAND_WATERMARK=false` +
    `&interfaceConfig.DEFAULT_BACKGROUND=%23000000`

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[13px] font-medium text-white">Meeting in progress</span>
          <span className="text-[11px] text-white/40 font-mono">{roomName}</span>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              type="button"
              onClick={onEnd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-[12px] font-medium transition-colors"
            >
              <PhoneOff size={13} />
              End for all
            </button>
          )}
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors"
          >
            <X size={13} />
            Leave
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <div ref={containerRef} className="flex-1 min-h-0">
        <iframe
          title="Video meeting"
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  )
}
