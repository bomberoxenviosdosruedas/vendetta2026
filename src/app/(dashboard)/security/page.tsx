
import { SecurityView } from "@/components/dashboard/security-view";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTroopConfigurations, UserWithProgress } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calcularStatsTropaConBonus } from "@/lib/formulas/troop-formulas";

function SecurityLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="border rounded-lg p-0">
            <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center space-x-4">
                        <Skeleton className="h-16 w-20 rounded-md shimmer" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 shimmer" />
                            <Skeleton className="h-4 w-1/2 shimmer" />
                        </div>
                        <Skeleton className="h-10 w-32 rounded-md shimmer" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
}

export default async function SecurityPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const troopConfigs = await getTroopConfigurations();
  
  const defenseTroops = troopConfigs.filter(t => t.tipo === 'DEFENSA');

  const desiredOrder = ["trabajador_ilegal", "centinela", "policia", "guardaespaldas", "guardia_de_honor"];

  const sortedDefenseTroops = [...defenseTroops].sort((a, b) => {
    const indexA = desiredOrder.indexOf(a.id);
    const indexB = desiredOrder.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const troopsWithStats = sortedDefenseTroops.map(config => {
      const { ataqueActual, defensaActual, capacidadActual, velocidadActual } = calcularStatsTropaConBonus(config, user.entrenamientos);
      return {
          ...config,
          ataqueActual,
          defensaActual,
          capacidadActual,
          velocidadActual,
      }
  })

  return (
    <div className="main-view">
      <Suspense fallback={<SecurityLoading />}>
          <SecurityView user={user} defenseTroops={troopsWithStats} />
      </Suspense>
    </div>
  )
}
