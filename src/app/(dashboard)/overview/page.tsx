import { OverviewView } from "@/components/dashboard/overview-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function OverviewLoading() {
    return (
        <div className="grid h-full gap-4 p-4 md:grid-cols-4 md:grid-rows-3 md:p-6">
            <div className="md:col-span-1 md:row-span-1">
                <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 md:row-span-2">
                 <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="md:col-span-1 md:row-span-2">
                 <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 md:row-span-1">
                 <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="md:col-span-1 md:row-span-1">
                 <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="md:col-span-1 md:row-span-1">
                 <Skeleton className="h-full w-full rounded-lg" />
            </div>
             <div className="md:col-span-4">
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        </div>
    )
}


export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewLoading/>}>
        <OverviewView />
    </Suspense>
  )
}
