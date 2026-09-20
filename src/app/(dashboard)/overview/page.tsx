import { OverviewView } from "@/components/dashboard/overview-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function OverviewLoading() {
    return (
        <div className="flex-grow space-y-4">
            {/* Top 3 Balanced Dossier Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-[250px] w-full rounded-lg border border-border/40" />
                <Skeleton className="h-[250px] w-full rounded-lg border border-border/40" />
                <Skeleton className="h-[250px] w-full rounded-lg border border-border/40" />
            </div>

            {/* City News Card Skeleton */}
            <Skeleton className="h-[180px] w-full rounded-lg border border-border/40" />

            {/* Live Queues Skeleton */}
            <Skeleton className="h-[160px] w-full rounded-lg border border-border/40" />

            {/* Activity History Skeleton */}
            <Skeleton className="h-[220px] w-full rounded-lg border border-border/40" />

            {/* Bottom Stats Bar Skeleton */}
            <Skeleton className="h-[68px] w-full rounded-lg border border-border/40" />
        </div>
    );
}

export default function OverviewPage() {
    return (
        <div className="main-view h-full">
            <Suspense fallback={<OverviewLoading />}>
                <OverviewView />
            </Suspense>
        </div>
    );
}
