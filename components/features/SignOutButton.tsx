// components/features/SignOutButton.tsx
"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
<button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-1.5 text-[12px] text-[#555] hover:text-[#999] transition-colors"
      title="Sign out"
    >
      <LogOut size={13} />
      <span>Sign out</span>
    </button>
  )
}