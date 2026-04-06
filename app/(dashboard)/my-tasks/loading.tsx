export default function MyTasksLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-4 md:px-5 bg-white dark:bg-[#0d0d0d] shrink-0">
        <div className="h-4 w-24 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        <div className="h-5 w-36 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />

        {[...Array(3)].map((_, section) => (
          <div key={section} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-[#2a2a2a] animate-pulse" />
              <div className="h-3.5 w-24 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-4 w-6 bg-slate-100 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
            </div>
            {[...Array(section === 0 ? 3 : 2)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[10px] px-4 py-3 flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-[#2a2a2a] animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
                </div>
                <div className="h-5 w-14 bg-slate-100 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
