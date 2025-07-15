
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { ResourceBar } from "@/components/dashboard/resource-bar";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { obtenerEstadoJuegoActualizado } from "@/lib/actions";
import { redirect } from "next/navigation";


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
  const user = await obtenerEstadoJuegoActualizado();

  if (!user) {
    redirect('/');
  }

  return (
    <DashboardClientLayout user={user}>
        <Suspense fallback={<ResourceBarFallback />}>
            <ResourceBar user={user} />
        </Suspense>
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
    </DashboardClientLayout>
  )
}
