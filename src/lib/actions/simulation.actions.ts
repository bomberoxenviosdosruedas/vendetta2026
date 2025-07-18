
'use server';

import { revalidatePath } from "next/cache";

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
    attackerPower: number;
    defenderPower: number;
    attackerLosses: TroopData[];
    defenderLosses: TroopData[];
    lootedResources: {
        armas: number;
        municion: number;
        dolares: number;
        alcohol: number;
    };
    log: string[];
}

// Placeholder function for battle simulation
export async function runBattleSimulation(attacker: SimulationInput, defender: SimulationInput): Promise<BattleReport> {
    
    // --- Lógica de Simulación de Placeholder ---
    // Esta es una implementación muy básica. Se puede expandir con fórmulas complejas.
    
    const log: string[] = [];

    log.push("Iniciando simulación de batalla...");

    // 1. Calcular el poder de cada bando (ejemplo simple)
    const attackerPower = attacker.troops.reduce((sum, t) => sum + (t.quantity * 1.5), 0) + 
                          attacker.trainings.reduce((sum, t) => sum + (t.level * 5), 0);
    
    const defenderPower = defender.troops.reduce((sum, t) => sum + t.quantity, 0) + 
                          defender.trainings.reduce((sum, t) => sum + (t.level * 5), 0) +
                          defender.defenses.reduce((sum, d) => sum + (d.level * 10), 0) +
                          (defender.buildingsLevel * 10);

    log.push(`Poder del Atacante: ${attackerPower.toFixed(2)}`);
    log.push(`Poder del Defensor: ${defenderPower.toFixed(2)}`);

    // 2. Determinar el ganador
    let winner: 'attacker' | 'defender' | 'draw';
    const powerRatio = attackerPower / (defenderPower || 1);

    if (powerRatio > 1.2) {
        winner = 'attacker';
        log.push("El atacante tiene una ventaja decisiva.");
    } else if (powerRatio < 0.8) {
        winner = 'defender';
        log.push("El defensor tiene una ventaja decisiva.");
    } else {
        winner = 'draw';
        log.push("La batalla está muy reñida, resultando en un empate.");
    }

    // 3. Calcular pérdidas (ejemplo simple con aleatoriedad)
    const calculateLosses = (troops: TroopData[], lossFactor: number): TroopData[] => {
        return troops.map(t => ({
            id: t.id,
            quantity: Math.min(t.quantity, Math.floor(t.quantity * (Math.random() * 0.2 + lossFactor))) // Pierde entre X% y X+20%
        }));
    };

    let attackerLossFactor = 0.1;
    let defenderLossFactor = 0.1;

    if (winner === 'attacker') {
        defenderLossFactor = 0.4;
    } else if (winner === 'defender') {
        attackerLossFactor = 0.4;
    } else { // draw
        attackerLossFactor = 0.25;
        defenderLossFactor = 0.25;
    }

    const attackerLosses = calculateLosses(attacker.troops, attackerLossFactor);
    const defenderLosses = calculateLosses(defender.troops, defenderLossFactor);

    log.push(`Pérdidas del atacante calculadas.`);
    log.push(`Pérdidas del defensor calculadas.`);

    // 4. Calcular recursos saqueados (si gana el atacante)
    const lootedResources = {
        armas: winner === 'attacker' ? Math.floor(Math.random() * 5000) : 0,
        municion: winner === 'attacker' ? Math.floor(Math.random() * 5000) : 0,
        dolares: winner === 'attacker' ? Math.floor(Math.random() * 10000) : 0,
        alcohol: winner === 'attacker' ? Math.floor(Math.random() * 2000) : 0,
    };

    if (winner === 'attacker') {
        log.push("Recursos saqueados por el atacante.");
    }

    // 5. Construir el reporte final
    const report: BattleReport = {
        winner,
        attackerPower,
        defenderPower,
        attackerLosses,
        defenderLosses,
        lootedResources,
        log,
    };

    revalidatePath('/simulator'); // Revalidar la página del simulador si es necesario

    return report;
}
