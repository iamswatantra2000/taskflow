"use client"
// Thin client wrapper so Clerk's appearance object can respond to next-themes.
import { SignIn, SignUp } from "@clerk/nextjs"
import { useTheme } from "next-themes"

const lightAppearance = {
  variables: {
    colorPrimary:        "#4f46e5",
    colorBackground:     "#ffffff",
    colorInputBackground:"#f8fafc",
    colorInputText:      "#0f172a",
    colorText:           "#0f172a",
    colorTextSecondary:  "#64748b",
    colorNeutral:        "#94a3b8",
    borderRadius:        "0.5rem",
    fontFamily:          "var(--font-manrope), system-ui, sans-serif",
  },
  elements: {
    card:                     "shadow-md border border-slate-200",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 transition-colors",
    dividerLine:              "bg-slate-200",
    dividerText:              "text-slate-400",
    footerActionLink:         "text-indigo-600 hover:text-indigo-500",
  },
}

const darkAppearance = {
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
}

type SignInProps = {
  mode: "signIn"
  forceRedirectUrl: string
}
type SignUpProps = {
  mode: "signUp"
  forceRedirectUrl: string
}

export function ClerkAuthCard(props: SignInProps | SignUpProps) {
  const { resolvedTheme } = useTheme()
  const appearance = resolvedTheme === "dark" ? darkAppearance : lightAppearance

  if (props.mode === "signUp") {
    return <SignUp forceRedirectUrl={props.forceRedirectUrl} appearance={appearance} />
  }
  return <SignIn forceRedirectUrl={props.forceRedirectUrl} appearance={appearance} />
}
