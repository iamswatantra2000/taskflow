"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Building2, CheckCircle, Users, Mail, ArrowRight } from "lucide-react"

interface ContactSalesModalProps {
  open: boolean
  onClose: () => void
}

const TEAM_TIERS = [
  { label: "1 – 10 people",    min: 1,   max: 10,  perUser: 10,  custom: false },
  { label: "11 – 50 people",   min: 11,  max: 50,  perUser: 8,   custom: false },
  { label: "51 – 200 people",  min: 51,  max: 200, perUser: 7,   custom: false },
  { label: "201 – 500 people", min: 201, max: 500, perUser: 6,   custom: false },
  { label: "500+ people",      min: 500, max: null, perUser: null, custom: true },
]

function getEstimate(tierLabel: string) {
  const tier = TEAM_TIERS.find((t) => t.label === tierLabel)
  if (!tier || tier.custom || !tier.perUser || !tier.max) return null
  return {
    min: tier.min * tier.perUser,
    max: tier.max * tier.perUser,
    perUser: tier.perUser,
    range: tier.label,
  }
}

const NEXT_STEPS = [
  { n: "1", text: "A sales rep reviews your enquiry" },
  { n: "2", text: "You'll receive a personalised demo invite" },
  { n: "3", text: "We'll build a custom plan for your team" },
]

