import { OverviewView } from "@/components/dashboard/overview-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function OverviewLoading() {
    return (
        <div className="space-y-3">
            {/* Visión General del Imperio Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Skeleton className="h-[140px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />
                <Skeleton className="h-[140px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />
                <Skeleton className="h-[140px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />
            </div>

            {/* Colas Operativas Skeleton */}
            <Skeleton className="h-[180px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />

            {/* Base de Tropas Skeleton */}
            <Skeleton className="h-[240px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />

            {/* Puntos del Jugador Skeleton */}
            <Skeleton className="h-[120px] w-full rounded-none border border-[#332d20] bg-[#16130e]" />
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