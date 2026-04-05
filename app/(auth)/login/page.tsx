// app/(auth)/login/page.tsx
import { LogoMark } from "@/components/ui/LogoMark"
import { ClerkAuthCard } from "@/components/features/ClerkAuthCard"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectUrl = params.redirect_url ?? "/dashboard"

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4 gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <LogoMark height={36} />
        <div className="text-center">
          <h1 className="text-slate-900 dark:text-[#f0f0f0] font-bricolage" style={{ fontWeight: 900, fontSize: 18 }}>TaskFlow</h1>
          <p className="text-[13px] text-slate-500 dark:text-[#555] mt-1">Sign in to your workspace</p>
        </div>
      </div>

      <ClerkAuthCard mode="signIn" forceRedirectUrl={redirectUrl} />

    </main>
  )
}
