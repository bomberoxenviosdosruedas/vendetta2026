
'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveRoomConfig } from "@/lib/actions/admin.actions";
import { Loader2 } from "lucide-react";
import type { ConfiguracionHabitacion } from "@prisma/client";

interface RoomConfigFormProps {
    room: ConfiguracionHabitacion | null;
    onFinished: () => void;
}

export function RoomConfigForm({ room, onFinished }: RoomConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await saveRoomConfig(formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración guardada.' });
                onFinished();
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" name="id" defaultValue={room?.id} required disabled={!!room} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" name="nombre" defaultValue={room?.nombre} required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" defaultValue={room?.descripcion || ''} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="urlImagen">URL de Imagen</Label>
                <Input id="urlImagen" name="urlImagen" defaultValue={room?.urlImagen || ''} />
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="costoArmas">Armas</Label>
                    <Input id="costoArmas" name="costoArmas" type="number" defaultValue={room?.costoArmas} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoMunicion">Munición</Label>
                    <Input id="costoMunicion" name="costoMunicion" type="number" defaultValue={room?.costoMunicion} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoDolares">Dólares</Label>
                    <Input id="costoDolares" name="costoDolares" type="number" defaultValue={room?.costoDolares} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="duracion">Duración (s)</Label>
                    <Input id="duracion" name="duracion" type="number" defaultValue={room?.duracion} />
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="puntos">Puntos</Label>
                    <Input id="puntos" name="puntos" type="number" step="0.01" defaultValue={room?.puntos} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="produccionBase">Producción Base</Label>
                    <Input id="produccionBase" name="produccionBase" type="number" defaultValue={room?.produccionBase} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="produccionRecurso">Recurso Producido</Label>
                    <Input id="produccionRecurso" name="produccionRecurso" defaultValue={room?.produccionRecurso || ''} placeholder="armas, municion..." />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                </Button>
            </div>
        </form>
    );
}
