// components/features/RegisterForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { registerUser } from "@/lib/actions"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()

  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Client-side check before hitting server
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.set("name",     name)
      formData.set("email",    email)
      formData.set("password", password)

      // 1. Register the user
      const result = await registerUser(formData)

      toast.success("Account created!", {
        description: "Signing you in...",
      })

      // 2. Auto sign in immediately after registering
      const signInResult = await signIn("credentials", {
        email:    result.email,
        password: result.password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Registration worked but auto-login failed — redirect to login
        router.push("/login")
        return
      }

      // 3. Go straight to dashboard
      router.push("/")
      router.refresh()

    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
      setError(message)
      toast.error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  function getPasswordStrength(pw: string) {
    if (pw.length === 0) return null
    if (pw.length < 6)   return { label: "Too short", color: "bg-red-500",    width: "w-1/4"  }
    if (pw.length < 8)   return { label: "Weak",      color: "bg-orange-500", width: "w-2/4"  }
    if (pw.length < 12)  return { label: "Good",      color: "bg-amber-500",  width: "w-3/4"  }
    return                      { label: "Strong",    color: "bg-emerald-500", width: "w-full" }
  }

  const strength = getPasswordStrength(password)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />

        {/* Password strength bar */}
        {strength && (
          <div className="space-y-1">
            <div className="h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
            </div>
            <p className={`text-[11px] ${
              strength.label === "Strong" ? "text-emerald-400" :
              strength.label === "Good"   ? "text-amber-400"   :
              strength.label === "Weak"   ? "text-orange-400"  :
                                            "text-red-400"
            }`}>
              {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="text-[12px] font-medium text-[#888]">
          Confirm password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          required
          className={`w-full bg-[#0d0d0d] border rounded-[8px] px-3 py-2 text-[13px] text-[#e0e0e0] placeholder-[#444] outline-none focus:ring-1 transition-colors ${
            confirm && confirm !== password
              ? "border-red-800 focus:border-red-500 focus:ring-red-500"
              : "border-[#2a2a2a] focus:border-indigo-500 focus:ring-indigo-500"
          }`}
        />
        {/* Inline match indicator */}
        {confirm && (
          <p className={`text-[11px] ${
            confirm === password ? "text-emerald-400" : "text-red-400"
          }`}>
            {confirm === password ? "Passwords match" : "Passwords do not match"}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[12px] text-red-400 bg-red-950 border border-red-900 rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (!!confirm && confirm !== password)}
        className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold border border-indigo-700/80 rounded-[8px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100 mt-2"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

    </form>
  )
}