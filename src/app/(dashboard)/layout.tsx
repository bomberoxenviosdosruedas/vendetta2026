
import { Suspense } from "react"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { processGameTick } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyProvider } from "@/contexts/property-context";

export const dynamic = 'force-dynamic';

function ResourceBarFallback() {
    return (
        <div className="w-full h-14 bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
            <div className="container mx-auto flex h-full items-center justify-center">
                <Skeleton className="h-5 w-full max-w-7xl mx-auto px-3 md:px-6 bg-muted shimmer" />
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
    redirect('/login');
  }

  // Run unified game tick - sequential with proper data flow
  console.log('[DashboardLayout] Starting game tick for user:', sessionUser.id);
  const finalUser = await processGameTick(sessionUser);
  console.log('[DashboardLayout] Game tick complete');

  if (!finalUser.propiedades || finalUser.propiedades.length === 0) {
      // Redirect to a page to create the first property if none exist
      // For now, just show an error message or redirect to overview with a message
      return (
        <DashboardClientLayout user={finalUser}>
            <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">
              <h2 className="text-2xl font-bold">Sin propiedades</h2>
              <p>No tienes ninguna propiedad. ¡Crea una para empezar!</p>
            </main>
        </DashboardClientLayout>
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
          <DashboardClientLayout user={finalUser}>
              <Suspense fallback={<ResourceBarFallback />}>
                  <ResourceBar user={finalUser} />
              </Suspense>
              <div className="flex-1">
                <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">
                  {children}
                </main>
              </div>
          </DashboardClientLayout>
      </PropertyProvider>
    </Suspense>
  )
}
