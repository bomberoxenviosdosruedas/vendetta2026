
'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveTrainingConfig } from "@/lib/actions/admin.actions";
import { Loader2 } from "lucide-react";
import type { FullConfiguracionEntrenamiento } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";

interface TrainingConfigFormProps {
    training: FullConfiguracionEntrenamiento | null;
    allTrainings: FullConfiguracionEntrenamiento[];
    onFinished: () => void;
}

export function TrainingConfigForm({ training, allTrainings, onFinished }: TrainingConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    // Initialize state for requirements from the training prop
    const initialRequirements = new Map(
        training?.requirements.map(req => [req.requiredTrainingId, req.requiredLevel])
    );
    const [requirements, setRequirements] = useState<Map<string, number>>(initialRequirements);

    const handleRequirementChange = (trainingId: string, checked: boolean) => {
        const newRequirements = new Map(requirements);
        if (checked) {
            newRequirements.set(trainingId, 1); // Default level to 1
        } else {
            newRequirements.delete(trainingId);
        }
        setRequirements(newRequirements);
    };

    const handleLevelChange = (trainingId: string, level: number) => {
        const newRequirements = new Map(requirements);
        if (level > 0) {
            newRequirements.set(trainingId, level);
        } else {
            newRequirements.delete(trainingId); // Remove if level is 0 or less
        }
        setRequirements(newRequirements);
    };

    const handleSubmit = (formData: FormData) => {
        // Append requirements to formData before submitting
        requirements.forEach((level, id) => {
            formData.append('requirement_ids', id);
            formData.append(`requirement_level_${id}`, level.toString());
        });

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

    // Filter out the current training from the list of possible requirements
    const availableRequirements = allTrainings.filter(t => t.id !== training?.id);

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
                <Label>Requisitos</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                    {availableRequirements.map(reqTraining => {
                        const isChecked = requirements.has(reqTraining.id);
                        return (
                            <div key={reqTraining.id} className="flex items-center gap-4">
                                <div className="flex items-center gap-2 flex-1">
                                    <Checkbox
                                        id={`req-${reqTraining.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => handleRequirementChange(reqTraining.id, !!checked)}
                                    />
                                    <Label htmlFor={`req-${reqTraining.id}`} className="font-normal">
                                        {reqTraining.nombre}
                                    </Label>
                                </div>
                                {isChecked && (
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`level-${reqTraining.id}`} className="text-xs">Nivel:</Label>
                                        <Input
                                            id={`level-${reqTraining.id}`}
                                            type="number"
                                            value={requirements.get(reqTraining.id) || 1}
                                            onChange={(e) => handleLevelChange(reqTraining.id, parseInt(e.target.value, 10))}
                                            className="h-8 w-20"
                                            min="1"
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
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
