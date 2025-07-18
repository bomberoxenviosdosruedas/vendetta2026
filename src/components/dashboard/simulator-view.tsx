
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BattleReport, runBattleSimulation, SimulationInput } from '@/lib/actions/simulation.actions';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { Loader2, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from '../ui/scroll-area';

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
        <Label htmlFor={label} className="text-sm truncate pr-2">{label}</Label>
        <Input
            id={label}
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            className="w-24 h-8"
        />
    </div>
);

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
}

function SimulatorColumn({
    title,
    state,
    setState,
    troopConfigs,
    trainingConfigs,
    defenseConfigs,
    isDefender = false,
}: {
    title: string;
    state: SimulatorColumnState;
    setState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
    isDefender?: boolean;
}) {

    const handleStateChange = (
        section: keyof Omit<SimulatorColumnState, 'buildingsLevel'>,
        id: string,
        value: number
    ) => {
        setState(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [id]: value
            }
        }));
    };

     const handleBuildingsLevelChange = (value: number) => {
         setState(prev => ({ ...prev, buildingsLevel: value }));
    }

    const handleClear = () => {
        setState(initialColumnState);
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Limpiar {title}</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                 <ScrollArea className="h-96 pr-4">
                    <div className="space-y-4">
                        <Section title="Tropas">
                            {troopConfigs.map(t => (
                                <InputRow
                                    key={`${title}-troop-${t.id}`}
                                    label={t.nombre}
                                    value={state.troops[t.id] || 0}
                                    onChange={(val) => handleStateChange('troops', t.id, val)}
                                />
                            ))}
                        </Section>
                        <Separator />
                        {isDefender && (
                            <>
                                <Section title="Defensas">
                                    {defenseConfigs.map(d => (
                                        <InputRow
                                            key={`${title}-defense-${d.id}`}
                                            label={d.nombre}
                                            value={state.defenses[d.id] || 0}
                                            onChange={(val) => handleStateChange('defenses', d.id, val)}
                                        />
                                    ))}
                                </Section>
                                <Separator />
                            </>
                        )}
                        <Section title="Entrenamientos">
                            {trainingConfigs.map(t => (
                                <InputRow
                                    key={`${title}-training-${t.id}`}
                                    label={t.nombre}
                                    value={state.trainings[t.id] || 0}
                                    onChange={(val) => handleStateChange('trainings', t.id, val)}
                                />
                            ))}
                        </Section>
                        {isDefender && (
                             <>
                                <Separator />
                                <Section title="General">
                                    <InputRow
                                        label="Nivel Edificios"
                                        value={state.buildingsLevel}
                                        onChange={handleBuildingsLevelChange}
                                    />
                                </Section>
                             </>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export function SimulatorView({ troopConfigs, trainingConfigs, defenseConfigs }: SimulatorViewProps) {
    const [isPending, startTransition] = useTransition();
    const [attackerState, setAttackerState] = useState<SimulatorColumnState>(initialColumnState);
    const [defenderState, setDefenderState] = useState<SimulatorColumnState>(initialColumnState);
    const [battleReport, setBattleReport] = useState<BattleReport | null>(null);

    const formatSimulationInput = (state: SimulatorColumnState): SimulationInput => {
        return {
            troops: Object.entries(state.troops).filter(([,qty]) => qty > 0).map(([id, quantity]) => ({ id, quantity })),
            trainings: Object.entries(state.trainings).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
            defenses: Object.entries(state.defenses).filter(([,lvl]) => lvl > 0).map(([id, level]) => ({ id, level })),
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
    
    const handleResetAll = () => {
        setAttackerState(initialColumnState);
        setDefenderState(initialColumnState);
        setBattleReport(null);
    }

    const winnerText = battleReport?.winner === 'attacker' ? 'ATACANTE GANA' : battleReport?.winner === 'defender' ? 'DEFENSOR GANA' : 'EMPATE';
    const winnerColor = battleReport?.winner === 'attacker' ? 'text-green-500' : battleReport?.winner === 'defender' ? 'text-red-500' : 'text-yellow-500';

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Simulador de Batalla</h2>
                    <p className="text-muted-foreground">
                        Calcula los resultados de posibles enfrentamientos.
                    </p>
                </div>
                 <Button onClick={handleResetAll} variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reiniciar Simulador
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SimulatorColumn 
                    title="Atacante"
                    state={attackerState}
                    setState={setAttackerState}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                />
                <SimulatorColumn 
                    title="Defensor"
                    state={defenderState}
                    setState={setDefenderState}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                    isDefender
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSimulate} disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simular Batalla
                </Button>
            </div>

            {battleReport && (
                 <Dialog open={!!battleReport} onOpenChange={(isOpen) => !isOpen && setBattleReport(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Reporte de Batalla</DialogTitle>
                            <DialogDescription className="flex flex-col sm:flex-row justify-between items-baseline">
                                <span>El resultado de la simulación es: <span className={`font-bold ${winnerColor}`}>{winnerText}</span></span>
                                <span className="text-xs text-muted-foreground">Atk: {formatNumber(battleReport.attackerPower)} vs Def: {formatNumber(battleReport.defenderPower)}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                            <Card className="p-4">
                                <CardHeader className="p-0 pb-2">
                                    <CardTitle className="text-lg">Pérdidas del Atacante</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="list-disc list-inside text-sm text-red-400">
                                        {battleReport.attackerLosses.length > 0 ? battleReport.attackerLosses.map(loss => (
                                            <li key={`attacker-loss-${loss.id}`}>{troopConfigs.find(t=>t.id === loss.id)?.nombre}: {formatNumber(loss.quantity)}</li>
                                        )) : <li>Sin pérdidas</li>}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="p-4">
                                <CardHeader className="p-0 pb-2">
                                     <CardTitle className="text-lg">Pérdidas del Defensor</CardTitle>
                                </CardHeader>
                               <CardContent className="p-0">
                                    <ul className="list-disc list-inside text-sm text-red-400">
                                        {battleReport.defenderLosses.length > 0 ? battleReport.defenderLosses.map(loss => (
                                            <li key={`defender-loss-${loss.id}`}>{troopConfigs.find(t=>t.id === loss.id)?.nombre}: {formatNumber(loss.quantity)}</li>
                                        )) : <li>Sin pérdidas</li>}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                         <Card className="p-4">
                            <CardHeader className="p-0 pb-2">
                                <CardTitle className="text-lg">Recursos Saqueados</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="text-sm grid grid-cols-2 gap-2">
                                    <p>Armas: <span className="font-mono text-green-400">{formatNumber(battleReport.lootedResources.armas)}</span></p>
                                    <p>Munición: <span className="font-mono text-green-400">{formatNumber(battleReport.lootedResources.municion)}</span></p>
                                    <p>Dólares: <span className="font-mono text-green-400">{formatNumber(battleReport.lootedResources.dolares)}</span></p>
                                    <p>Alcohol: <span className="font-mono text-green-400">{formatNumber(battleReport.lootedResources.alcohol)}</span></p>
                                </div>
                            </CardContent>
                        </Card>
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

