"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { AnimateOnView } from "@/components/ui/AnimateOnView"

const plans = [
  {
    name:        "Free",
    price:       "$0",
    period:      "forever",
    description: "Perfect for individuals and small teams getting started.",
    features:    ["Up to 3 projects", "Unlimited tasks", "Kanban board", "Basic filters & search", "1 workspace"],
    cta:         "Get started free",
    popular:     false,
    proOnly:     false,
  },
  {
    name:        "Pro",
    price:       "$12",
    period:      "per user / month",
    description: "For growing teams that need more power and collaboration.",
    features:    ["Unlimited projects", "Unlimited tasks", "Advanced filters", "Team workspaces", "Priority support", "Activity feed", "Analytics"],
    cta:         "Start free trial",
    popular:     true,
    proOnly:     true,
  },
  {
    name:        "Enterprise",
    price:       "Custom",
    period:      "contact us",
    description: "For large orgs with advanced security and compliance needs.",
    features:    ["Everything in Pro", "SSO / SAML", "Audit logs", "SLA guarantee", "Dedicated support", "Custom integrations"],
    cta:         "Contact sales",
    popular:     false,
    proOnly:     true,
  },
]

export function PricingSection({ userId }: { userId: string | null }) {
  // Logged-in users go straight to the dedicated upgrade page; guests go to register
  const upgradeHref = userId ? "/upgrade" : "/register"

  return (
    <section id="pricing" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-[var(--tf-border-subtle)]">
      <div className="max-w-5xl mx-auto">

        <AnimateOnView className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-[var(--tf-border)] bg-[var(--tf-bg-panel)] rounded-full px-4 py-1.5 mb-5">
            <span className="text-[11.5px] font-medium text-[var(--tf-text-tertiary)]">Pricing</span>
          </div>
          <h2 className="text-[28px] sm:text-[44px] font-bold text-[var(--tf-text-primary)] mb-3 sm:mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[var(--tf-text-tertiary)] max-w-[420px] mx-auto leading-relaxed">
            Start free. Upgrade when your team grows. No hidden fees, ever.
          </p>
        </AnimateOnView>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
          {plans.map((plan, index) => (
            <AnimateOnView key={plan.name} delay={index * 80}>
              <div
                className={`relative rounded-[16px] p-5 sm:p-6 border flex flex-col gap-5 ${
                  plan.popular
                    ? "border-indigo-500/35 bg-indigo-950/[0.12] ring-1 ring-indigo-500/15"
                    : "border-[var(--tf-border-subtle)] bg-[var(--tf-bg-card)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10.5px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap tracking-wide">
                    Most popular
                  </div>
                )}

                <div>
                  <p className="text-[12px] font-medium text-[var(--tf-text-tertiary)] mb-2.5">{plan.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-[38px] font-bold text-[var(--tf-text-primary)]">{plan.price}</span>
                    <span className="text-[11px] text-[var(--tf-text-tertiary)]">{plan.period}</span>
                  </div>
                  <p className="text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed">{plan.description}</p>
                </div>

                <Link
                  href={plan.proOnly ? upgradeHref : "/register"}
                  className={`w-full h-8 flex items-center justify-center text-[12.5px] font-semibold rounded-[8px] border transition-all duration-150 active:translate-y-[3px] active:shadow-none whitespace-nowrap ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700/80 shadow-[0_3px_0_0_#3730a3]"
                      : "bg-[var(--tf-bg-card)] hover:bg-[var(--tf-bg-hover)] text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] border-[var(--tf-border)] hover:border-[var(--tf-border)] shadow-[0_3px_0_0_rgba(0,0,0,0.12)]"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "bg-indigo-500/15" : "bg-[var(--tf-bg-hover)]"
                        }`}
                      >
                        <Check size={10} className={plan.popular ? "text-indigo-400" : "text-[var(--tf-text-tertiary)]"} />
                      </div>
                      <span className="text-[12.5px] text-[var(--tf-text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnView>
          ))}
        </div>

      </div>
    </section>
  )
}
