
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFamiliesForRanking, getUsersForRanking } from "@/lib/data";
import { PlayerRankingsView } from "@/components/dashboard/rankings/player-rankings-view";
import { RankingTypeSelector } from "@/components/dashboard/rankings/ranking-type-selector";
import { FamilyRankingsView } from "@/components/dashboard/rankings/family-rankings-view";

function RankingsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
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

export default async function RankingsPage({
    searchParams
}: {
    searchParams?: Promise<{ type?: string }>
}) {
    const resolvedSearchParams = await searchParams;
    const rankingType = resolvedSearchParams?.type || '0'; // Default to '0' (Jugadores)

    const users = rankingType === '0' ? await getUsersForRanking() : [];
    const families = rankingType === '1' ? await getFamiliesForRanking() : [];

    return (
        <div className="main-view">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <h2 className="text-3xl font-bold tracking-tight">Clasificaciones</h2>
              <RankingTypeSelector />
            </div>
            <Suspense fallback={<RankingsLoading />}>
                {rankingType === '0' && <PlayerRankingsView users={users} />}
                {rankingType === '1' && <FamilyRankingsView families={families} />}
            </Suspense>
        </div>
    );
}
