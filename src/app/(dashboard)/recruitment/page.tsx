import { RecruitmentView } from "@/components/dashboard/recruitment-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getTroopConfigurations, UserWithProgress } from "@/lib/data"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { calcularStatsTropaConBonus } from "@/lib/formulas/troop-formulas"

function RecruitmentLoading() {
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

export default async function RecruitmentPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const troopConfigs = await getTroopConfigurations();

  const troopsWithStats = troopConfigs.map(config => {
      const { ataqueActual, defensaActual } = calcularStatsTropaConBonus(config, user.entrenamientos);
      return {
          ...config,
          ataqueActual,
          defensaActual,
      }
  })
  
  const desiredOrder = [
    "maton", "portero", "acuchillador", "pistolero", "ocupacion", "espia", "porteador", "cia", "fbi", "transportista", "tactico", "francotirador", "asesino", "ninja", "demoliciones", "mercenario"
  ];

  const sortedTroops = [...troopsWithStats]
    .filter(t => t.tipo !== 'DEFENSA')
    .sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.id);
        const indexB = desiredOrder.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

  return (
    <div className="main-view">
      <Suspense fallback={<RecruitmentLoading />}>
          <RecruitmentView user={user} troopConfigsWithStats={sortedTroops} />
      </Suspense>
    </div>
  )
}
