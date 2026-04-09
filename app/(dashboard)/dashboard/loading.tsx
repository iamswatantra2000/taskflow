export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="h-[50px] border-b border-[var(--tf-border-subtle)] flex items-center justify-between pl-14 pr-4 md:px-5 bg-[var(--tf-bg-panel)] shrink-0">
        <div className="h-4 w-32 rounded animate-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full animate-shimmer" style={{ animationDelay: "0.1s" }} />
          <div className="h-7 w-7 rounded-full animate-shimmer" style={{ animationDelay: "0.2s" }} />
          <div className="h-7 w-7 rounded-full animate-shimmer" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {/* Greeting */}
        <div className="h-5 w-48 rounded animate-shimmer" />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[12px] p-4 space-y-3">
              <div className="h-3 w-20 rounded animate-shimmer" style={{ animationDelay: `${i * 0.07}s` }} />
              <div className="h-8 w-12 rounded animate-shimmer" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
              <div className="h-2.5 w-28 rounded animate-shimmer" style={{ animationDelay: `${i * 0.07 + 0.2}s` }} />
            </div>
          ))}
        </div>

        {/* Board columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, col) => (
            <div key={col} className="bg-[var(--tf-bg-panel)] border border-[var(--tf-border)] rounded-[10px] p-3 space-y-2.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-shimmer" style={{ animationDelay: `${col * 0.08}s` }} />
                  <div className="h-3 w-16 rounded animate-shimmer" style={{ animationDelay: `${col * 0.08 + 0.05}s` }} />
                </div>
                <div className="h-4 w-6 rounded-full animate-shimmer" style={{ animationDelay: `${col * 0.08 + 0.1}s` }} />
              </div>
              {[...Array(col === 0 ? 3 : col === 1 ? 2 : 1)].map((_, i) => (
                <div key={i} className="bg-[var(--tf-bg-card)] border border-[var(--tf-border-subtle)] rounded-[10px] p-3.5 space-y-3">
                  <div className="h-3.5 w-full rounded animate-shimmer" style={{ animationDelay: `${(col * 0.08) + (i * 0.06)}s` }} />
                  <div className="h-3 w-3/4 rounded animate-shimmer" style={{ animationDelay: `${(col * 0.08) + (i * 0.06) + 0.1}s` }} />
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-16 rounded-full animate-shimmer" style={{ animationDelay: `${(col * 0.08) + (i * 0.06) + 0.2}s` }} />
                    <div className="h-5 w-5 rounded-full animate-shimmer" style={{ animationDelay: `${(col * 0.08) + (i * 0.06) + 0.25}s` }} />
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
