// app/layout.tsx
import type { Metadata } from "next"
import { Manrope, Inter_Tight, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"

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
              theme="system"
              position="top-center"
              richColors
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
