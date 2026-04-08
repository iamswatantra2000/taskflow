export default function AnalyticsLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[var(--tf-border)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-panel)] shrink-0">
        <div className="h-4 w-24 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[var(--tf-bg-hover)] animate-pulse" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        <div className="h-5 w-28 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[12px] p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[12px] p-5 space-y-4">
              <div className="h-4 w-32 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
              <div className="h-[200px] w-full bg-[var(--tf-bg-panel)] rounded-[8px] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[12px] p-5 space-y-4">
          <div className="h-4 w-32 bg-slate-100 dark:bg-[var(--tf-bg-hover)] rounded animate-pulse" />
          <div className="h-[200px] w-full bg-[var(--tf-bg-panel)] rounded-[8px] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
