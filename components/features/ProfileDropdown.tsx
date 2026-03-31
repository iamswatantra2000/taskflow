// components/features/ProfileDropdown.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { updateDisplayName } from "@/lib/actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User, LogOut, ChevronRight, X,
} from "lucide-react"

type Props = {
  user: { name?: string | null; email?: string | null }
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ——— Change Name Form ———
function ChangeNameForm({ currentName, onDone }: { currentName: string; onDone: () => void }) {
  const [name, setName]     = useState(currentName)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() === currentName) { onDone(); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set("name", name)
      await updateDisplayName(fd)
      toast.success("Name updated!")
      onDone()
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <button type="button" onClick={onDone} className="text-[#555] hover:text-[#999] transition-colors">
          <X size={13} />
        </button>
        <span className="text-[12px] font-medium text-[#e0e0e0]">Change name</span>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[7px] px-3 py-1.5 text-[12px] text-[#e0e0e0] outline-none focus:border-indigo-500 transition-colors"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[12px] font-semibold border border-indigo-700/80 rounded-[8px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150"
      >
        {loading ? "Saving…" : "Save name"}
      </button>
    </form>
  )
}

// ——— Main dropdown ———
export function ProfileDropdown({ user }: Props) {
  const { signOut }         = useClerk()
  const { user: clerkUser } = useUser()
  const [open, setOpen]     = useState(false)
  const [view, setView]     = useState<"menu" | "name">("menu")
  const ref                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setView("menu")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function close() { setOpen(false); setView("menu") }

  return (
    <div className="relative" ref={ref}>
      {/* Avatar trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setView("menu") }}
        className="focus:outline-none"
      >
        <Avatar className="h-7 w-7 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500 transition-all">
          <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
          <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 text-[11px]">
            {getInitials(user.name ?? "User")}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-9 w-[240px] bg-[#161616] border border-[#2a2a2a] rounded-[12px] shadow-2xl z-50 overflow-hidden">

          {view === "menu" && (
            <>
              {/* Profile header */}
              <div className="p-3 border-b border-[#222]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={clerkUser?.imageUrl} className="object-cover" />
                    <AvatarFallback className="text-[13px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
                      {getInitials(user.name ?? "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#f0f0f0] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#555] truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                {/* Change name */}
                <button
                  type="button"
                  onClick={() => setView("name")}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] hover:bg-[#1f1f1f] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <User size={13} className="text-[#555]" />
                    <span className="text-[12px] text-[#ccc]">Change name</span>
                  </div>
                  <ChevronRight size={12} className="text-[#444] group-hover:text-[#666] transition-colors" />
                </button>

              </div>

              {/* Sign out */}
              <div className="p-1.5 border-t border-[#1f1f1f]">
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] hover:bg-red-950 transition-colors group"
                >
                  <LogOut size={13} className="text-[#555] group-hover:text-red-400 transition-colors" />
                  <span className="text-[12px] text-[#888] group-hover:text-red-400 transition-colors">Sign out</span>
                </button>
              </div>
            </>
          )}

          {view === "name" && (
            <ChangeNameForm currentName={user.name ?? ""} onDone={() => setView("menu")} />
          )}

        </div>
      )}
    </div>
  )
}
