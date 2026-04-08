// app/layout.tsx
import type { Metadata } from "next"
import { Inter_Tight, Raleway, Bricolage_Grotesque, Lora, Inter } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import { ThemeStyleProvider } from "@/context/ThemeStyleContext"
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

// Primary — UI, body, labels, inputs, buttons
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

// Secondary — headings, page titles, section headers
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["500", "600", "700", "800"],
})

// Logo only
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["600", "700", "800"],
})

// Landing page buttons
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

// Parchment theme — editorial serif headings
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
        className={`${interTight.variable} ${raleway.variable} ${bricolage.variable} ${lora.variable} ${inter.variable} ${GeistSans.variable}`}
      >
        <body className={interTight.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <ThemeStyleProvider>
            {children}
            <Toaster
              position="top-center"
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
            </ThemeStyleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