export function ContactSalesModal({ open, onClose }: ContactSalesModalProps) {
  const [submitted, setSubmitted] = useState(false)

  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [company,  setCompany]  = useState("")
  const [teamSize, setTeamSize] = useState("")
  const [message,  setMessage]  = useState("")

  function resetForm() {
    setSubmitted(false)
    setName(""); setEmail(""); setCompany(""); setTeamSize(""); setMessage("")
  }

  function handleClose() {
    onClose()
    setTimeout(resetForm, 300)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent className="max-w-[500px] p-0 gap-0 overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
        {submitted ? (
          <div className="flex flex-col items-center gap-6 py-12 px-8 text-center">
            {/* Animated ring + check */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 flex items-center justify-center">
                <CheckCircle className="text-indigo-400" size={34} />
              </div>
              <div className="absolute inset-0 rounded-full border border-indigo-500/15 animate-ping" />
            </div>

            <div>
              <h3 className="text-[20px] font-semibold text-[var(--tf-text-primary)] mb-2">
                We&apos;ve received your message!
              </h3>
              <p className="text-[13px] text-[var(--tf-text-tertiary)] leading-relaxed max-w-[320px] mx-auto">
                Thanks, <span className="text-[var(--tf-text-primary)] font-medium">{name}</span>. Our sales team will reach out to{" "}
                <span className="text-indigo-400 font-medium">{email}</span> within 24 hours.
              </p>
            </div>

            {/* What happens next */}
            <div className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[var(--tf-border-subtle)] rounded-[14px] p-5 text-left">
              <p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-4">
                What happens next
              </p>
              <div className="space-y-4">
                {NEXT_STEPS.map(({ n, text }, i) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600/12 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-indigo-400">{n}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[12.5px] text-[var(--tf-text-secondary)]">{text}</p>
                      {i < NEXT_STEPS.length - 1 && (
                        <div className="ml-[-15px] mt-2 w-px h-3 bg-indigo-500/15" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation detail */}
            <div className="w-full flex items-center gap-3 p-3.5 rounded-[10px] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[var(--tf-border-subtle)]">
              <div className="w-8 h-8 rounded-[8px] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Mail size={13} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--tf-text-tertiary)]">Confirmation sent to</p>
                <p className="text-[12.5px] font-medium text-[var(--tf-text-primary)] truncate">{email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full h-10 flex items-center justify-center gap-2 text-[13px] font-semibold bg-[var(--tf-bg-card)] hover:bg-slate-50 dark:hover:bg-[var(--tf-bg-dropdown)] text-[var(--tf-text-secondary)] hover:text-slate-900 dark:hover:text-white rounded-[9px] border border-[var(--tf-border)] hover:border-slate-300 dark:hover:border-white/18 shadow-[0_3px_0_0_rgba(0,0,0,0.12)] dark:shadow-[0_3px_0_0_rgba(0,0,0,0.55)] active:translate-y-[3px] active:shadow-none transition-all duration-150"
            >
              Close
            </button>
          </div>
        ) : (

          /* ── FORM ─────────────────────────────────────────────────────── */
          <>
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-slate-100 dark:border-[var(--tf-border-subtle)] overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-indigo-500/[0.05] rounded-full blur-[60px] pointer-events-none" />

              <div className="relative">
                <div className="w-10 h-10 rounded-[11px] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Building2 size={16} className="text-indigo-400" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-[18px]">Talk to our sales team</DialogTitle>
                </DialogHeader>
                <p className="text-[12.5px] text-[var(--tf-text-tertiary)] mt-1.5 leading-relaxed">
                  Tell us about your team and we&apos;ll craft a custom Enterprise plan that fits perfectly.
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {["Custom pricing", "Dedicated support", "SSO & SAML", "SLA guarantee"].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium text-indigo-300/70 border border-indigo-500/15 bg-indigo-500/[0.05] rounded-full px-2.5 py-0.5"
                  >
                    <CheckCircle size={8} className="text-indigo-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-[var(--tf-text-tertiary)] mb-1.5">
                    Full name <span className="text-indigo-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Sarah Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] text-[var(--tf-text-tertiary)] mb-1.5">
                    Work email <span className="text-indigo-500">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="sarah@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-[var(--tf-text-tertiary)] mb-1.5">
                    Company <span className="text-indigo-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] text-[var(--tf-text-tertiary)] mb-1.5">
                    Team size <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="h-9 w-full appearance-none rounded-[9px] border border-[var(--tf-border)] bg-[var(--tf-bg-hover)] px-3 pr-8 text-[13px] text-foreground outline-none transition-all duration-150 focus-visible:border-indigo-500/60 focus-visible:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] [&>option]:bg-white dark:[&>option]:bg-[var(--tf-bg-card)]"
                    >
                      <option value="" disabled>Select…</option>
                      {TEAM_TIERS.map((t) => (
                        <option key={t.label} value={t.label}>{t.label}</option>
                      ))}
                    </select>
                    <Users size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tf-text-tertiary)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ── Amount estimate ── */}
              {teamSize && (() => {
                const est = getEstimate(teamSize)
                const isCustom = TEAM_TIERS.find((t) => t.label === teamSize)?.custom
                return (
                  <div className={`rounded-[10px] border p-4 transition-all duration-200 ${
                    isCustom
                      ? "border-violet-500/20 bg-violet-500/[0.05]"
                      : "border-indigo-500/20 bg-indigo-500/[0.05]"
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-wider mb-1">
                          Estimated monthly cost
                        </p>
                        {isCustom ? (
                          <p className="text-[18px] font-bold text-violet-300">Custom pricing</p>
                        ) : est ? (
                          <p className="text-[18px] font-bold text-[var(--tf-text-primary)]">
                            ${est.min.toLocaleString()}
                            <span className="text-[var(--tf-text-tertiary)] font-normal text-[13px]"> – </span>
                            ${est.max.toLocaleString()}
                            <span className="text-[var(--tf-text-tertiary)] font-normal text-[13px]"> / mo</span>
                          </p>
                        ) : null}
                        {!isCustom && est && (
                          <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-0.5">
                            ${est.perUser}/user · {est.range}
                          </p>
                        )}
                        {isCustom && (
                          <p className="text-[11px] text-[var(--tf-text-tertiary)] mt-0.5">
                            Our team will build a tailored quote for you
                          </p>
                        )}
                      </div>
                      {!isCustom && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-[var(--tf-text-tertiary)] mb-1">Per user / month</p>
                          <p className="text-[16px] font-bold text-indigo-400">
                            ${getEstimate(teamSize)?.perUser}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[var(--tf-text-tertiary)] mt-3 pt-3 border-t border-[var(--tf-border-subtle)]">
                      Final pricing confirmed by our sales team after the call
                    </p>
                  </div>
                )
              })()}

              <div>
                <label className="block text-[11.5px] text-[var(--tf-text-tertiary)] mb-1.5">
                  How can we help?
                </label>
                <textarea
                  placeholder="Tell us about your use case, current tools, or any specific requirements…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-[9px] border border-[var(--tf-border)] bg-[var(--tf-bg-hover)] px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-150 focus-visible:border-indigo-500/60 focus-visible:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[9px] border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150 mt-1"
              >
                Submit enquiry
                <ArrowRight size={14} />
              </button>

              <p className="text-center text-[11px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">
                We typically reply within 1 business day · No spam, ever
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
