"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Check, Zap, Building2, ArrowLeft,
  Sparkles, Shield, Users, Infinity,
  BarChart3, Activity, Lock, Star,
} from "lucide-react"
import { PaymentModal } from "./PaymentModal"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { ContactSalesModal } from "./ContactSalesModal"

interface Props {
  userId: string | null
  currentPlan: string
}

const FREE_FEATURES = [
  { text: "Up to 3 projects",           included: true  },
  { text: "Unlimited tasks",             included: true  },
  { text: "Kanban board",                included: true  },
  { text: "Basic filters & search",      included: true  },
  { text: "Activity feed",               included: false },
  { text: "Analytics & insights",        included: false },
  { text: "Unlimited projects",          included: false },
  { text: "AI task generator",           included: false },
  { text: "Priority support",            included: false },
]

const PRO_FEATURES = [
  { text: "Everything in Free",          highlight: false },
  { text: "Unlimited projects",          highlight: true  },
  { text: "Activity feed",               highlight: true  },
  { text: "Analytics & insights",        highlight: true  },
  { text: "AI task generator",           highlight: true  },
  { text: "Advanced filters",            highlight: true  },
  { text: "Priority support",            highlight: false },
  { text: "Export to CSV / PDF",         highlight: false },
  { text: "Custom project colors",       highlight: false },
]

const ENTERPRISE_FEATURES = [
  { text: "Everything in Pro"            },
  { text: "Custom SSO & SAML"           },
  { text: "Dedicated account manager"   },
  { text: "SLA guarantee"               },
  { text: "Advanced security & audit"   },
  { text: "Custom integrations"         },
  { text: "Volume discounts"            },
  { text: "On-boarding support"         },
]

const TRUST_ITEMS = [
  { icon: Shield,   text: "256-bit SSL encryption"       },
  { icon: Lock,     text: "No payment stored on servers" },
  { icon: Zap,      text: "Instant plan activation"      },
  { icon: Star,     text: "Cancel anytime, no questions" },
]

