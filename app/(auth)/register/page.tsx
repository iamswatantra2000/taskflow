// app/(auth)/register/page.tsx
import { SignUp } from "@clerk/nextjs"
import { LogoMark } from "@/components/ui/LogoMark"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <LogoMark height={36} />
        <div className="text-center">
          <h1 className="text-[18px] font-bold text-[#f0f0f0] font-bricolage">TaskFlow</h1>
          <p className="text-[13px] text-[#555] mt-1">Create your free account</p>
        </div>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorPrimary:        "#4f46e5",
            colorBackground:     "#111111",
            colorInputBackground:"#0d0d0d",
            colorInputText:      "#e0e0e0",
            colorText:           "#e0e0e0",
            colorTextSecondary:  "#888888",
            colorNeutral:        "#444444",
            borderRadius:        "0.5rem",
            fontFamily:          "var(--font-manrope), system-ui, sans-serif",
          },
          elements: {
            card:                     "shadow-2xl border border-[#1f1f1f]",
            socialButtonsBlockButton: "border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors",
            dividerLine:              "bg-[#2a2a2a]",
            dividerText:              "text-[#555]",
            footerActionLink:         "text-indigo-400 hover:text-indigo-300",
          },
        }}
      />

    </main>
  )
}
