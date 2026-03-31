// app/layout.tsx
import type { Metadata } from "next"
import { Manrope, Inter_Tight } from "next/font/google"
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
        className={`${manrope.variable} ${interTight.variable}`}
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
