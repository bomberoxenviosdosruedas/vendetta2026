import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Square metric tags — the brief keeps pills at 0px, never a soft radius.
const badgeVariants = cva(
  "v-badge transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a02020]",
  {
    variants: {
      variant: {
        default: "v-badge--gold",
        secondary: "",
        destructive: "v-badge--crimson",
        outline: "v-badge--brass",
        live: "v-badge--live",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.memo(({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants }
