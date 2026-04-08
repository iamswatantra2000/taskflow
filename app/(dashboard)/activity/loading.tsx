export default function ActivityLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[var(--tf-border)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-panel)] shrink-0">
        <div className="h-4 w-24 rounded animate-shimmer" />
        <div className="h-7 w-7 rounded-full animate-shimmer" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 max-w-2xl">
        <div className="h-5 w-32 rounded animate-shimmer" />

        {[...Array(3)].map((_, group) => (
          <div key={group} className="space-y-3">
            <div className="h-3 w-20 rounded animate-shimmer" />
            {[...Array(group === 0 ? 4 : 3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full animate-shimmer shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-3 w-full rounded animate-shimmer" />
                  <div className="h-2.5 w-1/3 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
