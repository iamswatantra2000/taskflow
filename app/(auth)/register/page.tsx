// app/(auth)/register/page.tsx
import { LogoMark } from "@/components/ui/LogoMark"
import { ClerkAuthCard } from "@/components/features/ClerkAuthCard"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams
  const redirectUrl = params.redirect_url ?? "/onboarding"

  return (
    <main className="min-h-screen bg-[var(--tf-bg-panel)] flex flex-col items-center justify-center p-4 gap-6">

      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <LogoMark height={36} />
        <div className="text-center">
          <h1 className="text-[var(--tf-text-primary)] font-bricolage" style={{ fontWeight: 900, fontSize: 18 }}>TaskFlow</h1>
          <p className="text-[13px] text-[var(--tf-text-tertiary)] mt-1">Create your free account</p>
        </div>
      </div>

      <ClerkAuthCard mode="signUp" forceRedirectUrl={redirectUrl} />

    </main>
  )
}
