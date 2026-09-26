"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { MaterialIcon } from "@/components/ui/material-icon"

import { cn } from "@/lib/utils"

const Checkbox = React.memo(React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // 14x14 square brass bevel; checked reveals a crimson block
      "v-checkbox peer disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <MaterialIcon name="check" size={16} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
