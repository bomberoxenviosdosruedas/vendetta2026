import { OverviewView } from "@/components/dashboard/overview-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function OverviewLoading() {
    return (
        <div className="flex-grow p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[min-content,1fr] gap-4 h-full">
                <div className="md:col-span-1 md:row-span-1">
                    <Skeleton className="h-[88px] w-full rounded-lg" />
                </div>
                <div className="md:col-span-1 md:row-span-2">
                     <Skeleton className="h-full min-h-[250px] w-full rounded-lg" />
                </div>
                <div className="md:col-span-1 md:row-span-2">
                     <Skeleton className="h-full min-h-[250px] w-full rounded-lg" />
                </div>
                 <div className="md:col-span-3">
                     <Skeleton className="h-[200px] w-full rounded-lg" />
                </div>
            </div>
             <Skeleton className="h-[74px] w-full rounded-lg" />
        </div>
    )
}


export default function OverviewPage() {
  return (
    <div className="main-view h-full">
      <Suspense fallback={<OverviewLoading/>}>
          <OverviewView />
      </Suspense>
    </div>
  )
}
