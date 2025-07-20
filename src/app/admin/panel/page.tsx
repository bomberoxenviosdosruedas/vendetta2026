

import { logoutAdmin, getAdminSession } from "@/lib/auth-admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { RoomConfigTable } from "@/components/admin/room-config-table";
import { TrainingConfigTable } from "@/components/admin/training-config-table";
import { TroopConfigTable } from "@/components/admin/troop-config-table";
import { getRoomConfigurations, getTrainingConfigurations, getTroopConfigurations } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TipoTropa } from "@prisma/client";
import Link from "next/link";

async function LogoutButton() {
    'use server';
    return (
        <form action={async () => {
            'use server';
            await logoutAdmin();
        }}>
            <Button type="submit" variant="outline">Cerrar Sesión</Button>
        </form>
    )
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full rounded-t-md" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        </div>
    )
}

export default async function AdminPanelPage({
    searchParams
}: {
    searchParams?: { tab?: string }
}) {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

    const rooms = await getRoomConfigurations();
    const trainings = await getTrainingConfigurations();
    const troops = await getTroopConfigurations();
    const tiposTropa = Object.values(TipoTropa);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración de Vendetta</h1>
                    <p className="text-muted-foreground">
                        Gestión de la configuración del juego. Puedes gestionar los <Link href="/admin/panel/bonus" className="text-primary underline">bonus de ataque aquí</Link>.
                    </p>
                </div>
                <LogoutButton />
            </div>

            <Tabs defaultValue={searchParams?.tab || "habitaciones"}>
                <TabsList>
                    <TabsTrigger value="habitaciones" asChild><Link href="?tab=habitaciones">Habitaciones</Link></TabsTrigger>
                    <TabsTrigger value="entrenamientos" asChild><Link href="?tab=entrenamientos">Entrenamientos</Link></TabsTrigger>
                    <TabsTrigger value="tropas" asChild><Link href="?tab=tropas">Tropas</Link></TabsTrigger>
                </TabsList>
                <TabsContent value="habitaciones">
                    <Suspense fallback={<TableSkeleton />}>
                        <RoomConfigTable initialData={rooms} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="entrenamientos">
                     <Suspense fallback={<TableSkeleton />}>
                        <TrainingConfigTable initialData={trainings} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="tropas">
                    <Suspense fallback={<TableSkeleton />}>
                        <TroopConfigTable 
                            initialData={troops} 
                            allTrainings={trainings}
                            tiposTropa={tiposTropa} 
                        />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
