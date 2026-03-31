"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  CreditCard, Smartphone, Building2,
  Lock, CheckCircle, Eye, EyeOff, ShieldCheck,
} from "lucide-react"

type Tab  = "card" | "upi" | "netbanking"
type Step = "form" | "loading" | "success"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  planName: string
  planPrice: string
}

const BANKS = [
  "SBI", "HDFC", "ICICI", "Axis", "Kotak",
  "PNB", "Yes Bank", "Bank of Baroda", "Canara", "IndusInd",
]

const UPI_APPS = [
  { label: "GPay",    suffix: "oksbi"  },
  { label: "PhonePe", suffix: "ybl"    },
  { label: "Paytm",   suffix: "paytm"  },
  { label: "BHIM",    suffix: "upi"    },
]

const LOADING_MSGS: Record<Tab, string[]> = {
  card:       ["Verifying card details…", "Authorising payment…",     "Confirming transaction…"],
  upi:        ["Verifying UPI ID…",       "Sending payment request…", "Awaiting confirmation…" ],
  netbanking: ["Connecting to bank…",     "Authenticating…",          "Confirming payment…"    ],
}

function formatCardNumber(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(.{4})(?=.)/g, "$1 ")
}

function formatExpiry(val: string) {
  const raw = val.replace(/\D/g, "").slice(0, 4)
  return raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
}

function getCardBrand(num: string): string | null {
  const d = num.replace(/\s/g, "")
  if (d.startsWith("4")) return "VISA"
  if (d.startsWith("5") || d.startsWith("2")) return "Mastercard"
  if (d.startsWith("6")) return "RuPay"
  if (d.startsWith("3")) return "Amex"
  return null
}

