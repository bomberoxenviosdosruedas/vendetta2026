
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersForRanking } from "@/lib/data";
import { RankingsView } from "@/components/dashboard/rankings-view";

function RankingsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="rounded-lg border">
                <div className="w-full h-12 bg-muted rounded-t-lg" />
                <div className="p-4 space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default async function RankingsPage() {
    const users = await getUsersForRanking();

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Clasificaciones</h2>
            <Suspense fallback={<RankingsLoading />}>
                <RankingsView users={users} />
            </Suspense>
        </div>
    );
}
