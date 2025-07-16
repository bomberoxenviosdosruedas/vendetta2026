
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersForRanking } from "@/lib/data";
import { RankingsView } from "@/components/dashboard/rankings-view";

function RankingsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4 shimmer" />
            <div className="rounded-lg border">
                <div className="w-full h-12 bg-muted/80 rounded-t-lg" />
                <div className="p-4 space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full shimmer" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default async function RankingsPage() {
    const users = await getUsersForRanking();

    return (
        <div className="main-view">
            <h2 className="text-3xl font-bold tracking-tight">Clasificaciones</h2>
            <Suspense fallback={<RankingsLoading />}>
                <RankingsView users={users} />
            </Suspense>
        </div>
    );
}
