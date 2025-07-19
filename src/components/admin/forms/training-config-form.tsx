
'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveTrainingConfig } from "@/lib/actions/admin.actions";
import { Loader2 } from "lucide-react";
import type { FullConfiguracionEntrenamiento } from "@/lib/data";
import { Textarea } from "@/components/ui/textarea";

interface TrainingConfigFormProps {
    training: FullConfiguracionEntrenamiento | null;
    onFinished: () => void;
}

function formatRequirements(requirements: FullConfiguracionEntrenamiento['requirements']) {
    if (!requirements || requirements.length === 0) return '';
    return requirements.map(req => `${req.requiredTrainingId}:${req.requiredLevel}`).join(', ');
}

export function TrainingConfigForm({ training, onFinished }: TrainingConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await saveTrainingConfig(formData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración guardada.' });
                onFinished();
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
            <input type="hidden" name="originalId" value={training?.id || ''} />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" name="id" defaultValue={training?.id} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" name="nombre" defaultValue={training?.nombre} required />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="urlImagen">URL de Imagen</Label>
                <Input id="urlImagen" name="urlImagen" defaultValue={training?.urlImagen || ''} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="costoArmas">Armas</Label>
                    <Input id="costoArmas" name="costoArmas" type="number" defaultValue={training?.costoArmas} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoMunicion">Munición</Label>
                    <Input id="costoMunicion" name="costoMunicion" type="number" defaultValue={training?.costoMunicion} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoDolares">Dólares</Label>
                    <Input id="costoDolares" name="costoDolares" type="number" defaultValue={training?.costoDolares} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="puntos">Puntos</Label>
                    <Input id="puntos" name="puntos" type="number" step="0.01" defaultValue={training?.puntos} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duracion">Duración (s)</Label>
                    <Input id="duracion" name="duracion" type="number" defaultValue={training?.duracion} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                 <Textarea 
                    id="requirements" 
                    name="requirements" 
                    defaultValue={formatRequirements(training?.requirements || [])} 
                    placeholder="id_entrenamiento:nivel, otro_id:otro_nivel..."
                />
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
