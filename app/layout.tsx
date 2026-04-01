// app/layout.tsx
import type { Metadata } from "next"
import { Manrope, Inter_Tight, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "The workspace where great teams ship.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${manrope.variable} ${interTight.variable} ${bricolage.variable}`}
      >
        <body className={manrope.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              gap={10}
              closeButton
              toastOptions={{ duration: 4500 }}
              icons={{
                success: (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle2 size={15} style={{ color: "#34d399" }} />
                  </div>
                ),
                error: (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <XCircle size={15} style={{ color: "#f87171" }} />
                  </div>
                ),
                warning: (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertTriangle size={15} style={{ color: "#fbbf24" }} />
                  </div>
                ),
                info: (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Info size={15} style={{ color: "#818cf8" }} />
                  </div>
                ),
                loading: (
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Loader2 size={15} style={{ color: "#818cf8", animation: "tf-spin 1s linear infinite" }} />
                  </div>
                ),
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
