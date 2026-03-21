import LoginForm from "@/app/components/features/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>
        <LoginForm />   {/* ← only this tiny piece is a client component */}
      </div>
    </main>
  )
}