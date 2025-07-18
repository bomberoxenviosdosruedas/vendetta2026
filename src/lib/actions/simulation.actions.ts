
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

type BattleSide = {
    [key: string]: {
        total: number;
    }
}

type BattleTroops = {
    [key: string]: {
        a: BattleSide[string];
        d: BattleSide[string];
    }
}

// --- OUTPUT REPORT TYPES ---

interface RoundTroopInfo {
    a: number; // initial quantity attacker
    muertesA: number;
    d: number; // initial quantity defender
    muertesD: number;
}

export interface BattleRoundReport {
    round: number;
    tropas: Record<string, RoundTroopInfo>;
    ataquesA: [string, string, number][]; // [attacker, defender, deaths]
    ataquesD: [string, string, number][]; // [attacker, defender, deaths]
    PAA: number; // Poder Ataque Atacante
    PDA: number; // Poder Defensa Atacante
    PAD: number; // Poder Ataque Defensor
    PDD: number; // Poder Defensa Defensor
}

export interface BattleReport {
    winner: 'attacker' | 'defender' | 'draw';
    rounds: BattleRoundReport[];
    tropasRestantes: BattleTroops;
}


// --- HELPER FUNCTIONS (Translated from PHP) ---

function getRival(tropaId: string, enemigos: BattleTroops, quien: 'a' | 'd'): string | null {
    let maxTropas = { trp: null as string | null, total: 0 };
    for (const tropaEnemiga in enemigos) {
        if (Math.round(enemigos[tropaEnemiga][quien].total) <= 0) continue;
        
        if (enemigos[tropaEnemiga][quien].total > maxTropas.total) {
            maxTropas = { trp: tropaEnemiga, total: enemigos[tropaEnemiga][quien].total };
        }
    }
    return maxTropas.trp;
}

function fightMod(
    attackerId: string, 
    defenderId: string,
    tropasBatalla: BattleTroops,
    attackerArmy: ArmyUnit[],
    defenderArmy: ArmyUnit[]
): { a: number, d: number, PAA: number, PDA: number, PAD: number, PDD: number } {
    
    const attackerTroop = attackerArmy.find(t => t.id === attackerId);
    const defenderTroop = defenderArmy.find(t => t.id === defenderId);

    if (!attackerTroop || !defenderTroop) {
        return { a: 0, d: 0, PAA: 0, PDA: 0, PAD: 0, PDD: 0 };
    }

    const attackerCount = tropasBatalla[attackerId]?.a.total || 0;
    const defenderCount = tropasBatalla[defenderId]?.d.total || 0;

    const PAA = attackerTroop.attack * attackerCount;
    const PDA = attackerTroop.defense * attackerCount;
    const PAD = defenderTroop.attack * defenderCount;
    const PDD = defenderTroop.defense * defenderCount;

    const totalDefenseAttacker = PDD > 0 ? PAA / PDD : PAA;
    const totalDefenseDefender = PDA > 0 ? PAD / PDA : PAD;
    
    const PPA = totalDefenseDefender > 1 ? 1 : totalDefenseDefender;
    const PPD = totalDefenseAttacker > 1 ? 1 : totalDefenseAttacker;

    const muertesA = attackerCount * PPA;
    const muertesD = defenderCount * PPD;

    return { 
        a: Math.round(muertesA), 
        d: Math.round(muertesD), 
        PAA, PDA, PAD, PDD 
    };
}


