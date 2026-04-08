export default function MyTasksLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[var(--tf-border)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-panel)] shrink-0">
        <div className="h-4 w-24 rounded animate-shimmer" />
        <div className="h-7 w-7 rounded-full animate-shimmer" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        <div className="h-5 w-36 rounded animate-shimmer" />

        {[...Array(3)].map((_, section) => (
          <div key={section} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-shimmer" />
              <div className="h-3.5 w-24 rounded animate-shimmer" />
              <div className="h-4 w-6 rounded-full animate-shimmer" />
            </div>
            {[...Array(section === 0 ? 3 : 2)].map((_, i) => (
              <div key={i} className="bg-[var(--tf-bg-card)] border border-slate-100 dark:border-[var(--tf-border)] rounded-[10px] px-4 py-3 flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-[var(--tf-border)] animate-shimmer shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded animate-shimmer" />
                  <div className="h-2.5 w-1/2 rounded animate-shimmer" />
                </div>
                <div className="h-5 w-14 rounded-full animate-shimmer" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
