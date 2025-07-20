
'use client';

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveTroopBonusConfig } from "@/lib/actions/admin.actions";
import { ConfiguracionTropa, TropaBonusContrincante } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface BonusConfigMatrixProps {
    troops: ConfiguracionTropa[];
    initialBonusConfig: TropaBonusContrincante[];
}

export function BonusConfigMatrix({ troops, initialBonusConfig }: BonusConfigMatrixProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const initialMatrixState = () => {
        const matrix = new Map<string, Map<string, number>>();
        for (const bonus of initialBonusConfig) {
            if (!matrix.has(bonus.tropaAtacanteId)) {
                matrix.set(bonus.tropaAtacanteId, new Map());
            }
            matrix.get(bonus.tropaAtacanteId)!.set(bonus.tropaDefensoraId, bonus.factorPrioridad);
        }
        return matrix;
    };

    const [matrix, setMatrix] = useState(initialMatrixState);

    const handleInputChange = (attackerId: string, defenderId: string, value: string) => {
        const newMatrix = new Map(matrix);
        if (!newMatrix.has(attackerId)) {
            newMatrix.set(attackerId, new Map());
        }
        
        const numValue = parseFloat(value);
        if (value === '' || isNaN(numValue)) {
            newMatrix.get(attackerId)!.delete(defenderId);
        } else {
            newMatrix.get(attackerId)!.set(defenderId, numValue);
        }
        setMatrix(newMatrix);
    };

    const handleSubmit = () => {
        const bonusData: TropaBonusContrincante[] = [];
        matrix.forEach((defenderMap, attackerId) => {
            defenderMap.forEach((factor, defenderId) => {
                if(factor !== 1) { // Only save non-default values
                    bonusData.push({
                        tropaAtacanteId: attackerId,
                        tropaDefensoraId: defenderId,
                        factorPrioridad: factor,
                    });
                }
            });
        });

        startTransition(async () => {
            const result = await saveTroopBonusConfig(bonusData);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Configuración de bonus guardada.' });
            }
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Matriz de Bonus de Ataque vs Tropas</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Define el factor de prioridad de ataque. Un valor de 1.5 significa un 50% más de daño contra esa unidad. Un valor de 1 es el normal.
                </p>
                <ScrollArea className="w-full whitespace-nowrap">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-card p-2 border text-xs w-[150px]">Atacante / Defensor</th>
                                {troops.map(defender => (
                                    <th key={defender.id} className="p-2 border text-xs w-[100px] -rotate-45">
                                        <div className="w-20 truncate">{defender.nombre}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {troops.map(attacker => (
                                <tr key={attacker.id}>
                                    <td className="sticky left-0 bg-card p-2 border font-semibold text-sm w-[150px]">{attacker.nombre}</td>
                                    {troops.map(defender => (
                                        <td key={defender.id} className={cn("p-1 border", attacker.id === defender.id && "bg-muted/30")}>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                className="w-24 h-8 text-center"
                                                placeholder="1"
                                                disabled={attacker.id === defender.id}
                                                value={matrix.get(attacker.id)?.get(defender.id) ?? ''}
                                                onChange={(e) => handleInputChange(attacker.id, defender.id, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
