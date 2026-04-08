// components/features/OnboardingWizard.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2, FolderKanban, UserPlus, ArrowRight,
  Check, Loader2, Sparkles, ChevronRight, X,
} from "lucide-react"
import { LogoMark } from "@/components/ui/LogoMark"
import { updateWorkspaceName, createProject } from "@/lib/actions"
import { sendInvitation } from "@/lib/invite-actions"
import { completeOnboarding } from "@/lib/onboarding-actions"
import { toast } from "sonner"

type Props = {
  userId:        string
  firstName:     string
  workspaceId:   string
  workspaceName: string
}

const STORAGE_KEY = (id: string) => `tf_onboarded_${id}`

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
]

const STEPS = [
  { id: 1, label: "Workspace",  icon: Building2     },
  { id: 2, label: "Project",    icon: FolderKanban  },
  { id: 3, label: "Team",       icon: UserPlus      },
]

export function OnboardingWizard({ userId, firstName, workspaceId, workspaceName }: Props) {
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Step 1
  const [wsName, setWsName] = useState(workspaceName)

  // Step 2
  const [projName,  setProjName]  = useState("")
  const [projColor, setProjColor] = useState(PROJECT_COLORS[0])

  // Step 3
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole,  setInviteRole]  = useState<"MEMBER" | "ADMIN">("MEMBER")

  useEffect(() => { setMounted(true) }, [])

  async function finish() {
    // Mark in DB (source of truth) + localStorage (UI cache)
    try { await completeOnboarding() } catch {}
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY(userId), "1")
    }
    setDone(true)
    setTimeout(() => router.push("/dashboard"), 1200)
  }

  async function handleStep1() {
    if (!wsName.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set("name", wsName.trim())
      await updateWorkspaceName(fd)
      setStep(2)
    } catch {
      toast.error("Couldn't save workspace name")
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2() {
    if (!projName.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.set("name",  projName.trim())
      fd.set("color", projColor)
      await createProject(fd)
      setStep(3)
    } catch {
      toast.error("Couldn't create project")
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3() {
    if (!inviteEmail.trim()) { finish(); return }
    setLoading(true)
    try {
      await sendInvitation(inviteEmail.trim(), inviteRole)
      toast.success(`Invite sent to ${inviteEmail}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send invite"
      toast.error(msg)
    } finally {
      setLoading(false)
      finish()
    }
  }

  if (!mounted) return null

  if (done) {
    return (
      <div className="fixed inset-0 z-[999] bg-[var(--tf-bg-panel)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" style={{ animation: "fade-in-up 0.4s ease both" }}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Check size={28} className="text-emerald-400" />
          </div>
          <p className="text-[18px] font-bold text-[var(--tf-text-primary)]">You&apos;re all set!</p>
          <p className="text-[13px] text-[var(--tf-text-tertiary)]">Taking you to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[999] bg-[var(--tf-bg-panel)]/95 backdrop-blur-sm flex items-center justify-center p-4">

      {/* Ambient glow */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div
        className="relative w-full max-w-[460px] bg-[var(--tf-bg-card)] border border-[var(--tf-border)] rounded-[20px] overflow-hidden"
        style={{
          boxShadow: "0 40px 100px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
          animation: "fadeSlideIn 0.2s ease-out",
        }}
      >
        {/* Top glow line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <LogoMark height={20} />
              <span className="text-[13px] font-bold text-[var(--tf-text-primary)] font-bricolage">TaskFlow</span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--tf-text-tertiary)] hover:text-slate-600 dark:hover:text-[#666] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
              title="Skip setup"
            >
              <X size={13} />
            </button>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isComplete = step > s.id
              const isActive   = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1">
                  {/* Circle */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${isComplete
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : isActive
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/[0.12] text-indigo-500 dark:text-indigo-400"
                          : "border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.02] text-[var(--tf-text-tertiary)]"
                        }`}
                    >
                      {isComplete
                        ? <Check size={13} />
                        : <s.icon size={13} />
                      }
                    </div>
                    <span className={`text-[9.5px] font-semibold uppercase tracking-[0.06em] transition-colors
                      ${isActive ? "text-indigo-500 dark:text-indigo-400" : isComplete ? "text-[var(--tf-text-tertiary)]" : "text-[var(--tf-text-tertiary)]"}`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Connector line (not after last) */}
                  {i < STEPS.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-3 mb-5 rounded-full transition-colors duration-500
                      ${step > s.id ? "bg-indigo-600" : "bg-slate-200 dark:bg-white/[0.06]"}`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-white/[0.06] mx-6" />

        {/* Step content */}
        <div className="px-6 py-6">

          {/* ── Step 1: Workspace ── */}
          {step === 1 && (
            <div style={{ animation: "fadeSlideIn 0.18s ease-out" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-[11px] bg-indigo-500/[0.12] border border-indigo-500/20 flex items-center justify-center">
                  <Building2 size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--tf-text-primary)] leading-tight">Name your workspace</h2>
                  <p className="text-[12px] text-[var(--tf-text-tertiary)] mt-0.5">This is where your team&apos;s work lives</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">
                    Workspace name
                  </label>
                  <input
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                    placeholder="e.g. Acme Corp, My Team…"
                    autoFocus
                    className="w-full bg-[var(--tf-bg-input)] border border-slate-200 dark:border-[var(--tf-border)] focus:border-[var(--tf-accent)] focus:ring-1 focus:ring-[var(--tf-accent)]/30 rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-[#2a2a2a] outline-none transition-all"
                  />
                </div>

                <p className="text-[11.5px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">
                  <Sparkles size={10} className="inline mr-1 text-[var(--tf-text-tertiary)]" />
                  Hi {firstName}! This takes about 2 minutes.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Project ── */}
          {step === 2 && (
            <div style={{ animation: "fadeSlideIn 0.18s ease-out" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-[11px] bg-violet-500/[0.12] border border-violet-500/20 flex items-center justify-center">
                  <FolderKanban size={16} className="text-violet-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--tf-text-primary)] leading-tight">Create your first project</h2>
                  <p className="text-[12px] text-[var(--tf-text-tertiary)] mt-0.5">Projects group related tasks together</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">
                    Project name
                  </label>
                  <input
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStep2()}
                    placeholder="e.g. Website redesign, Q2 roadmap…"
                    autoFocus
                    className="w-full bg-[var(--tf-bg-input)] border border-slate-200 dark:border-[var(--tf-border)] focus:border-[var(--tf-accent)] focus:ring-1 focus:ring-[var(--tf-accent)]/30 rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-[#2a2a2a] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">
                    Project color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PROJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setProjColor(c)}
                        className={`w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center
                          ${projColor === c ? "ring-2 ring-slate-400/40 dark:ring-white/40 ring-offset-2 ring-offset-white dark:ring-offset-[#0d0d0d] scale-110" : "hover:scale-105"}`}
                        style={{ background: c }}
                      >
                        {projColor === c && <Check size={11} className="text-white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini preview */}
                <div className="flex items-center gap-2 p-2.5 rounded-[9px] bg-slate-50 dark:bg-white/[0.02] border border-[var(--tf-border-subtle)]">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: projColor }} />
                  <span className="text-[12px] text-[var(--tf-text-tertiary)] truncate">
                    {projName || <span className="text-[var(--tf-text-tertiary)]">Your project name</span>}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Invite ── */}
          {step === 3 && (
            <div style={{ animation: "fadeSlideIn 0.18s ease-out" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-[11px] bg-emerald-500/[0.12] border border-emerald-500/20 flex items-center justify-center">
                  <UserPlus size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--tf-text-primary)] leading-tight">Invite a teammate</h2>
                  <p className="text-[12px] text-[var(--tf-text-tertiary)] mt-0.5">Great teams are built together — optional</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStep3()}
                    placeholder="teammate@company.com"
                    autoFocus
                    className="w-full bg-[var(--tf-bg-input)] border border-slate-200 dark:border-[var(--tf-border)] focus:border-[var(--tf-accent)] focus:ring-1 focus:ring-[var(--tf-accent)]/30 rounded-[10px] px-3.5 py-2.5 text-[13.5px] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-[#2a2a2a] outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.08em]">
                    Role
                  </label>
                  <div className="flex gap-2">
                    {(["MEMBER", "ADMIN"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setInviteRole(r)}
                        className={`flex-1 py-2 rounded-[9px] text-[12px] font-semibold border transition-all
                          ${inviteRole === r
                            ? "bg-indigo-600 border-indigo-500/60 text-white"
                            : "bg-slate-50 dark:bg-white/[0.02] border-[var(--tf-border)] text-slate-500 dark:text-[var(--tf-text-tertiary)] hover:border-slate-300 dark:hover:border-white/[0.12] hover:text-slate-700 dark:hover:text-[#888]"
                          }`}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          {/* Step indicator text */}
          <span className="text-[11px] text-slate-400 dark:text-[var(--tf-text-tertiary)] font-medium tabular-nums">
            Step {step} of {STEPS.length}
          </span>

          <div className="flex items-center gap-2">
            {step === 3 && (
              <button
                type="button"
                onClick={finish}
                className="h-9 px-4 text-[12px] font-medium text-slate-500 dark:text-[var(--tf-text-tertiary)] hover:text-slate-700 dark:hover:text-[#777] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] rounded-[9px] transition-all"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3}
              disabled={loading || (step === 1 && !wsName.trim()) || (step === 2 && !projName.trim())}
              className="h-9 px-5 text-[13px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-indigo-700/80 rounded-[9px] shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-100 flex items-center gap-2"
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : step === 3
                  ? <><Check size={13} /> {inviteEmail ? "Send & finish" : "Finish"}</>
                  : <>Continue <ChevronRight size={13} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
