
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MissionsView } from "@/components/dashboard/missions-view";
import { getTroopConfigurations } from "@/lib/data";

function MissionsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-4 shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full shimmer" />
                    <Skeleton className="h-10 w-full shimmer" />
                    <Skeleton className="h-10 w-full shimmer" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full shimmer" />
                    <Skeleton className="h-10 w-full shimmer" />
                </div>
            </div>
        </div>
    )
}


export default async function MissionsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const troopConfigs = await getTroopConfigurations();
    
    return (
        <div className="main-view">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Mando</h2>
                    <p className="text-muted-foreground">
                        Planifica y ejecuta tus operaciones.
                    </p>
                </div>
            </div>
            <Suspense fallback={<MissionsLoading />}>
                <MissionsView user={user} troopConfigs={troopConfigs} />
            </Suspense>
        </div>
    );
}
