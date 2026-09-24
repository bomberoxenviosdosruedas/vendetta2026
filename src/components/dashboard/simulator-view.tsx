'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BattleReport, runBattleSimulation, SimulationInput } from '@/lib/actions/simulation.actions';
import type { ConfiguracionTropa, ConfiguracionEntrenamiento, ConfiguracionHabitacion } from '@prisma/client';
import MaterialIcon from '@/components/ui/material-icon';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
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
    propertyCount: number;
}

const initialColumnState: SimulatorColumnState = {
    troops: {},
    trainings: {},
    defenses: {},
    buildingsLevel: 1,
    propertyCount: 1,
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <h3 className="text-xs font-bold font-['Chivo'] uppercase text-[#801e00] border-b border-[#cbc4b0] pb-0.5">{title}</h3>
        <div className="space-y-1.5">{children}</div>
    </div>
);

const InputRow = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(parseInt(val, 10) || 0);
    };

    return (
        <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
            <Label htmlFor={label} className="text-xs truncate pr-2 text-[#221c13] font-bold">{label}</Label>
            <Input
                id={label}
                type="number"
                min="0"
                value={value || ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-24 h-7 bg-[#eee8d5] border border-[#4a3e29] text-[#111] font-bold text-center text-xs"
            />
        </div>
    );
};

function formatNumber(num: number): string {
    if(num === undefined || num === null) return "0";
    return Math.floor(num).toLocaleString('de-DE');
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
        section: keyof Omit<SimulatorColumnState, 'buildingsLevel' | 'propertyCount'>,
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

     const handleGeneralValueChange = (field: 'buildingsLevel' | 'propertyCount', value: number) => {
         setState(prev => ({ ...prev, [field]: value }));
    }

    const handleClear = () => {
        setState(initialColumnState);
    }

    return (
        <div className="v-outer-frame flex flex-col h-full bg-[#f1ebda]">
            <div className="crimson-th p-2 flex items-center justify-between">
                <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">{title}</span>
                <div className="flex items-center gap-1">
                    <button onClick={onLoadData} className="retro-btn text-[10px] px-2 py-1 font-bold flex items-center gap-1">
                        <MaterialIcon name="upload" size={14} />
                        Cargar Datos
                    </button>
                    <button onClick={handleClear} className="retro-btn-dark p-1 rounded-sm text-xs" title={`Limpiar ${title}`}>
                        <MaterialIcon name="delete" size={14} />
                    </button>
                </div>
            </div>

            <div className="p-3 flex-grow">
                <ScrollArea className="h-96 pr-2">
                    <div className="space-y-3">
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

                        {isDefender && (
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

                        <Section title="General">
                            <InputRow
                                label="Nº Propiedades"
                                value={state.propertyCount}
                                onChange={(val) => handleGeneralValueChange('propertyCount', val)}
                            />
                            {isDefender && (
                                <InputRow
                                    label="Nivel Edificios (Defensa)"
                                    value={state.buildingsLevel}
                                    onChange={(val) => handleGeneralValueChange('buildingsLevel', val)}
                                />
                            )}
                        </Section>
                    </div>
                </ScrollArea>
            </div>
        </div>
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
            buildingsLevel: state.buildingsLevel,
            propertyCount: state.propertyCount
        };
    };

    const handleLoadUserData = (column: 'attacker' | 'defender') => {
        if (!selectedProperty) return;

        const troops = Object.fromEntries(
            selectedProperty.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad])
        );

        const trainings = Object.fromEntries(
            user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel])
        );

        const defenses = Object.fromEntries(
            selectedProperty.habitaciones.filter(h => defenseConfigs.some(dc => dc.id === h.configuracionHabitacionId))
            .map(h => [h.configuracionHabitacionId, h.nivel])
        );

        const newState: SimulatorColumnState = {
            troops,
            trainings,
            defenses: column === 'defender' ? defenses : {},
            buildingsLevel: 1,
            propertyCount: user.propiedades.length || 1,
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

    return (
        <div className="space-y-3 w-full">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        SIMULADOR TÁCTICO DE COMBATE
                    </span>
                    <button onClick={handleResetAll} className="retro-btn text-xs px-2.5 py-1 font-bold flex items-center gap-1">
                        <MaterialIcon name="delete" size={14} />
                        Reiniciar
                    </button>
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 md:grid-cols-2 gap-3">
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

                <div className="p-3 bg-[#e5dfcb] border-t border-[#cbc4b0]">
                    <button
                        onClick={handleSimulate}
                        disabled={isPending}
                        className="retro-btn w-full text-xs font-['Chivo'] font-bold py-2.5 min-h-[44px] flex items-center justify-center gap-2"
                    >
                        {isPending ? 'SIMULANDO ENFRENTAMIENTO...' : 'SIMULAR ENFRENTAMIENTO TÁCTICO'}
                    </button>
                </div>
            </section>

            {battleReport && (
                 <Dialog open={!!battleReport} onOpenChange={(isOpen) => !isOpen && setBattleReport(null)}>
                    <DialogContent className="max-w-4xl bg-[#161410] border-2 border-[#5a4b33] text-[#dfdbc9]">
                        <DialogHeader>
                            <DialogTitle className="crimson-th p-2 text-center text-sm uppercase tracking-wider font-['Chivo'] font-bold">
                                INFORME TÁCTICO DE BATALLA
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[70vh]">
                            <div className="space-y-4 p-2">
                                {battleReport.rounds.map(round => (
                                    <div key={round.round} className="v-outer-frame overflow-hidden">
                                        <div className="v-header-c text-center font-bold font-['Chivo'] py-1">
                                            RONDA DE BATALLA {round.round}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-[#f1ebda]">
                                            <div>
                                                <h4 className='font-bold text-center text-xs mb-1 text-[#801e00]'>Atacante</h4>
                                                <Table className="text-xs font-['JetBrains_Mono']">
                                                    <TableHeader>
                                                        <TableRow className="border-b-[#cbc4b0]">
                                                            <TableHead className="text-[#221c13]">Tropa</TableHead>
                                                            <TableHead className="text-right text-[#221c13]">Cant.</TableHead>
                                                            <TableHead className="text-right text-[#c00000]">Pérdidas</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {round.attacker.troops.map(t => (
                                                            <TableRow key={t.id} className="border-b-[#cbc4b0]">
                                                                <TableCell className="text-[#221c13] font-bold">{t.nombre}</TableCell>
                                                                <TableCell className="text-right text-[#221c13]">{formatNumber(t.initialQuantity)}</TableCell>
                                                                <TableCell className="text-right text-[#c00000] font-bold">{formatNumber(t.lostQuantity)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            <div>
                                                <h4 className='font-bold text-center text-xs mb-1 text-[#801e00]'>Defensor</h4>
                                                <Table className="text-xs font-['JetBrains_Mono']">
                                                    <TableHeader>
                                                        <TableRow className="border-b-[#cbc4b0]">
                                                            <TableHead className="text-[#221c13]">Tropa</TableHead>
                                                            <TableHead className="text-right text-[#221c13]">Cant.</TableHead>
                                                            <TableHead className="text-right text-[#c00000]">Pérdidas</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {round.defender.troops.map(t => (
                                                            <TableRow key={t.id} className="border-b-[#cbc4b0]">
                                                                <TableCell className="text-[#221c13] font-bold">{t.nombre}</TableCell>
                                                                <TableCell className="text-right text-[#221c13]">{formatNumber(t.initialQuantity)}</TableCell>
                                                                <TableCell className="text-right text-[#c00000] font-bold">{formatNumber(t.lostQuantity)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {battleReport.finalMessage && <p className="text-center font-bold text-sm text-[#ffe569] py-2">{battleReport.finalMessage}</p>}
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild>
                                <button className="retro-btn-dark w-full py-2 text-xs font-bold min-h-[44px]">CERRAR INFORME</button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
