
import { getAdminSession, logoutAdmin } from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { RoomConfigTable } from "@/components/admin/room-config-table";
import { TrainingConfigTable } from "@/components/admin/training-config-table";
import { TroopConfigTable } from "@/components/admin/troop-config-table";
import { getRoomConfigurations, getTrainingConfigurations, getTroopConfigurations } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function LogoutButton() {
    'use server';
    return (
        <form action={async () => {
            'use server';
            await logoutAdmin();
            redirect('/admin');
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

export default async function AdminPanelPage() {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

    const rooms = await getRoomConfigurations();
    const trainings = await getTrainingConfigurations();
    const troops = await getTroopConfigurations();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración de Vendetta</h1>
                    <p className="text-muted-foreground">Gestión de la configuración del juego.</p>
                </div>
                <LogoutButton />
            </div>

            <Tabs defaultValue="habitaciones">
                <TabsList>
                    <TabsTrigger value="habitaciones">Habitaciones</TabsTrigger>
                    <TabsTrigger value="entrenamientos">Entrenamientos</TabsTrigger>
                    <TabsTrigger value="tropas">Tropas</TabsTrigger>
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
                        <TroopConfigTable initialData={troops} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
