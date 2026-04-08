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
          <span className="text-[var(--tf-text-tertiary)]">/</span>
          <span className="text-[13px] font-semibold text-foreground">Upgrade plan</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[960px] mx-auto px-4 py-10 sm:py-14">

          {/* ── Hero ── */}
          <div className="text-center mb-12">
            {/* Current plan badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] text-[11.5px] font-medium text-[var(--tf-text-secondary)] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Currently on
              <span className="text-[var(--tf-text-secondary)] capitalize font-semibold">{currentPlan} plan</span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[var(--tf-text-primary)] leading-tight mb-3">
              Unlock the full{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                TaskFlow
              </span>{" "}
              experience
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--tf-text-tertiary)] max-w-[480px] mx-auto leading-relaxed">
              Upgrade to Pro and get unlimited projects, AI-powered tasks, advanced analytics, and more — in one click.
            </p>
          </div>

          {/* ── Plan cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

            {/* Free */}
            <div className="relative rounded-[16px] border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-2">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-[var(--tf-text-primary)] leading-none">$0</span>
                  <span className="text-[13px] text-[var(--tf-text-tertiary)] mb-1.5">/ month</span>
                </div>
                <p className="text-[12px] text-[var(--tf-text-tertiary)]">Perfect to get started</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    {f.included ? (
                      <Check size={13} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Lock size={11} className="text-[var(--tf-text-tertiary)] flex-shrink-0 ml-[1px]" />
                    )}
                    <span className={`text-[12.5px] ${f.included ? "text-[var(--tf-text-secondary)]" : "text-[var(--tf-text-tertiary)]"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro ? (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-[var(--tf-border)] text-[12.5px] font-medium text-[var(--tf-text-tertiary)]">
                  Previous plan
                </div>
              ) : (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-[var(--tf-border)] text-[12.5px] font-semibold text-[var(--tf-text-tertiary)] bg-[var(--tf-bg-panel)]">
                  Current plan
                </div>
              )}
            </div>

            {/* Pro — highlighted */}
            <div className="relative rounded-[16px] border border-indigo-500/40 bg-indigo-500/[0.04] p-6 flex flex-col shadow-[0_0_40px_-8px_rgba(99,102,241,0.2)]">
              {/* Most popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 bg-[var(--tf-accent)] text-white text-[10.5px] font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-900/50">
                  <Sparkles size={9} />
                  Most popular
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[11px] font-semibold text-[var(--tf-accent-text)] uppercase tracking-[0.1em] mb-2">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-[var(--tf-text-primary)] leading-none">$12</span>
                  <span className="text-[13px] text-[var(--tf-text-tertiary)] mb-1.5">/ month</span>
                </div>
                <p className="text-[12px] text-[var(--tf-text-tertiary)]">Billed monthly · cancel anytime</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    <Check size={13} className={f.highlight ? "text-[var(--tf-accent-text)] flex-shrink-0" : "text-emerald-500/60 flex-shrink-0"} />
                    <span className={`text-[12.5px] ${f.highlight ? "text-[var(--tf-text-primary)] font-medium" : "text-[var(--tf-text-secondary)]"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isPro && !isEnterprise ? (
                <div className="h-10 flex items-center justify-center rounded-[9px] border border-indigo-500/30 bg-indigo-500/10 text-[12.5px] font-semibold text-[var(--tf-accent-text)]">
                  ✓ Current plan
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPayOpen(true)}
                  disabled={isEnterprise}
                  className="h-10 w-full flex items-center justify-center gap-2 rounded-[9px] bg-[var(--tf-accent)] hover:brightness-110 text-white text-[13px] font-semibold border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap size={13} />
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Enterprise */}
            <div className="relative rounded-[16px] border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] p-6 flex flex-col">
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.1em] mb-2">Enterprise</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-[36px] font-bold text-[var(--tf-text-primary)] leading-none">Custom</span>
                </div>
                <p className="text-[12px] text-[var(--tf-text-tertiary)]">For teams of all sizes</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {ENTERPRISE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5">
                    <Check size={13} className="text-violet-400/70 flex-shrink-0" />
                    <span className="text-[12.5px] text-[var(--tf-text-secondary)]">{f.text}</span>
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
                  className="h-10 w-full flex items-center justify-center gap-2 rounded-[9px] border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] hover:bg-[var(--tf-bg-hover)] text-[var(--tf-text-primary)] text-[13px] font-semibold transition-all"
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
                className="rounded-[12px] border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] p-4 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all group"
              >
                <div className="w-8 h-8 rounded-[8px] bg-[var(--tf-accent-muted)] border border-indigo-500/15 flex items-center justify-center mb-3 group-hover:bg-indigo-500/[0.12] transition-colors">
                  <item.icon size={15} className="text-[var(--tf-accent-text)]" />
                </div>
                <p className="text-[12.5px] font-semibold text-[var(--tf-text-primary)] mb-1">{item.title}</p>
                <p className="text-[11px] text-[var(--tf-text-tertiary)] leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Trust bar ── */}
          <div className="rounded-[14px] border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[7px] bg-[var(--tf-bg-hover)] border border-[var(--tf-border)] flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-[var(--tf-text-secondary)]" />
                  </div>
                  <span className="text-[11.5px] text-[var(--tf-text-tertiary)] leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-10 text-center">
            <p className="text-[12.5px] text-[var(--tf-text-tertiary)]">
              Questions? Email us at{" "}
              <a href="mailto:hello@taskflow.app" className="text-[var(--tf-accent-text)] hover:text-indigo-300 transition-colors font-medium">
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
