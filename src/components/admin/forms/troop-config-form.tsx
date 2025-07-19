

'use client';

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveTroopConfig } from "@/lib/actions/admin.actions";
import { Loader2, Trash2 } from "lucide-react";
import type { ConfiguracionTropa, TipoTropa } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullConfiguracionEntrenamiento, FullConfiguracionTropa } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";

interface TroopConfigFormProps {
    troop: FullConfiguracionTropa | null;
    allTroops: ConfiguracionTropa[];
    allTrainings: FullConfiguracionEntrenamiento[];
    tiposTropa: string[];
    onFinished: () => void;
}

type BonusContrincanteState = {
    contrincanteId: string;
    factorPrioridad: number;
}

function CheckboxList({ title, items, selectedItems, onSelectionChange }: { title: string, items: {id: string, nombre: string}[], selectedItems: Set<string>, onSelectionChange: (id: string, checked: boolean) => void}) {
    return (
        <div className="space-y-2">
            <Label>{title}</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-40 overflow-y-auto">
                {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                            id={`${title}-${item.id}`}
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) => onSelectionChange(item.id, !!checked)}
                        />
                         <Label htmlFor={`${title}-${item.id}`} className="font-normal">
                            {item.nombre}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function TroopConfigForm({ troop, allTroops, allTrainings, tiposTropa, onFinished }: TroopConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [bonusAtaque, setBonusAtaque] = useState(new Set(troop?.bonusAtaque || []));
    const [bonusDefensa, setBonusDefensa] = useState(new Set(troop?.bonusDefensa || []));
    const [requisitos, setRequisitos] = useState(new Set(troop?.requisitos || []));

    const [bonusContrincantes, setBonusContrincantes] = useState<BonusContrincanteState[]>(troop?.bonusContrincante || []);

    const handleSelectionChange = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string, checked: boolean) => {
        setter(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }

    const handleAddBonus = () => {
        setBonusContrincantes([...bonusContrincantes, { contrincanteId: '', factorPrioridad: 1.0 }]);
    }

    const handleRemoveBonus = (index: number) => {
        setBonusContrincantes(bonusContrincantes.filter((_, i) => i !== index));
    }

    const handleBonusChange = (index: number, field: keyof BonusContrincanteState, value: string | number) => {
        const newBonuses = [...bonusContrincantes];
        if (field === 'factorPrioridad') {
             newBonuses[index][field] = Number(value);
        } else {
             newBonuses[index][field] = String(value);
        }
        setBonusContrincantes(newBonuses);
    }

    const handleSubmit = (formData: FormData) => {
        formData.append('bonusAtaque', Array.from(bonusAtaque).join(','));
        formData.append('bonusDefensa', Array.from(bonusDefensa).join(','));
        formData.append('requisitos', Array.from(requisitos).join(','));
        formData.append('bonusContrincantes', JSON.stringify(bonusContrincantes));
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
            <input type="hidden" name="id" value={troop?.id || ''} />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="idForm">ID (Editable solo al crear)</Label>
                    <Input id="idForm" name="idForm" defaultValue={troop?.id} required disabled={!!troop} />
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
                        {tiposTropa.map(tipo => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <CheckboxList 
                title="Bonus Ataque"
                items={allTrainings}
                selectedItems={bonusAtaque}
                onSelectionChange={(id, checked) => handleSelectionChange(setBonusAtaque, id, checked)}
            />

            <CheckboxList 
                title="Bonus Defensa"
                items={allTrainings}
                selectedItems={bonusDefensa}
                onSelectionChange={(id, checked) => handleSelectionChange(setBonusDefensa, id, checked)}
            />

            <CheckboxList 
                title="Requisitos de Tropa"
                items={allTroops.filter(t => t.id !== troop?.id)}
                selectedItems={requisitos}
                onSelectionChange={(id, checked) => handleSelectionChange(setRequisitos, id, checked)}
            />

             <div className="space-y-4 rounded-md border p-4">
                <div className="flex justify-between items-center">
                    <Label>Bonus de Prioridad vs Contrincante</Label>
                    <Button type="button" size="sm" onClick={handleAddBonus}>Añadir Bonus</Button>
                </div>
                 <div className="space-y-2">
                    {bonusContrincantes.map((bonus, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Select
                                value={bonus.contrincanteId}
                                onValueChange={(value) => handleBonusChange(index, 'contrincanteId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tropa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {allTroops.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Input
                                type="number"
                                step="0.1"
                                placeholder="Factor (ej: 1.5)"
                                value={bonus.factorPrioridad}
                                onChange={(e) => handleBonusChange(index, 'factorPrioridad', e.target.value)}
                                className="w-40"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBonus(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                 </div>

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

