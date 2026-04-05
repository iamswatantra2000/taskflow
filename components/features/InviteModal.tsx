// components/features/InviteModal.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  X, Mail, Send, CheckCircle2, Copy, Check,
  Loader2, UserPlus, Shield, User, Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { sendInvitation, revokeInvitation } from "@/lib/invite-actions"

type Invitation = {
  id:        string
  email:     string
  role:      string
  status:    string
  createdAt: Date
  expiresAt: Date
}

type Props = {
  onClose:        () => void
  pendingInvites: Invitation[]
  userRole:       string
}

const ROLE_META = {
  MEMBER: {
    label: "Member",
    desc:  "Can view and manage tasks",
    icon:  User,
    chip:  "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-[#666] dark:border-white/[0.08]",
  },
  ADMIN: {
    label: "Admin",
    desc:  "Can manage projects and invite members",
    icon:  Shield,
    chip:  "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/[0.1] dark:text-indigo-300 dark:border-indigo-500/25",
  },
}

export function InviteModal({ onClose, pendingInvites, userRole }: Props) {
  const router              = useRouter()
  const [email, setEmail]   = useState("")
  const [role, setRole]     = useState<"MEMBER" | "ADMIN">("MEMBER")
  const [sending, setSending] = useState(false)
  const [sent, setSent]     = useState(false)
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setTimeout(() => setMounted(true), 20))
  }, [])

  function close() {
    setMounted(false)
    setTimeout(onClose, 200)
  }

  async function handleSend() {
    if (!email.trim()) return toast.error("Please enter an email address")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Please enter a valid email")

    setSending(true)
    try {
      const result = await sendInvitation(email.trim(), role)
      setInviteUrl(result.inviteUrl)
      setSent(true)
      toast.success("Invitation sent!", { description: `${email} will receive an email shortly.` })
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation")
    } finally {
      setSending(false)
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id)
    try {
      await revokeInvitation(id)
      toast.success("Invitation revoked")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke")
    } finally {
      setRevoking(null)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function resetForm() {
    setSent(false)
    setEmail("")
    setInviteUrl("")
    setRole("MEMBER")
  }

  const canInvite = userRole === "OWNER" || userRole === "ADMIN"

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default"
        onClick={close}
        aria-label="Close"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/[0.08] rounded-[20px] overflow-hidden"
        style={{
          boxShadow:  "0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? "scale(1) translateY(0)" : "scale(0.96) translateY(-8px)",
          transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top glow line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-indigo-500/[0.12] border border-indigo-500/20 flex items-center justify-center">
              <UserPlus size={14} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">Invite member</h2>
              <p className="text-[11.5px] text-slate-400 dark:text-[#3a3a3a]">Send an invite link via email</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-400 dark:text-[#333] hover:text-slate-600 dark:hover:text-[#888] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!sent ? (
            /* ── Invite form ── */
            <>
              {/* Email input */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-[#3a3a3a] uppercase tracking-[0.08em]">Email address</p>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#333] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="teammate@company.com"
                    autoFocus
                    className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-[10px] pl-9 pr-4 py-2.5 text-[13px] text-slate-700 dark:text-[#ccc] placeholder-slate-300 dark:placeholder-[#2a2a2a] outline-none
                      hover:border-slate-300 dark:hover:border-white/[0.12] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/[0.1] transition-all duration-150"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-[#3a3a3a] uppercase tracking-[0.08em]">Role</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["MEMBER", "ADMIN"] as const).map((r) => {
                    const meta   = ROLE_META[r]
                    const RIcon  = meta.icon
                    const active = role === r
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex items-start gap-2.5 p-3 rounded-[10px] border text-left transition-all duration-150
                          ${active
                            ? "bg-indigo-50 dark:bg-indigo-500/[0.08] border-indigo-200 dark:border-indigo-500/25 ring-1 ring-indigo-500/15"
                            : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12]"
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 mt-0.5
                          ${active ? "bg-indigo-100 dark:bg-indigo-500/[0.15] border border-indigo-300 dark:border-indigo-500/25" : "bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07]"}`}
                        >
                          <RIcon size={12} className={active ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-[#444]"} />
                        </div>
                        <div>
                          <p className={`text-[12.5px] font-semibold ${active ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500 dark:text-[#666]"}`}>
                            {meta.label}
                          </p>
                          <p className="text-[10.5px] text-slate-400 dark:text-[#333] mt-0.5">{meta.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Send button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !canInvite}
                className="flex items-center justify-center gap-2 h-10 w-full text-[13px] font-semibold
                  bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                  text-white border border-indigo-700/80 rounded-[11px]
                  shadow-[0_4px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none
                  transition-all duration-100"
              >
                {sending
                  ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  : <><Send size={13} /> Send invitation</>
                }
              </button>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/[0.1] border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">Invite sent!</h3>
              <p className="text-[13px] text-slate-500 dark:text-[#555] mb-5">
                <span className="text-slate-600 dark:text-[#777]">{email}</span> will receive an email with the invite link.
              </p>

              {/* Copyable link */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-[10px] p-3 mb-4">
                <p className="text-[10.5px] font-semibold text-slate-400 dark:text-[#2e2e2e] uppercase tracking-[0.08em] mb-1.5">Invite link</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[11.5px] text-slate-500 dark:text-[#555] truncate font-mono">{inviteUrl}</p>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-semibold rounded-[7px] flex-shrink-0
                      bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-[#666] hover:text-slate-800 dark:hover:text-white transition-all"
                  >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 h-9 text-[12.5px] font-semibold text-slate-500 dark:text-[#555] hover:text-slate-800 dark:hover:text-white
                    bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.07]
                    rounded-[10px] transition-all duration-150"
                >
                  Invite another
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 h-9 text-[12.5px] font-semibold text-white
                    bg-indigo-600 hover:bg-indigo-500 border border-indigo-700/80
                    rounded-[10px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[2px] active:shadow-none
                    transition-all duration-100"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── Pending invitations list ── */}
          {pendingInvites.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-[#2e2e2e] uppercase tracking-[0.08em] mb-3">
                Pending invites · {pendingInvites.length}
              </p>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {pendingInvites.map((inv) => {
                  const meta = ROLE_META[inv.role as "MEMBER" | "ADMIN"] ?? ROLE_META.MEMBER
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-3 p-2.5 rounded-[9px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05]"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center flex-shrink-0">
                        <Mail size={11} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-600 dark:text-[#888] truncate">{inv.email}</p>
                        <p className="text-[10.5px] text-slate-400 dark:text-[#333]">
                          Expires {new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full border ${meta.chip}`}>
                        {meta.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevoke(inv.id)}
                        disabled={revoking === inv.id}
                        className="w-6 h-6 flex items-center justify-center rounded-[6px] text-slate-400 dark:text-[#333] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-all flex-shrink-0"
                        title="Revoke invite"
                      >
                        {revoking === inv.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Trash2 size={11} />
                        }
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
