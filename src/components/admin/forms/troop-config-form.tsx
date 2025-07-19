
'use client';

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveTroopConfig } from "@/lib/actions/admin.actions";
import { Loader2 } from "lucide-react";
import type { ConfiguracionTropa, TipoTropa } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TroopConfigFormProps {
    troop: ConfiguracionTropa | null;
    onFinished: () => void;
}

export function TroopConfigForm({ troop, onFinished }: TroopConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await saveTroopConfig(formData);
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" name="id" defaultValue={troop?.id} required disabled={!!troop} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" name="nombre" defaultValue={troop?.nombre} required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" defaultValue={troop?.descripcion || ''} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="urlImagen">URL de Imagen</Label>
                <Input id="urlImagen" name="urlImagen" defaultValue={troop?.urlImagen || ''} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="costoArmas">Armas</Label>
                    <Input id="costoArmas" name="costoArmas" type="number" defaultValue={troop?.costoArmas} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoMunicion">Munición</Label>
                    <Input id="costoMunicion" name="costoMunicion" type="number" defaultValue={troop?.costoMunicion} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="costoDolares">Dólares</Label>
                    <Input id="costoDolares" name="costoDolares" type="number" defaultValue={troop?.costoDolares} />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ataque">Ataque</Label>
                    <Input id="ataque" name="ataque" type="number" defaultValue={troop?.ataque} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defensa">Defensa</Label>
                    <Input id="defensa" name="defensa" type="number" defaultValue={troop?.defensa} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="puntos">Puntos</Label>
                    <Input id="puntos" name="puntos" type="number" step="0.01" defaultValue={troop?.puntos} />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="capacidad">Capacidad</Label>
                    <Input id="capacidad" name="capacidad" type="number" defaultValue={troop?.capacidad} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="velocidad">Velocidad</Label>
                    <Input id="velocidad" name="velocidad" type="number" defaultValue={troop?.velocidad} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="salario">Salario</Label>
                    <Input id="salario" name="salario" type="number" defaultValue={troop?.salario} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duracion">Duración (s)</Label>
                    <Input id="duracion" name="duracion" type="number" defaultValue={troop?.duracion} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Tropa</Label>
                <Select name="tipo" defaultValue={troop?.tipo}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(TipoTropa).map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="bonusAtaque">Bonus Ataque (IDs separados por coma)</Label>
                <Input id="bonusAtaque" name="bonusAtaque" defaultValue={troop?.bonusAtaque.join(', ')} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bonusDefensa">Bonus Defensa (IDs separados por coma)</Label>
                <Input id="bonusDefensa" name="bonusDefensa" defaultValue={troop?.bonusDefensa.join(', ')} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos (IDs separados por coma)</Label>
                <Input id="requisitos" name="requisitos" defaultValue={troop?.requisitos.join(', ')} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                </Button>
            </div>
        </form>
    );
}
