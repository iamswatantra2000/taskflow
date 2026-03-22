// app/(auth)/register/page.tsx
import { RegisterForm } from "../../../components/features/RegisterForm"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div className="text-center">
            <h1 className="text-[18px] font-semibold text-[#f0f0f0] tracking-tight">
              Create your account
            </h1>
            <p className="text-[13px] text-[#555] mt-1">
              Start managing your projects today
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-[12px] p-6">
          <RegisterForm />
        </div>

        {/* Sign in link */}
        <p className="text-center text-[12px] text-[#444]">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign in
          </a>
        </p>

      </div>
    </main>
  )
}