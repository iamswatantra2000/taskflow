"use client"

import { usePresence, presenceColor } from "@/hooks/usePresence"

type Props = {
  projectId:   string
  currentUser: { userId: string; name: string }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const MAX_SHOWN = 4

export function PresenceAvatars({ projectId, currentUser }: Props) {
  const users = usePresence(projectId, currentUser)

  if (users.length <= 1) return null // only current user — nothing to show

  const shown  = users.slice(0, MAX_SHOWN)
  const hidden = users.length - MAX_SHOWN

  return (
    <div className="flex items-center gap-2">
      {/* Live dot + label */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="relative flex h-[7px] w-[7px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-emerald-500" />
        </span>
        <span className="text-[11px] text-[var(--tf-text-tertiary)] font-medium">
          {users.length} online
        </span>
      </div>

      {/* Stacked avatars */}
      <div className="flex items-center">
        {shown.map((user, i) => {
          const isYou    = user.userId === currentUser.userId
          const initials = getInitials(user.name)
          const color    = presenceColor(user.userId)

          return (
            <div
              key={user.userId}
              title={isYou ? `${user.name} (you)` : user.name}
              style={{
                marginLeft:      i === 0 ? 0 : "-7px",
                zIndex:          MAX_SHOWN - i,
                backgroundColor: color,
                borderColor:     "var(--presence-border)",
              }}
              className={[
                "w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center",
                "text-[9px] font-semibold text-white cursor-default select-none",
                "transition-transform hover:scale-110 hover:z-50",
                isYou ? "ring-2 ring-offset-1 ring-indigo-400 dark:ring-indigo-500" : "",
              ].join(" ")}
            >
              {initials}
            </div>
          )
        })}

        {/* Overflow badge */}
        {hidden > 0 && (
          <div
            title={`${hidden} more people`}
            style={{ marginLeft: "-7px", zIndex: 0 }}
            className="w-[26px] h-[26px] rounded-full border-2 border-white dark:border-[var(--tf-bg-panel)] bg-slate-200 dark:bg-[var(--tf-bg-hover)] flex items-center justify-center text-[9px] font-semibold text-[var(--tf-text-secondary)]"
          >
            +{hidden}
          </div>
        )}
      </div>
    </div>
  )
}
