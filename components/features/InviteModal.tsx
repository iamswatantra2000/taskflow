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
    chip:  "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:text-[var(--tf-text-secondary)] dark:border-[var(--tf-border)]",
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
        className="relative w-full max-w-[480px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[20px] overflow-hidden"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--tf-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[9px] bg-[var(--tf-accent-muted)] border border-indigo-500/20 flex items-center justify-center">
              <UserPlus size={14} className="text-[var(--tf-accent-text)]" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[var(--tf-text-primary)] tracking-tight">Invite member</h2>
              <p className="text-[11.5px] text-[var(--tf-text-tertiary)]">Send an invite link via email</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--tf-text-tertiary)] hover:text-slate-600 dark:hover:text-[#888] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
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
                <p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">Email address</p>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tf-text-tertiary)] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="teammate@company.com"
                    autoFocus
                    className="w-full bg-[var(--tf-bg-input)] border border-[var(--tf-border)] rounded-[10px] pl-9 pr-4 py-2.5 text-[13px] text-[var(--tf-text-primary)] placeholder-slate-300 dark:placeholder-[#2a2a2a] outline-none
                      hover:border-slate-300 dark:hover:border-white/[0.12] focus:border-[var(--tf-accent)] focus:ring-2 focus:ring-[var(--tf-accent)]/[0.1] transition-all duration-150"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">Role</p>
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
                            : "bg-slate-50 dark:bg-white/[0.02] border-[var(--tf-border)] hover:border-slate-300 dark:hover:border-white/[0.12]"
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0 mt-0.5
                          ${active ? "bg-indigo-100 dark:bg-indigo-500/[0.15] border border-indigo-300 dark:border-indigo-500/25" : "bg-[var(--tf-bg-hover)] border border-[var(--tf-border)]"}`}
                        >
                          <RIcon size={12} className={active ? "text-indigo-500 dark:text-indigo-400" : "text-[var(--tf-text-tertiary)]"} />
                        </div>
                        <div>
                          <p className={`text-[12.5px] font-semibold ${active ? "text-indigo-600 dark:text-indigo-300" : "text-[var(--tf-text-secondary)]"}`}>
                            {meta.label}
                          </p>
                          <p className="text-[10.5px] text-[var(--tf-text-tertiary)] mt-0.5">{meta.desc}</p>
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
                  bg-[var(--tf-accent)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
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
              <h3 className="text-[16px] font-bold text-[var(--tf-text-primary)] tracking-tight mb-1">Invite sent!</h3>
              <p className="text-[13px] text-[var(--tf-text-tertiary)] mb-5">
                <span className="text-[var(--tf-text-secondary)]">{email}</span> will receive an email with the invite link.
              </p>

              {/* Copyable link */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[var(--tf-border-subtle)] rounded-[10px] p-3 mb-4">
                <p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em] mb-1.5">Invite link</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-[11.5px] text-[var(--tf-text-tertiary)] truncate font-mono">{inviteUrl}</p>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="flex items-center gap-1.5 h-7 px-3 text-[11px] font-semibold rounded-[7px] flex-shrink-0
                      bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:text-slate-800 dark:hover:text-white transition-all"
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
                  className="flex-1 h-9 text-[12.5px] font-semibold text-[var(--tf-text-tertiary)] hover:text-slate-800 dark:hover:text-white
                    bg-[var(--tf-bg-hover)] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-[var(--tf-border)]
                    rounded-[10px] transition-all duration-150"
                >
                  Invite another
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 h-9 text-[12.5px] font-semibold text-white
                    bg-[var(--tf-accent)] hover:brightness-110 border border-indigo-700/80
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
            <div className="pt-2 border-t border-[var(--tf-border-subtle)]">
              <p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em] mb-3">
                Pending invites · {pendingInvites.length}
              </p>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {pendingInvites.map((inv) => {
                  const meta = ROLE_META[inv.role as "MEMBER" | "ADMIN"] ?? ROLE_META.MEMBER
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center gap-3 p-2.5 rounded-[9px] bg-slate-50 dark:bg-white/[0.02] border border-[var(--tf-border-subtle)]"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center flex-shrink-0">
                        <Mail size={11} className="text-[var(--tf-accent-text)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-[var(--tf-text-secondary)] truncate">{inv.email}</p>
                        <p className="text-[10.5px] text-[var(--tf-text-tertiary)]">
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
                        className="w-6 h-6 flex items-center justify-center rounded-[6px] text-[var(--tf-text-tertiary)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-all flex-shrink-0"
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