// --- MAIN SERVER ACTION ---
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
                id: troop.id, nombre: config.nombre, config,
                quantity: troop.quantity, attack: ataqueActual, defense: defensaActual,
            };
        }).filter((u): u is ArmyUnit => u !== null && u.quantity > 0);
    };

    const attackerArmy = buildArmy(attacker);
    const defenderArmy = buildArmy(defender);
    
    // Apply defense bonus to defender army
    const defenseBonus = defender.defenses.reduce((sum, d) => sum + (d.level * 0.05), 1) * (1 + (defender.buildingsLevel * 0.1));
    defenderArmy.forEach(unit => {
        unit.defense = Math.floor(unit.defense * defenseBonus);
    });

    const tropasBatalla: BattleTroops = {};
    troopConfigs.forEach(t => {
        tropasBatalla[t.id] = {
            a: { total: attacker.troops.find(ut => ut.id === t.id)?.quantity || 0 },
            d: { total: defender.troops.find(ut => ut.id === t.id)?.quantity || 0 }
        };
    });

    const dataBatalla: BattleRoundReport[] = [];
    let ronda = 1;

    while (ronda <= 5) {
        let hayTropasAtacante = Object.values(tropasBatalla).some(t => t.a.total > 0);
        let hayTropasDefensor = Object.values(tropasBatalla).some(t => t.d.total > 0);

        if (!hayTropasAtacante || !hayTropasDefensor) break;

        const rondaData: BattleRoundReport = {
            round: ronda,
            tropas: {},
            ataquesA: [],
            ataquesD: [],
            PAA: 0, PAD: 0, PDA: 0, PDD: 0
        };

        const tropasInicialesRonda = JSON.parse(JSON.stringify(tropasBatalla));
        for(const tropaId in tropasInicialesRonda) {
            rondaData.tropas[tropaId] = {
                a: tropasInicialesRonda[tropaId].a.total,
                d: tropasInicialesRonda[tropaId].d.total,
                muertesA: 0,
                muertesD: 0
            };
        }

        let PAA = 0, PDA = 0, PAD = 0, PDD = 0;

        // Attacker's turn
        for (const tropaId in tropasBatalla) {
            if (Math.round(tropasBatalla[tropaId].a.total) <= 0) continue;
            
            const enemigoId = getRival(tropaId, tropasBatalla, 'd');
            if (!enemigoId) break;

            const muertes = fightMod(tropaId, enemigoId, tropasBatalla, attackerArmy, defenderArmy);
            PAA += muertes.PAA; PDA += muertes.PDA; PAD += muertes.PAD; PDD += muertes.PDD;
            
            rondaData.tropas[tropaId].muertesA += muertes.a;
            rondaData.tropas[enemigoId].muertesD += muertes.d;
            rondaData.ataquesA.push([tropaId, enemigoId, muertes.d]);
            
            tropasBatalla[tropaId].a.total -= muertes.a;
            tropasBatalla[enemigoId].d.total -= muertes.d;
        }

        // Defender's turn
        for (const tropaId in tropasBatalla) {
            if (Math.round(tropasBatalla[tropaId].d.total) <= 0) continue;

            const enemigoId = getRival(tropaId, tropasBatalla, 'a');
            if (!enemigoId) break;

            const muertes = fightMod(enemigoId, tropaId, tropasBatalla, attackerArmy, defenderArmy);
            PAA += muertes.PAA; PDA += muertes.PDA; PAD += muertes.PAD; PDD += muertes.PDD;
            
            rondaData.tropas[enemigoId].muertesA += muertes.a;
            rondaData.tropas[tropaId].muertesD += muertes.d;
            rondaData.ataquesD.push([enemigoId, tropaId, muertes.a]);
            
            tropasBatalla[enemigoId].a.total -= muertes.a;
            tropasBatalla[tropaId].d.total -= muertes.d;
        }

        rondaData.PAA = Math.round(PAA);
        rondaData.PDA = Math.round(PDA);
        rondaData.PAD = Math.round(PAD);
        rondaData.PDD = Math.round(PDD);

        dataBatalla.push(rondaData);
        ronda++;
    }

    const tropasAtacanteRestantes = Object.values(tropasBatalla).some(t => t.a.total > 0);
    const tropasDefensorRestantes = Object.values(tropasBatalla).some(t => t.d.total > 0);

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if(tropasAtacanteRestantes && !tropasDefensorRestantes) winner = 'attacker';
    else if (!tropasAtacanteRestantes && tropasDefensorRestantes) winner = 'defender';
    
    return { winner, rounds: dataBatalla, tropasRestantes: tropasBatalla };
}
