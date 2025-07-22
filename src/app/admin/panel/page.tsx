

import { logoutAdmin, getAdminSession } from "@/lib/auth-admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { RoomConfigTable } from "@/components/admin/room-config-table";
import { TrainingConfigTable } from "@/components/admin/training-config-table";
import { getRoomConfigurations, getTrainingConfigurations } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración de Vendetta</h1>
                    <p className="text-muted-foreground">
                        Gestión de la configuración del juego.
                    </p>
                </div>
                <LogoutButton />
            </div>

            <Tabs defaultValue={searchParams?.tab || "habitaciones"}>
                <TabsList>
                    <TabsTrigger value="habitaciones" asChild><Link href="?tab=habitaciones">Habitaciones</Link></TabsTrigger>
                    <TabsTrigger value="entrenamientos" asChild><Link href="?tab=entrenamientos">Entrenamientos</Link></TabsTrigger>
                    <TabsTrigger value="tropas" asChild><Link href="/admin/panel/troops">Tropas</Link></TabsTrigger>
                     <TabsTrigger value="bonus" asChild><Link href="/admin/panel/bonus">Bonus de Ataque</Link></TabsTrigger>
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
            </Tabs>
        </div>
    )
}
