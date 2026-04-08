"use client"

const COMPANIES = [
  "Vercel", "Stripe", "Linear", "Figma", "Notion",
  "Loom", "Raycast", "Supabase", "PlanetScale", "Resend",
  "Clerk", "Tailwind Labs", "Turborepo", "tRPC", "Prisma",
]

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden">
      <div className={`flex items-center gap-0 w-max ${reverse ? "animate-marquee-right" : "animate-marquee-left"}`}>
        {doubled.map((name, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marquee duplicate
          <span
            key={i}
            className="font-geist inline-flex items-center gap-2 px-5 py-2 text-[12.5px] font-medium text-[var(--tf-text-tertiary)] whitespace-nowrap select-none"
          >
            <span className="w-1 h-1 rounded-full bg-[var(--tf-text-tertiary)]/30 flex-shrink-0" />
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function LandingMarquee() {
  return (
    <div className="border-t border-b border-[var(--tf-border-subtle)] py-5 overflow-hidden">
      <p className="font-geist text-center text-[11px] font-medium text-[var(--tf-text-tertiary)] uppercase tracking-[0.12em] mb-4 px-5">
        Trusted by teams at
      </p>
      <MarqueeRow items={COMPANIES} />
    </div>
  )
}
