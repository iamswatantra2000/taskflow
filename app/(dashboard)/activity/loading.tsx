export default function ActivityLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-4 md:px-5 bg-white dark:bg-[#0d0d0d] shrink-0">
        <div className="h-4 w-24 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 max-w-2xl">
        <div className="h-5 w-32 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />

        {[...Array(3)].map((_, group) => (
          <div key={group} className="space-y-3">
            <div className="h-3 w-20 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
            {[...Array(group === 0 ? 4 : 3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1a1a1a] animate-pulse shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="h-3 w-full bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
                  <div className="h-2.5 w-1/3 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
