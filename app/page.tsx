// app/page.tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { OnboardingTour } from "@/components/features/OnboardingTour"
import { PricingSection } from "@/components/features/PricingSection"
import { NavLinks } from "@/components/ui/NavLinks"
import { LogoMark } from "@/components/ui/LogoMark"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { LandingHero } from "@/components/landing/LandingHero"
import { LandingMarquee } from "@/components/landing/LandingMarquee"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks"
import { LandingTestimonials } from "@/components/landing/LandingTestimonials"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { getSession } from "@/lib/session"

// ——— Navbar ———
async function Navbar() {
  const session = await getSession()
  const isLoggedIn = !!session?.user

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200/80 dark:border-[var(--tf-border-subtle)] bg-white/90 dark:bg-[var(--tf-bg-panel)]/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-full flex items-center justify-between">

        <div className="flex items-center gap-2">
          <LogoMark height={22} />
          <span className="text-[var(--tf-text-primary)] font-bricolage" style={{ fontWeight: 900, fontSize: 14 }}>TaskFlow</span>
        </div>

        <NavLinks />

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <span className="hidden sm:block text-[12.5px] text-slate-500 dark:text-[var(--tf-text-tertiary)]">
                Hey, {session.user.name?.split(" ")[0] ?? "there"} 👋
              </span>
              <Link
                href="/dashboard"
                className="font-inter-landing h-8 px-4 text-[12.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
              >
                Dashboard
                <ArrowRight size={12} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-inter-landing hidden sm:block text-[12.5px] text-slate-500 hover:text-slate-900 dark:text-[var(--tf-text-tertiary)] dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="font-inter-landing h-8 px-4 text-[12.5px] font-semibold bg-[var(--tf-accent)] hover:brightness-110 text-white rounded-[8px] border border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:translate-y-[3px] active:shadow-none transition-all duration-150 flex items-center whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// ——— Footer ———
function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal",   links: ["Privacy", "Terms", "Cookies"] },
  ]

  return (
    <footer className="border-t border-[var(--tf-border-subtle)] py-10 sm:py-12 px-5 sm:px-6 bg-[var(--tf-bg-panel)]">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 sm:mb-12">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoMark height={20} />
              <span className="text-[var(--tf-text-primary)] font-bricolage" style={{ fontWeight: 900, fontSize: 14 }}>TaskFlow</span>
            </div>
            <p className="font-geist text-[12.5px] text-[var(--tf-text-tertiary)] leading-relaxed max-w-[190px]">
              The project management tool built for teams that care about speed.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="font-geist text-[10.5px] font-semibold text-[var(--tf-text-tertiary)] uppercase tracking-[0.1em] mb-3">
                {col.title}
              </p>
              {col.links.map((link) => (
                <a
                  key={link}
                  // biome-ignore lint/a11y/useValidAnchor: placeholder
                  href="#"
                  className="font-geist block text-[12.5px] text-[var(--tf-text-tertiary)] hover:text-slate-900 dark:hover:text-[#777] transition-colors mb-2"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--tf-border-subtle)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-geist text-[11.5px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">© 2025 TaskFlow. All rights reserved.</p>
          <p className="font-geist text-[11.5px] text-slate-400 dark:text-[var(--tf-text-tertiary)]">Built with Next.js · Drizzle · shadcn/ui</p>
        </div>

      </div>
    </footer>
  )
}

// ——— Main page ———
export default async function LandingPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-[var(--tf-bg-panel)] text-[var(--tf-text-primary)]">
      <OnboardingTour />
      <Navbar />
      <main className="pt-14">
        <LandingHero />
        <LandingMarquee />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <PricingSection userId={session?.user?.id ?? null} />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  )
}
