function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        <span className="text-xs font-medium text-indigo-700">Now in beta</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-md text-center">

        {/* Logo mark */}
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500">
          <span className="text-xl font-bold text-white">T</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          TaskFlow
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Your workspace. Your way.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">
            Get started for free
          </button>
          <button type="button" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Sign in
          </button>
        </div>

      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-400">
        No credit card required
      </p>

    </main>
  );
}

export default HomePage