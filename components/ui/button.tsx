"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9px] border border-transparent bg-clip-padding text-[13px] font-medium whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/85 hover:shadow-primary/30",
        outline:
          "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-white/[0.05]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/18 dark:bg-destructive/15 dark:hover:bg-destructive/25",
        link:
          "text-primary underline-offset-4 hover:underline rounded-none border-none",
      },
      size: {
        default: "h-9 px-3.5",
        xs:      "h-6 px-2 text-[11px] rounded-[7px]",
        sm:      "h-8 px-3 text-[12px] rounded-[8px]",
        lg:      "h-10 px-5 text-[14px]",
        icon:    "size-9",
        "icon-xs": "size-6 rounded-[7px]",
        "icon-sm": "size-8 rounded-[8px]",
        "icon-lg": "size-10",
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
