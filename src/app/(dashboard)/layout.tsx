

import { Suspense } from "react"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { obtenerEstadoJuegoActualizado, verificarYFinalizarConstruccion, verificarYFinalizarReclutamiento, actualizarPuntuacionUsuario } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";


function ResourceBarFallback() {
    return (
        <div className="w-full bg-black/80 text-white p-2 sticky top-14 sm:top-16 z-10">
            <div className="container mx-auto flex items-center justify-between h-8">
                <Skeleton className="h-5 w-full bg-muted shimmer" />
            </div>
        </div>
    )
}

export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/');
  }

  // Se ejecutan en paralelo para optimizar la carga
  const [userAfterConstructionCheck, userAfterRecruitmentCheck] = await Promise.all([
    verificarYFinalizarConstruccion(sessionUser),
    verificarYFinalizarReclutamiento(sessionUser),
  ]);
  
  // Combina los resultados. Si no hubo cambios, usa la versión anterior.
  let combinedUser = { ...sessionUser, ...userAfterConstructionCheck, ...userAfterRecruitmentCheck };

  const userWithUpdatedProgress = await obtenerEstadoJuegoActualizado(combinedUser);
  const finalUser = await actualizarPuntuacionUsuario(userWithUpdatedProgress);


  return (
    <DashboardClientLayout user={finalUser}>
        <div className="sticky top-14 sm:top-16 z-20">
            <Suspense fallback={<ResourceBarFallback />}>
                <ResourceBar user={finalUser} />
            </Suspense>
        </div>
        <div className="flex-1">
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
    </DashboardClientLayout>
  )
}
