"use client"

import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const { signOut } = useClerk()

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/login" })}
      className="flex items-center gap-1.5 text-[12px] text-[#555] hover:text-[#999] transition-colors"
      title="Sign out"
    >
      <LogOut size={13} />
      <span>Sign out</span>
    </button>
  )
}
