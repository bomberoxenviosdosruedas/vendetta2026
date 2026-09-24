
import { Suspense } from "react"
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { processGameTick } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PropertyProvider } from "@/contexts/property-context";
import { GameAnimationProvider } from "@/components/dashboard/animations";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/overview');
  }

  // Run unified game tick - sequential with proper data flow
  console.log('[DashboardLayout] Starting game tick for user:', sessionUser.id);
  const finalUser = await processGameTick(sessionUser);
  console.log('[DashboardLayout] Game tick complete');

  if (!finalUser.propiedades || finalUser.propiedades.length === 0) {
      return (
        <Suspense>
          <PropertyProvider initialProperties={[]}>
            <DashboardClientLayout user={finalUser}>
                <div className="p-4 w-full">
                  <h2 className="text-2xl font-bold">Sin propiedades</h2>
                  <p>No tienes ninguna propiedad. ¡Crea una para empezar!</p>
                </div>
            </DashboardClientLayout>
          </PropertyProvider>
        </Suspense>
      )
  }

  const sortedProperties = [...finalUser.propiedades].sort((a, b) => {
    if (a.nombre === 'Propiedad Principal') return -1;
    if (b.nombre === 'Propiedad Principal') return 1;
    return 0;
  });


  return (
    <Suspense>
      <PropertyProvider initialProperties={sortedProperties}>
          <GameAnimationProvider>
            <DashboardClientLayout user={finalUser}>
                <div className="flex-1 flex flex-col min-w-0">
                    {children}
                </div>
            </DashboardClientLayout>
          </GameAnimationProvider>
      </PropertyProvider>
    </Suspense>
  )
}
