import { OverviewView } from "@/components/dashboard/overview-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function OverviewLoading() {
    return (
        <div className="grid h-full gap-4 md:grid-cols-3 md:grid-rows-[min-content,1fr]">
            <div className="md:col-span-1 md:row-span-1">
                <Skeleton className="h-24 w-full rounded-lg shimmer" />
            </div>
            <div className="md:col-span-1 md:row-span-2">
                 <Skeleton className="h-full min-h-64 w-full rounded-lg shimmer" />
            </div>
            <div className="md:col-span-1 md:row-span-2">
                 <Skeleton className="h-full min-h-64 w-full rounded-lg shimmer" />
            </div>
            <div className="md:col-span-3">
                 <Skeleton className="h-48 w-full rounded-lg shimmer" />
            </div>
            <div className="md:col-span-3">
                <Skeleton className="h-16 w-full rounded-lg shimmer" />
            </div>
        </div>
    )
}


export default function OverviewPage() {
  return (
    <div className="main-view">
      <Suspense fallback={<OverviewLoading/>}>
          <OverviewView />
      </Suspense>
    </div>
  )
}
