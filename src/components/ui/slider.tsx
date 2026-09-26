"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.memo(React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="v-slider-track">
      <SliderPrimitive.Range className="absolute h-full bg-[#ffe569]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="v-slider-thumb block disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
)))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
