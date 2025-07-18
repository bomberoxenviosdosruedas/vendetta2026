
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTroopConfigurations, getTrainingConfigurations, getRoomConfigurations } from "@/lib/data";
import { SimulatorView } from "@/components/dashboard/simulator-view";

function SimulatorLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    )
}

export default async function SimulatorPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const [troopConfigs, trainingConfigs, roomConfigs] = await Promise.all([
        getTroopConfigurations(),
        getTrainingConfigurations(),
        getRoomConfigurations()
    ]);
    
    const defenseConfigs = roomConfigs.filter(r => 
        ['seguridad', 'torreta_de_fuego_automatico', 'minas_ocultas'].includes(r.id)
    );

    return (
        <div className="main-view">
            <Suspense fallback={<SimulatorLoading />}>
                <SimulatorView 
                    user={user}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                />
            </Suspense>
        </div>
    );
}
