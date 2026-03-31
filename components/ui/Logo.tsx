// components/ui/Logo.tsx
// TaskFlow logo mark — a checkmark flowing into an arrow:
//   "complete tasks and keep moving forward"
// Gradient: indigo-500 → violet-600 (top-left → bottom-right)

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TaskFlow"
    >
      <defs>
        {/* Main gradient — indigo to violet, diagonal */}
        <linearGradient
          id="tf-bg"
          x1="0" y1="0"
          x2="32" y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Subtle top-glass highlight */}
        <linearGradient
          id="tf-hl"
          x1="0" y1="0"
          x2="0" y2="1"
        >
          <stop offset="0%"   stopColor="white" stopOpacity="0.14" />
          <stop offset="100%" stopColor="white" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="32" height="32" rx="7.5" fill="url(#tf-bg)" />

      {/* Glass highlight — top half shimmer */}
      <rect width="32" height="32" rx="7.5" fill="url(#tf-hl)" />

      {/* ✓→  Check flowing into arrow shaft */}
      <path
        d="M 6.5 16.5 L 12 22.5 L 19 13 H 25.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arrowhead */}
      <path
        d="M 22.5 10 L 25.5 13 L 22.5 16"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
