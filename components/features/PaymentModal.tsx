"use client"

import { useState } from "react"
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
  Lock, CheckCircle, Eye, EyeOff,
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
  { label: "GPay",     suffix: "oksbi"  },
  { label: "PhonePe",  suffix: "ybl"    },
  { label: "Paytm",    suffix: "paytm"  },
  { label: "BHIM",     suffix: "upi"    },
]

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

export function PaymentModal({ open, onClose, planName, planPrice }: PaymentModalProps) {
  const router = useRouter()

  const [tab,  setTab]  = useState<Tab>("card")
  const [step, setStep] = useState<Step>("form")

  // Card state
  const [cardNum,  setCardNum]  = useState("")
  const [expiry,   setExpiry]   = useState("")
  const [cvv,      setCvv]      = useState("")
  const [cardName, setCardName] = useState("")
  const [showCvv,  setShowCvv]  = useState(false)

  // UPI state
  const [upiId, setUpiId] = useState("")

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState("")

  function resetForm() {
    setTab("card")
    setStep("form")
    setCardNum("")
    setExpiry("")
    setCvv("")
    setCardName("")
    setUpiId("")
    setSelectedBank("")
    setShowCvv(false)
  }

  function handleClose() {
    if (step === "loading") return
    onClose()
    setTimeout(resetForm, 300)
  }

  function handlePay() {
    setStep("loading")
    setTimeout(() => setStep("success"), 2200)
  }

  const brand = getCardBrand(cardNum)

  const tabs = [
    { id: "card"        as Tab, label: "Card",        icon: CreditCard },
    { id: "upi"         as Tab, label: "UPI",          icon: Smartphone },
    { id: "netbanking"  as Tab, label: "Net Banking",  icon: Building2  },
  ]

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent
        className="max-w-[440px] p-0 gap-0 overflow-hidden"
        showCloseButton={step !== "loading"}
      >
        {step === "success" ? (
          /* ── Success ───────────────────────────────────────────────── */
          <div className="flex flex-col items-center gap-5 py-14 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/[0.12] border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="text-emerald-400" size={30} />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-[13px] text-[#666] leading-relaxed">
                Your <span className="text-white font-medium">{planName}</span> plan is now active.
                <br />Welcome to the pro experience.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { handleClose(); router.push("/register") }}
              className="mt-1 h-9 px-6 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-[9px] border border-emerald-700/80 shadow-[0_3px_0_0_#065f46] active:translate-y-[3px] active:shadow-none transition-all duration-150"
            >
              Get started →
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <DialogHeader>
                <DialogTitle>Complete your purchase</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-between mt-3.5">
                <div>
                  <p className="text-[13px] font-semibold text-white">{planName} Plan</p>
                  <p className="text-[11.5px] text-[#555] mt-0.5">{planPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10.5px] text-[#444] mb-0.5">Due today</p>
                  <p className="text-[20px] font-bold text-white">
                    {planPrice.split(" ")[0]}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-6 flex flex-col gap-5">
              {/* ── Tab switcher ───────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-1 bg-white/[0.03] border border-white/[0.06] rounded-[10px] p-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex items-center justify-center gap-1.5 h-[30px] rounded-[7px] text-[12px] font-medium transition-all duration-150 ${
                      tab === id
                        ? "bg-indigo-600 text-white"
                        : "text-[#555] hover:text-[#888]"
                    }`}
                  >
                    <Icon size={11} />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Card tab ───────────────────────────────────────────── */}
              {tab === "card" && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[11.5px] text-[#555] mb-1.5">
                      Card number
                    </label>
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
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                          }
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
                    <label className="block text-[11.5px] text-[#555] mb-1.5">
                      Name on card
                    </label>
                    <Input
                      placeholder="Full name as on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* ── UPI tab ────────────────────────────────────────────── */}
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
                          className="h-12 rounded-[9px] border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] text-[12px] font-medium text-[#555] hover:text-[#999] transition-all duration-150"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Net Banking tab ────────────────────────────────────── */}
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
                    <p className="text-[11.5px] text-[#444] mt-0.5">
                      You&apos;ll be redirected to{" "}
                      <span className="text-[#777]">{selectedBank}</span>&apos;s secure portal
                    </p>
                  )}
                </div>
              )}

              {/* ── Pay button ─────────────────────────────────────────── */}
              <button
                type="button"
                onClick={handlePay}
                disabled={step === "loading"}
                className="w-full h-10 flex items-center justify-center gap-2 text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-[9px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150"
              >
                {step === "loading" ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={12} />
                    {tab === "netbanking" && selectedBank
                      ? `Continue to ${selectedBank}`
                      : `Pay ${planPrice.split(" ")[0]}`}
                  </>
                )}
              </button>

              {/* ── Security note ──────────────────────────────────────── */}
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#2d2d2d]">
                <Lock size={10} className="flex-shrink-0" />
                256-bit SSL · PCI DSS Compliant · Encrypted payment
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
