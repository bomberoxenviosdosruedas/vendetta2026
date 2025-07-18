
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BattleReport, runBattleSimulation, SimulationInput } from '@/lib/actions/simulation.actions';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

interface SimulatorViewProps {
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
}

interface SimulatorColumnState {
    troops: Record<string, number>;
    trainings: Record<string, number>;
    defenses: Record<string, number>;
    buildingsLevel: number;
}

const initialColumnState: SimulatorColumnState = {
    troops: {},
    trainings: {},
    defenses: {},
    buildingsLevel: 1,
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <h3 className="text-lg font-semibold mb-2 text-primary">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const InputRow = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
    <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm">{label}</Label>
        <Input
            id={label}
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-24 h-8"
        />
    </div>
);

export function SimulatorView({ troopConfigs, trainingConfigs, defenseConfigs }: SimulatorViewProps) {
    const [isPending, startTransition] = useTransition();
    const [attackerState, setAttackerState] = useState<SimulatorColumnState>(initialColumnState);
    const [defenderState, setDefenderState] = useState<SimulatorColumnState>(initialColumnState);
    const [battleReport, setBattleReport] = useState<BattleReport | null>(null);

    const handleStateChange = (
        setter: React.Dispatch<React.SetStateAction<SimulatorColumnState>>,
        section: keyof Omit<SimulatorColumnState, 'buildingsLevel'>,
        id: string,
        value: number
    ) => {
        setter(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [id]: value
            }
        }));
    };

    const handleBuildingsLevelChange = (
        setter: React.Dispatch<React.SetStateAction<SimulatorColumnState>>,
        value: number
    ) => {
         setter(prev => ({ ...prev, buildingsLevel: value }));
    }

    const formatSimulationInput = (state: SimulatorColumnState): SimulationInput => {
        return {
            troops: Object.entries(state.troops).map(([id, quantity]) => ({ id, quantity })),
            trainings: Object.entries(state.trainings).map(([id, level]) => ({ id, level })),
            buildingsLevel: state.buildingsLevel
        };
    };

    const handleSimulate = () => {
        const attackerInput = formatSimulationInput(attackerState);
        const defenderInput = formatSimulationInput(defenderState);
        
        startTransition(async () => {
            const report = await runBattleSimulation(attackerInput, defenderInput);
            setBattleReport(report);
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Simulador de Batalla</h2>
                    <p className="text-muted-foreground">
                        Calcula los resultados de posibles enfrentamientos.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Atacante */}
                <Card>
                    <CardHeader>
                        <CardTitle>Atacante</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Section title="Tropas">
                            {troopConfigs.map(t => (
                                <InputRow
                                    key={`attacker-troop-${t.id}`}
                                    label={t.nombre}
                                    value={attackerState.troops[t.id] || 0}
                                    onChange={(val) => handleStateChange(setAttackerState, 'troops', t.id, val)}
                                />
                            ))}
                        </Section>
                        <Separator />
                        <Section title="Entrenamientos">
                            {trainingConfigs.map(t => (
                                <InputRow
                                    key={`attacker-training-${t.id}`}
                                    label={t.nombre}
                                    value={attackerState.trainings[t.id] || 0}
                                    onChange={(val) => handleStateChange(setAttackerState, 'trainings', t.id, val)}
                                />
                            ))}
                        </Section>
                    </CardContent>
                </Card>

                {/* Columna Defensor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Defensor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Section title="Tropas">
                            {troopConfigs.map(t => (
                                <InputRow
                                    key={`defender-troop-${t.id}`}
                                    label={t.nombre}
                                    value={defenderState.troops[t.id] || 0}
                                    onChange={(val) => handleStateChange(setDefenderState, 'troops', t.id, val)}
                                />
                            ))}
                        </Section>
                        <Separator />
                         <Section title="Defensas">
                            {defenseConfigs.map(d => (
                                <InputRow
                                    key={`defender-defense-${d.id}`}
                                    label={d.nombre}
                                    value={defenderState.defenses[d.id] || 0}
                                    onChange={(val) => handleStateChange(setDefenderState, 'defenses', d.id, val)}
                                />
                            ))}
                        </Section>
                        <Separator />
                        <Section title="Entrenamientos">
                             {trainingConfigs.map(t => (
                                <InputRow
                                    key={`defender-training-${t.id}`}
                                    label={t.nombre}
                                    value={defenderState.trainings[t.id] || 0}
                                    onChange={(val) => handleStateChange(setDefenderState, 'trainings', t.id, val)}
                                />
                            ))}
                        </Section>
                        <Separator />
                        <Section title="General">
                            <InputRow
                                label="Nivel Edificios"
                                value={defenderState.buildingsLevel}
                                onChange={(val) => handleBuildingsLevelChange(setDefenderState, val)}
                            />
                        </Section>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <Button onClick={handleSimulate} disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simular Batalla
                </Button>
            </div>

            {battleReport && (
                 <Dialog open={!!battleReport} onOpenChange={(isOpen) => !isOpen && setBattleReport(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Reporte de Batalla</DialogTitle>
                            <DialogDescription>
                                El resultado de la simulación es: <span className={`font-bold ${battleReport.winner === 'attacker' ? 'text-green-500' : battleReport.winner === 'defender' ? 'text-red-500' : 'text-yellow-500'}`}>{battleReport.winner.toUpperCase()} GANA</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Pérdidas del Atacante</h4>
                                <ul className="list-disc list-inside text-sm">
                                    {battleReport.attackerLosses.map(loss => (
                                        <li key={loss.id}>{troopConfigs.find(t=>t.id === loss.id)?.nombre}: {loss.quantity}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold">Pérdidas del Defensor</h4>
                                <ul className="list-disc list-inside text-sm">
                                     {battleReport.defenderLosses.map(loss => (
                                        <li key={loss.id}>{troopConfigs.find(t=>t.id === loss.id)?.nombre}: {loss.quantity}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold">Recursos Saqueados</h4>
                            <div className="text-sm grid grid-cols-2 gap-2">
                                <p>Armas: <span className="font-mono text-green-400">{battleReport.lootedResources.armas}</span></p>
                                <p>Munición: <span className="font-mono text-green-400">{battleReport.lootedResources.municion}</span></p>
                                <p>Dólares: <span className="font-mono text-green-400">{battleReport.lootedResources.dolares}</span></p>
                                <p>Alcohol: <span className="font-mono text-green-400">{battleReport.lootedResources.alcohol}</span></p>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
