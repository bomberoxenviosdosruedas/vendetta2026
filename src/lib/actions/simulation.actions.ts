
'use server';

import { getTrainingConfigurations, getTroopConfigurations } from '../data';
import { calcularStatsTropaConBonus } from '../formulas/troop-formulas';
import type { ConfiguracionTropa } from '@prisma/client';

interface TroopData {
    id: string;
    quantity: number;
}

interface TrainingData {
    id: string;
    level: number;
}

interface DefenseData {
    id: string;
    level: number;
}

export interface SimulationInput {
    troops: TroopData[];
    trainings: TrainingData[];
    defenses: DefenseData[];
    buildingsLevel: number;
}

export interface BattleReport {
    winner: 'attacker' | 'defender' | 'draw';
    rounds: BattleRoundReport[];
    finalStats: CombatStats;
    finalMessage: string;
}

export interface BattleRoundReport {
    round: number;
    attacker: RoundParticipantReport;
    defender: RoundParticipantReport;
}

export interface RoundParticipantReport {
    troops: {
        id: string;
        nombre: string;
        initialQuantity: number;
        lostQuantity: number;
    }[];
    totalAttack: number;
    totalDefense: number;
}

export interface CombatStats {
    attacker: {
        troopsLost: number;
        pointsLost: number;
        resourcesLost: ResourceCost;
    };
    defender: {
        troopsLost: number;
        pointsLost: number;
        resourcesLost: ResourceCost;
    };
}

interface ResourceCost {
    armas: number;
    municion: number;
    dolares: number;
}

interface ArmyUnit {
    id: string;
    nombre: string;
    config: ConfiguracionTropa;
    quantity: number;
    attack: number;
    defense: number;
}

function calculateResourceLoss(lostTroops: ArmyUnit[]): ResourceCost {
    return lostTroops.reduce((total, unit) => {
        total.armas += unit.config.costoArmas * unit.quantity;
        total.municion += unit.config.costoMunicion * unit.quantity;
        total.dolares += unit.config.costoDolares * unit.quantity;
        return total;
    }, { armas: 0, municion: 0, dolares: 0 });
}


