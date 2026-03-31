// components/ui/LogoMark.tsx
// Renders the Vector 1 SVG as the TaskFlow logo mark with indigo→violet gradient

type Props = {
  height?: number
  className?: string
}

export function LogoMark({ height = 24, className }: Props) {
  const width = Math.round(height * (820 / 445))

  // viewBox expanded to cover full path extent (path goes to x≈-80, x≈730)
  return (
    <svg
      width={width}
      height={height}
      viewBox="-80 -10 820 445"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="tf-logo-grad" x1="-80" y1="-10" x2="740" y2="435" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M473.165 5.78066C215.665 38.7807 254.165 127.781 87.6648 116.281C-78.8355 104.781 33.6646 118.781 93.6648 127.781C153.665 136.781 274.665 104.781 274.665 104.781C274.665 104.781 246.165 189.281 296.665 244.781C347.165 300.281 230.241 404.055 296.665 419.281C311.891 422.771 321.426 422.714 336.665 419.281C403.265 404.276 289.964 289.847 347.165 244.781C398.602 204.256 393.665 289.781 482.165 266.281C570.665 242.781 624.665 91.7807 482.165 136.781C339.665 181.78 357.896 271.598 317.665 213.281C294.491 179.689 300.719 148.473 317.665 108.781C346.164 42.0287 394.165 127.781 482.165 116.281C570.165 104.781 730.665 -27.2194 473.165 5.78066Z"
        fill="url(#tf-logo-grad)"
      />
    </svg>
  )
}
