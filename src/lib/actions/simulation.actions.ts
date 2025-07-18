
'use server';

import { getTrainingConfigurations, getTroopConfigurations } from '../data';
import { calcularStatsTropaConBonus } from '../formulas/troop-formulas';
import type { ConfiguracionTropa } from '@prisma/client';

// --- INPUT TYPES ---
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

// --- BATTLE LOGIC INTERNAL TYPES ---
interface ArmyUnit {
    id: string;
    nombre: string;
    config: ConfiguracionTropa;
    quantity: number;
    attack: number;
    defense: number;
}

// --- OUTPUT REPORT TYPES ---
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

export interface BattleRoundReport {
    round: number;
    attacker: RoundParticipantReport;
    defender: RoundParticipantReport;
}

interface ResourceCost {
    armas: number;
    municion: number;
    dolares: number;
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
export interface BattleReport {
    winner: 'attacker' | 'defender' | 'draw';
    rounds: BattleRoundReport[];
    finalMessage: string;
    finalStats: CombatStats;
}


function calculateResourceLoss(lostTroops: ArmyUnit[], troopConfigsMap: Map<string, ConfiguracionTropa>): ResourceCost {
    return lostTroops.reduce((total, unit) => {
        const config = troopConfigsMap.get(unit.id);
        if(config) {
            total.armas += config.costoArmas * unit.quantity;
            total.municion += config.costoMunicion * unit.quantity;
            total.dolares += config.costoDolares * unit.quantity;
        }
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

    // Apply defense bonus to defender army
    const defenseBonus = defender.defenses.reduce((sum, d) => sum + (d.level * 0.05), 1) * (1 + (defender.buildingsLevel * 0.1));
    defenderArmy.forEach(unit => {
        unit.defense = Math.floor(unit.defense * defenseBonus);
    });

    const battleRounds: BattleRoundReport[] = [];
    let finalMessage = "";
    
    for (let i = 1; i <= 5; i++) {
        const attackerTroopCount = attackerArmy.reduce((sum, u) => sum + u.quantity, 0);
        const defenderTroopCount = defenderArmy.reduce((sum, u) => sum + u.quantity, 0);

        if (attackerTroopCount === 0 || defenderTroopCount === 0) {
            break;
        }

        const roundAttackerArmyBefore = JSON.parse(JSON.stringify(attackerArmy));
        const roundDefenderArmyBefore = JSON.parse(JSON.stringify(defenderArmy));

        const attackerTotalAttack = attackerArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        const defenderTotalAttack = defenderArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        
        const attackerTotalDefense = attackerArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0);
        const defenderTotalDefense = defenderArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0);

        const attackerLossRatio = defenderTotalAttack > attackerTotalDefense ? 1 : defenderTotalAttack / (attackerTotalDefense || 1);
        const defenderLossRatio = attackerTotalAttack > defenderTotalDefense ? 1 : attackerTotalAttack / (defenderTotalDefense || 1);
        
        const attackerLossesThisRound = new Map<string, number>();
        const defenderLossesThisRound = new Map<string, number>();

        attackerArmy.forEach(u => {
            const losses = Math.floor(u.quantity * attackerLossRatio);
            attackerLossesThisRound.set(u.id, losses);
            u.quantity -= losses;
        });

        defenderArmy.forEach(u => {
            const losses = Math.floor(u.quantity * defenderLossRatio);
            defenderLossesThisRound.set(u.id, losses);
            u.quantity -= losses;
        });
        
        battleRounds.push({
            round: i,
            attacker: {
                troops: roundAttackerArmyBefore.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: attackerLossesThisRound.get(t.id) || 0,
                })),
                totalAttack: attackerTotalAttack,
                totalDefense: attackerTotalDefense
            },
            defender: {
                 troops: roundDefenderArmyBefore.map((t: ArmyUnit) => ({
                    id: t.id,
                    nombre: t.nombre,
                    initialQuantity: t.quantity,
                    lostQuantity: defenderLossesThisRound.get(t.id) || 0,
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
            pointsLost: totalAttackerLossesArray.reduce((s, u) => s + (u.config.puntos || 0) * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalAttackerLossesArray, troopConfigsMap)
        },
        defender: {
            troopsLost: totalDefenderLossesArray.reduce((s, u) => s + u.quantity, 0),
            pointsLost: totalDefenderLossesArray.reduce((s, u) => s + (u.config.puntos || 0) * u.quantity, 0),
            resourcesLost: calculateResourceLoss(totalDefenderLossesArray, troopConfigsMap)
        }
    }

    const attackerHasTroops = attackerArmy.some(u => u.quantity > 0);
    const defenderHasTroops = defenderArmy.some(u => u.quantity > 0);
    
    let winner: 'attacker' | 'defender' | 'draw';
    if(attackerHasTroops && !defenderHasTroops) {
        winner = 'attacker';
        finalMessage = "El atacante ha ganado la batalla."
    } else if (!attackerHasTroops && defenderHasTroops) {
        winner = 'defender';
        finalMessage = "El defensor ha repelido el ataque."
    } else if (!attackerHasTroops && !defenderHasTroops) {
        winner = 'draw';
        finalMessage = "Aniquilación mutua. Nadie sobrevive."
    } else {
        winner = 'draw';
        finalMessage = "La batalla ha terminado en empate tras 5 rondas.";
    }

    return { winner, rounds: battleRounds, finalStats, finalMessage };
}
