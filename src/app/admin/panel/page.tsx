
import { getAdminSession, logoutAdmin } from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { RoomConfigTable } from "@/components/admin/room-config-table";
import { TrainingConfigTable } from "@/components/admin/training-config-table";
import { TroopConfigTable } from "@/components/admin/troop-config-table";

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

export default async function AdminPanelPage() {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

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
                   <RoomConfigTable />
                </TabsContent>
                <TabsContent value="entrenamientos">
                    <TrainingConfigTable />
                </TabsContent>
                <TabsContent value="tropas">
                    <TroopConfigTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}
