import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.memo(React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Recessed parchment well — ink on paper, crimson focus rim
          "v-input h-8 text-[13px] file:border-0 file:bg-transparent file:text-[12px] file:font-bold file:text-foreground placeholder:text-[#8a8069] disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
))
Input.displayName = "Input"

export { Input }
