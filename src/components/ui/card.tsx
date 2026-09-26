import * as React from "react"

import { cn } from "@/lib/utils"

// L1 raised wooden chassis. Padding follows the 4/6/12 density grid —
// the stock shadcn p-6 wasted 24px on every edge.
const Card = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("v-panel text-card-foreground", className)}
    {...props}
  />
)))
Card.displayName = "Card"

const CardHeader = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-1 px-3 pt-2.5 pb-2",
      className
    )}
    {...props}
  />
)))
CardHeader.displayName = "CardHeader"

const CardTitle = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-[13px] font-bold uppercase leading-tight tracking-[0.04em] text-[#f2e3c2]",
      className
    )}
    {...props}
  />
)))
CardTitle.displayName = "CardTitle"

const CardDescription = React.memo(React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-[12px] leading-[16px] text-[#cec5b8]",
      className
    )}
    {...props}
  />
)))
CardDescription.displayName = "CardDescription"

const CardContent = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3", className)} {...props} />
)))
CardContent.displayName = "CardContent"

const CardFooter = React.memo(React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 p-3 pt-0",
      className
    )}
    {...props}
  />
)))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
