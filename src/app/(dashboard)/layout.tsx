
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { obtenerEstadoJuegoActualizado, verificarYFinalizarConstruccion, verificarYFinalizarReclutamiento, actualizarPuntuacionUsuario } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";


function ResourceBarFallback() {
    return (
        <div className="w-full bg-gray-900 text-white p-2">
            <div className="container mx-auto flex items-center justify-between h-8">
                <Skeleton className="h-5 w-full bg-gray-700" />
            </div>
        </div>
    )
}


export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  
  let sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/');
  }

  // Verificar finalización de colas en orden
  const userAfterConstructionCheck = await verificarYFinalizarConstruccion(sessionUser);
  const userAfterRecruitmentCheck = await verificarYFinalizarReclutamiento(userAfterConstructionCheck);
  
  // Actualizar recursos generados
  const userWithUpdatedProgress = await obtenerEstadoJuegoActualizado(userAfterRecruitmentCheck);
  
  // Actualizar la puntuación del usuario
  const finalUser = await actualizarPuntuacionUsuario(userWithUpdatedProgress);


  return (
    <DashboardClientLayout user={finalUser}>
        <Suspense fallback={<ResourceBarFallback />}>
            <ResourceBar user={finalUser} />
        </Suspense>
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
    </DashboardClientLayout>
  )
}
