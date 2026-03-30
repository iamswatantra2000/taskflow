// components/features/LoginForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>

      {error && (
        <p className="text-[12px] text-red-400 bg-red-950 border border-red-900 rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold border border-indigo-700/80 rounded-[8px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100 mt-2"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  )
}