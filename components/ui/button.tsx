"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Shared 3D press animation — push down + collapse shadow
const press3d = "active:translate-y-[3px] transition-all duration-100"

const buttonVariants = cva(
  `group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px] border text-[12.5px] font-medium whitespace-nowrap select-none cursor-pointer outline-none ${press3d} disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5`,
  {
    variants: {
      variant: {
        // ── Primary — indigo 3D ──────────────────────────────────
        default:
          "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700/80 shadow-[0_3px_0_0_#3730a3] active:shadow-none",
        // ── Outline — dark surface 3D ────────────────────────────
        outline:
          "bg-[#111] hover:bg-[#161616] text-[#999] hover:text-white border-white/10 hover:border-white/18 shadow-[0_3px_0_0_rgba(0,0,0,0.55)] active:shadow-none",
        // ── Secondary — muted 3D ─────────────────────────────────
        secondary:
          "bg-[#181818] hover:bg-[#1e1e1e] text-[#777] hover:text-[#aaa] border-white/8 shadow-[0_3px_0_0_rgba(0,0,0,0.55)] active:shadow-none",
        // ── Ghost — no depth, just hover fill ────────────────────
        ghost:
          "border-transparent bg-transparent hover:bg-white/[0.05] text-muted-foreground hover:text-foreground active:translate-y-0",
        // ── Destructive ──────────────────────────────────────────
        destructive:
          "bg-red-950/30 hover:bg-red-950/50 text-red-400 border-red-900/60 shadow-[0_3px_0_0_rgba(69,10,10,0.8)] active:shadow-none",
        // ── Link — inline text ───────────────────────────────────
        link:
          "border-none rounded-none text-indigo-400 hover:underline underline-offset-4 active:translate-y-0",
      },
      size: {
        default: "h-8 px-3.5",
        xs:      "h-6 px-2 text-[11px] rounded-[6px]",
        sm:      "h-7 px-3 text-[12px] rounded-[7px]",
        lg:      "h-9 px-5 text-[13px] rounded-[9px]",
        icon:    "size-8",
        "icon-xs":  "size-6 rounded-[6px]",
        "icon-sm":  "size-7 rounded-[7px]",
        "icon-lg":  "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
