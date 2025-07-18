
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BattleReport, runBattleSimulation, SimulationInput } from '@/lib/actions/simulation.actions';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import { Loader2, Trash2, Upload } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from '../ui/scroll-area';
import { UserWithProgress } from '@/lib/data';
import { useProperty } from '@/contexts/property-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface SimulatorViewProps {
    user: UserWithProgress;
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
    if(num === undefined || num === null) return "0";
    return num.toLocaleString('de-DE');
}

function SimulatorColumn({
    title,
    state,
    setState,
    troopConfigs,
    trainingConfigs,
    defenseConfigs,
    onLoadData,
    isDefender = false,
}: {
    title: string;
    state: SimulatorColumnState;
    setState: React.Dispatch<React.SetStateAction<SimulatorColumnState>>;
    troopConfigs: ConfiguracionTropa[];
    trainingConfigs: ConfiguracionEntrenamiento[];
    defenseConfigs: ConfiguracionHabitacion[];
    onLoadData: () => void;
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
                <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" onClick={onLoadData}>
                        <Upload className="mr-2 h-4 w-4" />
                        Cargar mis datos
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Limpiar {title}</span>
                    </Button>
                </div>
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
                                    ))}</Section>
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

export function SimulatorView({ user, troopConfigs, trainingConfigs, defenseConfigs }: SimulatorViewProps) {
    const { selectedProperty } = useProperty();
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

    const handleLoadUserData = (column: 'attacker' | 'defender') => {
        if (!selectedProperty) return;

        const troops = Object.fromEntries(
            selectedProperty.tropas.map(t => [t.configuracionTropaId, t.cantidad])
        );

        const trainings = Object.fromEntries(
            user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel])
        );

        const newState = {
            troops,
            trainings,
            defenses: {},
            buildingsLevel: 1 
        };

        if (column === 'attacker') {
            setAttackerState(newState);
        } else {
            setDefenderState(newState);
        }
    }


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

    const finalMessage = battleReport ?
        battleReport.winner === 'attacker' ? "El atacante ha ganado la batalla." :
        battleReport.winner === 'defender' ? "El defensor ha repelido el ataque." : "La batalla ha terminado en empate."
        : "";

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
                    onLoadData={() => handleLoadUserData('attacker')}
                />
                <SimulatorColumn 
                    title="Defensor"
                    state={defenderState}
                    setState={setDefenderState}
                    troopConfigs={troopConfigs}
                    trainingConfigs={trainingConfigs}
                    defenseConfigs={defenseConfigs}
                    isDefender
                    onLoadData={() => handleLoadUserData('defender')}
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
                    <DialogContent className="max-w-4xl bg-black/80 border-primary text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-center text-primary tracking-widest">
                                INFORME DE BATALLA
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[70vh]">
                            <div className="space-y-4 pr-4">
                                {battleReport.rounds.map(round => (
                                    <div key={round.round} className="space-y-2">
                                        <div className="bg-primary/80 text-primary-foreground text-center font-bold py-1">
                                            RONDA DE BATALLA {round.round}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className='font-bold text-center mb-1'>Atacante</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-b-primary/50">
                                                            <TableHead className="text-white">Tropa</TableHead>
                                                            <TableHead className="text-right text-white">Cant.</TableHead>
                                                            <TableHead className="text-right text-red-500">Pérdidas</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Object.entries(round.tropas).map(([tropaId, data]) => (
                                                            <TableRow key={`attacker-round-${round.round}-${tropaId}`} className="border-b-primary/20">
                                                                <TableCell>{troopConfigs.find(tc => tc.id === tropaId)?.nombre}</TableCell>
                                                                <TableCell className="text-right">{formatNumber(data.a)}</TableCell>
                                                                <TableCell className="text-right text-red-500">{formatNumber(data.muertesA)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div>
                                                 <h4 className='font-bold text-center mb-1'>Defensor</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-b-primary/50">
                                                            <TableHead className="text-white">Tropa</TableHead>
                                                            <TableHead className="text-right text-white">Cant.</TableHead>
                                                            <TableHead className="text-right text-red-500">Pérdidas</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                    {Object.entries(round.tropas).map(([tropaId, data]) => (
                                                            <TableRow key={`defender-round-${round.round}-${tropaId}`} className="border-b-primary/20">
                                                                <TableCell>{troopConfigs.find(tc => tc.id === tropaId)?.nombre}</TableCell>
                                                                <TableCell className="text-right">{formatNumber(data.d)}</TableCell>
                                                                <TableCell className="text-right text-red-500">{formatNumber(data.muertesD)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-primary/80 text-primary-foreground text-center font-bold py-1 mt-2">
                                            ESTADO RONDA {round.round}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 p-2 text-sm font-mono">
                                             <div><span className="font-bold">Ataque Atacante:</span> {formatNumber(round.PAA)}</div>
                                             <div className="text-right"><span className="font-bold">Defensa Defensor:</span> {formatNumber(round.PDD)}</div>
                                             <div><span className="font-bold">Ataque Defensor:</span> {formatNumber(round.PAD)}</div>
                                             <div className="text-right"><span className="font-bold">Defensa Atacante:</span> {formatNumber(round.PDA)}</div>
                                        </div>
                                    </div>
                                ))}

                                <p className="text-center font-bold text-lg pt-4">{finalMessage}</p>

                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button className="w-full bg-red-800 hover:bg-red-700 text-white">Cerrar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