// ── Live card preview ────────────────────────────────────────────────────────
function CardPreview({
  cardNum, cardName, expiry, brand, flipped,
}: {
  cardNum: string; cardName: string; expiry: string
  brand: string | null; flipped: boolean
}) {
  const groups = cardNum
    ? cardNum.split(" ").map((g, i) => (i < 3 ? (g ? "••••" : "••••") : g || "••••"))
    : ["••••", "••••", "••••", "••••"]

  return (
    <div className="relative h-[148px]" style={{ perspective: "900px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-900" />
          {/* Texture circles */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/[0.04]" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/[0.04]" />

          <div className="relative h-full p-5 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              {/* Chip */}
              <div className="w-8 h-6 rounded-[4px] bg-gradient-to-br from-amber-300 to-amber-400 border border-amber-200/60 flex items-center justify-center">
                <div className="w-5 h-4 rounded-sm border border-amber-500/40 grid grid-cols-2 gap-px p-px">
                  {[...Array(4)].map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: card chip
                    <div key={i} className="bg-amber-500/30 rounded-[1px]" />
                  ))}
                </div>
              </div>
              {brand && (
                <span className="text-[13px] font-bold text-white/80 tracking-wider">{brand}</span>
              )}
            </div>

            {/* Card number */}
            <div className="flex gap-3">
              {groups.map((g, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: card groups
                <span key={i} className="text-[13px] font-mono tracking-[0.22em] text-white/90">
                  {g}
                </span>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8.5px] text-white/40 uppercase tracking-wider mb-0.5">Card holder</p>
                <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider truncate max-w-[160px]">
                  {cardName || "Full Name"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8.5px] text-white/40 uppercase tracking-wider mb-0.5">Expires</p>
                <p className="text-[11px] font-medium text-white/80 font-mono">
                  {expiry || "MM/YY"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c3a] via-[#1a1a2e] to-[#0f0f23]" />
          {/* Magnetic stripe */}
          <div className="absolute top-7 inset-x-0 h-9 bg-black/90" />
          {/* CVV strip */}
          <div className="absolute top-[72px] right-5 left-12">
            <div className="h-7 bg-[#f5f0e8] rounded-[3px] flex items-center justify-end pr-3">
              <span className="text-[12px] font-mono text-[#222] tracking-[0.3em]">
                •••
              </span>
            </div>
            <p className="text-[8.5px] text-white/30 text-right mt-1 uppercase tracking-wider">CVV</p>
          </div>
          {brand && (
            <p className="absolute bottom-4 right-5 text-[12px] font-bold text-white/40 tracking-wider">
              {brand}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function PaymentModal({ open, onClose, planName, planPrice }: PaymentModalProps) {
  const router = useRouter()
  const txnId = useMemo(() => `TF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, [])

  const [tab,         setTab]         = useState<Tab>("card")
  const [step,        setStep]        = useState<Step>("form")
  const [loadingStep, setLoadingStep] = useState(0)

  // Card state
  const [cardNum,    setCardNum]    = useState("")
  const [expiry,     setExpiry]     = useState("")
  const [cvv,        setCvv]        = useState("")
  const [cardName,   setCardName]   = useState("")
  const [showCvv,    setShowCvv]    = useState(false)
  const [cvvFocused, setCvvFocused] = useState(false)
  const [saveCard,   setSaveCard]   = useState(false)

  // UPI state
  const [upiId, setUpiId] = useState("")

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState("")

  function resetForm() {
    setTab("card"); setStep("form"); setLoadingStep(0)
    setCardNum(""); setExpiry(""); setCvv(""); setCardName("")
    setShowCvv(false); setCvvFocused(false); setSaveCard(false)
    setUpiId(""); setSelectedBank("")
  }

  function handleClose() {
    if (step === "loading") return
    onClose()
    setTimeout(resetForm, 300)
  }

  function handlePay() {
    setStep("loading")
    setLoadingStep(0)
    setTimeout(() => setLoadingStep(1), 900)
    setTimeout(() => setLoadingStep(2), 1800)
    setTimeout(() => setStep("success"), 2700)
  }

  const brand = getCardBrand(cardNum)
  const price = planPrice.split(" ")[0]

  const tabs = [
    { id: "card"       as Tab, label: "Card",        icon: CreditCard },
    { id: "upi"        as Tab, label: "UPI",          icon: Smartphone },
    { id: "netbanking" as Tab, label: "Net Banking",  icon: Building2  },
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent
        className="max-w-[460px] p-0 gap-0 overflow-hidden max-h-[92vh] overflow-y-auto"
        showCloseButton={step !== "loading"}
      >

        {/* ── SUCCESS ───────────────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-5 py-12 px-8 text-center">
            {/* Animated ring + check */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/[0.1] border border-emerald-500/25 flex items-center justify-center">
                <CheckCircle className="text-emerald-400" size={34} />
              </div>
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
            </div>

            <div>
              <h3 className="text-[20px] font-semibold text-white mb-2">Payment Successful!</h3>
              <p className="text-[13px] text-[#555] leading-relaxed">
                Your <span className="text-white font-medium">{planName}</span> plan is now active.
              </p>
            </div>

            {/* Receipt */}
            <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-4 text-left space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#444]">Order</span>
                <span className="text-[#666] font-mono">{txnId}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#444]">{planName} Plan</span>
                <span className="text-white">{price}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 flex justify-between text-[12.5px] font-semibold">
                <span className="text-[#555]">Total charged</span>
                <span className="text-emerald-400">{price}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { handleClose(); router.push("/register") }}
              className="w-full h-10 flex items-center justify-center gap-2 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-[9px] border border-emerald-700/80 shadow-[0_3px_0_0_#065f46] active:translate-y-[3px] active:shadow-none transition-all duration-150"
            >
              Get started →
            </button>
          </div>
        )}

        {/* ── LOADING ───────────────────────────────────────────────────────── */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6 py-16 px-8 text-center">
            {/* Spinning ring */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-indigo-600/10 flex items-center justify-center">
                <Lock size={14} className="text-indigo-400" />
              </div>
            </div>

            <div>
              <p className="text-[14px] font-medium text-white mb-1">
                {LOADING_MSGS[tab][loadingStep]}
              </p>
              <p className="text-[12px] text-[#444]">Please don&apos;t close this window</p>
            </div>

            {/* Step dots */}
            <div className="flex gap-2">
              {LOADING_MSGS[tab].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: loading dots
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= loadingStep ? "w-6 bg-indigo-500" : "w-1.5 bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── FORM ──────────────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  Secure checkout
                </DialogTitle>
              </DialogHeader>
              {/* Order summary */}
              <div className="flex items-center justify-between mt-4 p-3 rounded-[10px] bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <p className="text-[12.5px] font-semibold text-white">{planName} Plan</p>
                  <p className="text-[11px] text-[#555] mt-0.5">{planPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#444] mb-0.5">Due today</p>
                  <p className="text-[22px] font-bold text-white">{price}</p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 flex flex-col gap-5">
              {/* Tab switcher */}
              <div className="grid grid-cols-3 gap-1 bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex items-center justify-center gap-1.5 h-[30px] rounded-[7px] text-[12px] font-medium transition-all duration-200 ${
                      tab === id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-[#555] hover:text-[#888]"
                    }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Card tab ── */}
              {tab === "card" && (
                <div className="flex flex-col gap-4">
                  <CardPreview
                    cardNum={cardNum}
                    cardName={cardName}
                    expiry={expiry}
                    brand={brand}
                    flipped={cvvFocused}
                  />

                  <div>
                    <label className="block text-[11.5px] text-[#555] mb-1.5">Card number</label>
                    <div className="relative">
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
                        className="pr-16 font-mono tracking-widest"
                      />
                      {brand && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#555] tracking-wide">
                          {brand}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11.5px] text-[#555] mb-1.5">Expiry</label>
                      <Input
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="font-mono tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] text-[#555] mb-1.5">CVV</label>
                      <div className="relative">
                        <Input
                          type={showCvv ? "text" : "password"}
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          onFocus={() => setCvvFocused(true)}
                          onBlur={() => setCvvFocused(false)}
                          className="pr-9 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#777] transition-colors"
                        >
                          {showCvv ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11.5px] text-[#555] mb-1.5">Name on card</label>
                    <Input
                      placeholder="Full name as on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  {/* Save card toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setSaveCard(!saveCard)}
                      className={`w-8 h-4 rounded-full border transition-all duration-200 flex items-center px-0.5 ${
                        saveCard
                          ? "bg-indigo-600 border-indigo-700"
                          : "bg-white/[0.05] border-white/10"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                          saveCard ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span className="text-[12px] text-[#555]">Save card for future payments</span>
                  </label>
                </div>
              )}

              {/* ── UPI tab ── */}
              {tab === "upi" && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[11.5px] text-[#555] mb-1.5">UPI ID</label>
                    <Input
                      placeholder="yourname@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-[11px] text-[#3a3a3a] mt-1.5">
                      Enter your UPI ID linked to any bank account
                    </p>
                  </div>

                  <div>
                    <p className="text-[11.5px] text-[#555] mb-2.5">Or pay with</p>
                    <div className="grid grid-cols-4 gap-2">
                      {UPI_APPS.map(({ label, suffix }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setUpiId(`yourname@${suffix}`)}
                          className={`h-12 rounded-[9px] border text-[12px] font-medium transition-all duration-150 ${
                            upiId === `yourname@${suffix}`
                              ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                              : "border-white/[0.07] bg-white/[0.02] text-[#555] hover:border-white/[0.14] hover:text-[#888]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {upiId && (
                    <div className="flex items-center gap-2 p-3 rounded-[9px] bg-emerald-500/[0.06] border border-emerald-500/15">
                      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                      <p className="text-[12px] text-emerald-400">
                        Payment request will be sent to <span className="font-medium">{upiId}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Net Banking tab ── */}
              {tab === "netbanking" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[11.5px] text-[#555]">Select your bank</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BANKS.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`h-[38px] px-2 rounded-[8px] border text-[11.5px] font-medium transition-all duration-150 truncate ${
                          selectedBank === bank
                            ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                            : "border-white/[0.07] bg-white/[0.02] text-[#555] hover:border-white/[0.14] hover:text-[#888]"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                  {selectedBank && (
                    <div className="flex items-center gap-2 p-3 rounded-[9px] bg-blue-500/[0.06] border border-blue-500/15 mt-1">
                      <Lock size={11} className="text-blue-400 flex-shrink-0" />
                      <p className="text-[12px] text-blue-300">
                        You&apos;ll be securely redirected to{" "}
                        <span className="font-medium">{selectedBank}</span>&apos;s portal
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pay button */}
              <button
                type="button"
                onClick={handlePay}
                className="w-full h-11 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-[9px] border border-indigo-700/80 shadow-[0_4px_0_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all duration-150"
              >
                <Lock size={13} />
                {tab === "netbanking" && selectedBank
                  ? `Continue to ${selectedBank}`
                  : `Pay ${price} securely`}
              </button>

              {/* Security row */}
              <div className="flex items-center justify-center gap-4 text-[10.5px] text-[#2d2d2d]">
                <span className="flex items-center gap-1"><Lock size={9} /> 256-bit SSL</span>
                <span className="w-px h-3 bg-white/[0.08]" />
                <span className="flex items-center gap-1"><ShieldCheck size={9} /> PCI DSS</span>
                <span className="w-px h-3 bg-white/[0.08]" />
                <span>Encrypted</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
