// app/invite/[token]/InviteAcceptClient.tsx
"use client"

import Link from "next/link"
import { AlertTriangle, CheckCircle2, Users, LogIn } from "lucide-react"

type Props =
  | { state: "invalid";          reason: string }
  | { state: "unauthenticated";  token: string; workspaceName: string; inviterName: string }

export default function InviteAcceptClient(props: Props) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/[0.06] rounded-full blur-[120px]" />
      </div>

      <div
        className="relative w-full max-w-[420px] bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/[0.08] rounded-[20px] overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {/* Top accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-[11px]">T</span>
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">TaskFlow</span>
          </div>

          {props.state === "invalid" ? (
            /* ── Invalid state ── */
            <div className="text-center">
              <div className="w-14 h-14 rounded-[16px] bg-red-500/[0.1] border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h1 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Invalid invitation
              </h1>
              <p className="text-[13.5px] text-slate-500 dark:text-[#555] leading-relaxed mb-7">
                {props.reason}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-10 px-6 text-[13px] font-semibold
                  bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-500 dark:text-[#888] border border-slate-200 dark:border-white/[0.08]
                  rounded-[10px] transition-all duration-150 w-full"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            /* ── Unauthenticated state ── */
            <div>
              {/* Inviter avatar */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-white dark:ring-offset-[#0d0d0d]">
                  <span className="text-white font-bold text-xl">
                    {props.inviterName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-slate-400 dark:text-[#444] uppercase tracking-[0.08em] mb-2">
                  You're invited
                </p>
                <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Join <span className="text-indigo-400">{props.workspaceName}</span>
                </h1>
                <p className="text-[13.5px] text-slate-500 dark:text-[#555] mt-2">
                  <span className="text-slate-600 dark:text-[#777]">{props.inviterName}</span> invited you to collaborate on TaskFlow
                </p>
              </div>

              {/* Feature highlights */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-[12px] p-4 mb-6 space-y-2.5">
                {[
                  "Kanban task board",
                  "Project management",
                  "Team collaboration",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={9} className="text-indigo-400" />
                    </div>
                    <span className="text-[12.5px] text-slate-500 dark:text-[#555]">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <Link
                  href={`/login?redirect_url=/invite/${props.token}`}
                  className="flex items-center justify-center gap-2 h-11 w-full text-[13.5px] font-semibold
                    bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-700/80
                    rounded-[11px] shadow-[0_4px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none
                    transition-all duration-100"
                >
                  <LogIn size={15} />
                  Sign in to accept
                </Link>
                <Link
                  href={`/register?redirect_url=/invite/${props.token}`}
                  className="flex items-center justify-center gap-2 h-11 w-full text-[13px] font-semibold
                    bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-white
                    border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.14]
                    rounded-[11px] transition-all duration-150"
                >
                  <Users size={14} />
                  Create an account
                </Link>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-[#2a2a2a] text-center mt-5">
                This invitation expires in 7 days
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
