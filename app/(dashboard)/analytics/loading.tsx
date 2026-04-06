export default function AnalyticsLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-slate-100 dark:border-[#1a1a1a] flex items-center justify-between pl-14 pr-4 md:px-5 bg-white dark:bg-[#0d0d0d] shrink-0">
        <div className="h-4 w-24 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        <div className="h-5 w-28 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-4 space-y-3">
              <div className="h-3 w-20 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5 space-y-4">
              <div className="h-4 w-32 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-[200px] w-full bg-slate-50 dark:bg-[#0f0f0f] rounded-[8px] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-100 dark:border-[#1f1f1f] rounded-[12px] p-5 space-y-4">
          <div className="h-4 w-32 bg-slate-100 dark:bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-[200px] w-full bg-slate-50 dark:bg-[#0f0f0f] rounded-[8px] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
