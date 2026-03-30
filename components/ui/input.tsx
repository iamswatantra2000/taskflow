import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[9px] border border-border bg-transparent px-3 py-1.5 text-[13px] text-foreground transition-[border-color,box-shadow] duration-150 outline-none",
        "placeholder:text-muted-foreground/50",
        "focus-visible:border-ring/60 focus-visible:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)]",
        "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
        "aria-invalid:border-destructive/70 aria-invalid:shadow-[0_0_0_3px_hsl(var(--destructive)/0.12)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "dark:bg-white/[0.03] dark:border-white/10 dark:focus-visible:border-indigo-500/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