export async function runBattleSimulation(attacker: SimulationInput, defender: SimulationInput): Promise<BattleReport> {
    const [troopConfigs, trainingConfigs] = await Promise.all([
        getTroopConfigurations(),
        getTrainingConfigurations()
    ]);
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));
    const trainingConfigsMap = new Map(trainingConfigs.map(t => [t.id, t]));

    const buildArmy = (simInput: SimulationInput): ArmyUnit[] => {
        const userTrainings = simInput.trainings.map(t => ({
            configuracionEntrenamientoId: t.id,
            nivel: t.level,
            configuracion: trainingConfigsMap.get(t.id)!
        }));

        return simInput.troops.map(troop => {
            const config = troopConfigsMap.get(troop.id);
            if (!config) return null;
            const { ataqueActual, defensaActual } = calcularStatsTropaConBonus(config, userTrainings as any);
            return {
                id: troop.id,
                nombre: config.nombre,
                config,
                quantity: troop.quantity,
                attack: ataqueActual,
                defense: defensaActual,
            };
        }).filter((u): u is ArmyUnit => u !== null && u.quantity > 0);
    };

    let attackerArmy = buildArmy(attacker);
    let defenderArmy = buildArmy(defender);
    
    const initialAttackerArmy = JSON.parse(JSON.stringify(attackerArmy));
    const initialDefenderArmy = JSON.parse(JSON.stringify(defenderArmy));

    const battleRounds: BattleRoundReport[] = [];
    let finalMessage = "";

    for (let i = 1; i <= 5; i++) {
        const attackerTroopCount = attackerArmy.reduce((sum, u) => sum + u.quantity, 0);
        const defenderTroopCount = defenderArmy.reduce((sum, u) => sum + u.quantity, 0);

        if (attackerTroopCount === 0 || defenderTroopCount === 0) {
            if(attackerTroopCount === 0) finalMessage = "Todas las tropas atacantes han sido destruidas.";
            if(defenderTroopCount === 0) finalMessage = "Todas las tropas defensoras han sido destruidas.";
            break;
        }

        const roundAttackerArmy = JSON.parse(JSON.stringify(attackerArmy));
        const roundDefenderArmy = JSON.parse(JSON.stringify(defenderArmy));

        const attackerTotalAttack = attackerArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        const defenderTotalAttack = defenderArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        
        const defenseBonus = defender.defenses.reduce((sum, d) => sum + (d.level * 0.05), 1) * (1 + (defender.buildingsLevel * 0.1));
        const attackerTotalDefense = attackerArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0);
        const defenderTotalDefense = defenderArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0) * defenseBonus;
        
        const attackerLossRate = defenderTotalAttack > attackerTotalDefense ? 1 : defenderTotalAttack / (attackerTotalDefense || 1);
        const defenderLossRate = attackerTotalAttack > defenderTotalDefense ? 1 : attackerTotalAttack / (defenderTotalDefense || 1);

        const attackerLossesThisRound = attackerArmy.map(u => ({ ...u, quantity: Math.floor(u.quantity * attackerLossRate) }));
        const defenderLossesThisRound = defenderArmy.map(u => ({ ...u, quantity: Math.floor(u.quantity * defenderLossRate) }));

        attackerArmy.forEach(u => u.quantity -= Math.floor(u.quantity * attackerLossRate));
        defenderArmy.forEach(u => u.quantity -= Math.floor(u.quantity * defenderLossRate));
        
        battleRounds.push({
            round: i,
            attacker: {
                troops: roundAttackerArmy.map((u: ArmyUnit) => ({
                    id: u.id,
                    nombre: u.nombre,
                    initialQuantity: u.quantity,
                    lostQuantity: attackerLossesThisRound.find(l => l.id === u.id)?.quantity || 0,
                })),
                totalAttack: attackerTotalAttack,
                totalDefense: attackerTotalDefense
            },
            defender: {
                troops: roundDefenderArmy.map((u: ArmyUnit) => ({
                    id: u.id,
                    nombre: u.nombre,
                    initialQuantity: u.quantity,
                    lostQuantity: defenderLossesThisRound.find(l => l.id === u.id)?.quantity || 0,
                })),
                totalAttack: defenderTotalAttack,
                totalDefense: defenderTotalDefense,
            },
        });
    }

    const finalAttackerTroops = new Map(attackerArmy.map(u => [u.id, u.quantity]));
    const finalDefenderTroops = new Map(defenderArmy.map(u => [u.id, u.quantity]));
    
    const totalAttackerLossesArray: ArmyUnit[] = initialAttackerArmy.map((u: ArmyUnit) => ({ ...u, quantity: u.quantity - (finalAttackerTroops.get(u.id) || 0)}));
    const totalDefenderLossesArray: ArmyUnit[] = initialDefenderArmy.map((u: ArmyUnit) => ({...u, quantity: u.quantity - (finalDefenderTroops.get(u.id) || 0)}));

    const finalStats: CombatStats = {
        attacker: {
            troopsLost: totalAttackerLossesArray.reduce((s, u) => s + u.quantity, 0),
            pointsLost: totalAttackerLossesArray.reduce((s, u) => s + u.config.puntos * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalAttackerLossesArray)
        },
        defender: {
            troopsLost: totalDefenderLossesArray.reduce((s, u) => s + u.quantity, 0),
            pointsLost: totalDefenderLossesArray.reduce((s, u) => s + u.config.puntos * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalDefenderLossesArray)
        }
    }

    const attackerHasTroops = attackerArmy.some(u => u.quantity > 0);
    const defenderHasTroops = defenderArmy.some(u => u.quantity > 0);
    
    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if(attackerHasTroops && !defenderHasTroops) winner = 'attacker';
    else if (!attackerHasTroops && defenderHasTroops) winner = 'defender';


    if (!finalMessage) {
        finalMessage = winner === 'attacker' ? "El atacante ha ganado la batalla." : winner === 'defender' ? "El defensor ha repelido el ataque." : "La batalla ha terminado en empate.";
    }

    return { winner, rounds: battleRounds, finalStats, finalMessage };
}