export function UpgradeClient({ userId, currentPlan }: Props) {
  const router               = useRouter()
  const [payOpen, setPayOpen] = useState(false)
  const [conOpen, setConOpen] = useState(false)

  const isPro        = currentPlan === "pro" || currentPlan === "enterprise"
  const isEnterprise = currentPlan === "enterprise"

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">

      {/* ── Top bar ── */}
      <div className="h-[50px] border-b border-border flex items-center justify-between pl-14 pr-4 md:px-5 flex-shrink-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <span className="text-slate-300 dark:text-[#2a2a2a]">/</span>
          <span className="text-[13px] font-semibold text-foreground">Upgrade plan</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[960px] mx-auto px-4 py-10 sm:py-14">

          {/* ── Hero ── */}
          <div className="text-center mb-12">
            {/* Current plan badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-[11.5px] font-medium text-slate-500 dark:text-[#666] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Currently on
              <span className="text-slate-700 dark:text-[#aaa] capitalize font-semibold">{currentPlan} plan</span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
              Unlock the full{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                TaskFlow
              </span>{" "}
              experience
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-[#555] max-w-[480px] mx-auto leading-relaxed">
              Upgrade to Pro and get unlimited projects, AI-powered tasks, advanced analytics, and more — in one click.
            </p>
          </div>

          {/* ── Plan cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

            {/* Free */}
            <div className="relative rounded-[16px] border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-[#555] uppercase tracking-[0.1em] mb-2">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-slate-900 dark:text-white leading-none">$0</span>
                  <span className="text-[13px] text-slate-500 dark:text-[#555] mb-1.5">/ month</span>
                </div>
                <p className="text-[12px] text-slate-400 dark:text-[#444]">Perfect to get started</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    {f.included ? (
                      <Check size={13} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock size={11} className="text-slate-300 dark:text-[#333] flex-shrink-0 ml-[1px]" />
                    )}
                    <span className={`text-[12.5px] ${f.included ? "text-slate-500 dark:text-[#888]" : "text-slate-300 dark:text-[#383838]"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro ? (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-slate-100 dark:border-white/[0.06] text-[12.5px] font-medium text-slate-300 dark:text-[#333]">
                  Previous plan
                </div>
              ) : (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-slate-200 dark:border-white/[0.08] text-[12.5px] font-semibold text-slate-500 dark:text-[#555] bg-slate-50 dark:bg-white/[0.02]">
                  Current plan
                </div>
              )}
            </div>

            {/* Pro — highlighted */}
            <div className="relative rounded-[16px] border border-indigo-500/40 bg-indigo-500/[0.04] p-6 flex flex-col shadow-[0_0_40px_-8px_rgba(99,102,241,0.2)]">
              {/* Most popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-[10.5px] font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-900/50">
                  <Sparkles size={9} />
                  Most popular
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-[0.1em] mb-2">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-slate-900 dark:text-white leading-none">$12</span>
                  <span className="text-[13px] text-slate-500 dark:text-[#555] mb-1.5">/ month</span>
                </div>
                <p className="text-[12px] text-slate-500 dark:text-[#555]">Billed monthly · cancel anytime</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    <Check size={13} className={f.highlight ? "text-indigo-400 flex-shrink-0" : "text-emerald-500/60 flex-shrink-0"} />
                    <span className={`text-[12.5px] ${f.highlight ? "text-slate-700 dark:text-[#ccc] font-medium" : "text-slate-500 dark:text-[#777]"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro && !isEnterprise ? (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-indigo-500/30 bg-indigo-500/10 text-[12.5px] font-semibold text-indigo-400">
                  ✓ Current plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPayOpen(true)}
                  disabled={isEnterprise}
                  className="h-10 w-full flex items-center justify-center gap-2 rounded-[9px] bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap size={13} />
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Enterprise */}
            <div className="relative rounded-[16px] border border-slate-100 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.1em] mb-2">Enterprise</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-slate-900 dark:text-white leading-none">Custom</span>
                </div>
                <p className="text-[12px] text-slate-400 dark:text-[#444]">For teams of all sizes</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {ENTERPRISE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    <Check size={13} className="text-violet-400/70 flex-shrink-0" />
                    <span className="text-[12.5px] text-slate-500 dark:text-[#888]">{f.text}</span>
                  </li>
                ))}
              </ul>

              {isEnterprise ? (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-violet-500/30 bg-violet-500/10 text-[12.5px] font-semibold text-violet-400">
                  ✓ Current plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConOpen(true)}
                  className="h-10 w-full flex items-center justify-center gap-2 rounded-[9px] border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-900 dark:text-white text-[13px] font-semibold transition-all"
                >
                  <Building2 size={13} />
                  Contact sales
                </button>
              )}
            </div>
          </div>

          {/* ── Feature highlights ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { icon: Infinity,  title: "Unlimited projects", sub: "No cap on workspaces or projects" },
              { icon: BarChart3, title: "Analytics",          sub: "Deep insights on your team's flow" },
              { icon: Activity,  title: "Activity feed",      sub: "Every change, tracked in real time" },
              { icon: Sparkles,  title: "AI task generator",  sub: "Generate tasks from a description"  },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[12px] border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] p-4 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all group"
              >
                <div className="w-8 h-8 rounded-[8px] bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center justify-center mb-3 group-hover:bg-indigo-500/[0.12] transition-colors">
                  <item.icon size={15} className="text-indigo-400" />
                </div>
                <p className="text-[12.5px] font-semibold text-slate-800 dark:text-[#ddd] mb-1">{item.title}</p>
                <p className="text-[11px] text-slate-400 dark:text-[#444] leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Trust bar ── */}
          <div className="rounded-[14px] border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[7px] bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-slate-500 dark:text-[#666]" />
                  </div>
                  <span className="text-[11.5px] text-slate-500 dark:text-[#555] leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-10 text-center">
            <p className="text-[12.5px] text-slate-400 dark:text-[#444]">
              Questions? Email us at{" "}
              <a href="mailto:hello@taskflow.app" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                hello@taskflow.app
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        planName="Pro"
        planPrice="$12/mo"
        userId={userId}
      />
      <ContactSalesModal
        open={conOpen}
        onClose={() => setConOpen(false)}
      />
    </div>
  )
}
