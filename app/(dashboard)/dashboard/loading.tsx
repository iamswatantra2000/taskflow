export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[var(--tf-border)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-panel)] shrink-0">
        <div className="h-4 w-32 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* Greeting */}
        <div className="h-5 w-48 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[12px] p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
              <div className="h-2.5 w-28 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Board columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, col) => (
            <div key={col} className="bg-[var(--tf-bg-panel)] border border-slate-200 dark:border-white/[0.07] rounded-[10px] p-3 space-y-2.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
                </div>
                <div className="h-4 w-6 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded-full animate-pulse" />
              </div>
              {[...Array(col === 0 ? 3 : col === 1 ? 2 : 1)].map((_, i) => (
                <div key={i} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-white/[0.07] rounded-[10px] p-3.5 space-y-3">
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-16 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded-full animate-pulse" />
                    <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
