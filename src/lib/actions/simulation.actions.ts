
'use server';

import { getTrainingConfigurations, getTroopConfigurations } from '../data';
import { calcularStatsTropaConBonus } from '../formulas/troop-formulas';

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
    rounds: BattleRoundReport[];
}

export interface BattleRoundReport {
    round: number;
    attackerAttack: number;
    defenderAttack: number;
    attackerTroopsLeft: TroopData[];
    defenderTroopsLeft: TroopData[];
}

interface ArmyUnit {
    id: string;
    quantity: number;
    attack: number;
    defense: number;
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
                quantity: troop.quantity,
                attack: ataqueActual,
                defense: defensaActual,
            };
        }).filter((u): u is ArmyUnit => u !== null);
    };

    let attackerArmy = buildArmy(attacker);
    let defenderArmy = buildArmy(defender);
    
    const initialAttackerTroops = JSON.parse(JSON.stringify(attackerArmy));
    const initialDefenderTroops = JSON.parse(JSON.stringify(defenderArmy));

    const defenseBonus = defender.defenses.reduce((sum, d) => sum + (d.level * 5), 0) + (defender.buildingsLevel * 10);
    const initialDefenderPower = defenderArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0) + defenseBonus;
    const initialAttackerPower = attackerArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);

    const log: string[] = ["Iniciando simulación..."];
    const rounds: BattleRoundReport[] = [];

    for (let i = 1; i <= 5; i++) {
        if (attackerArmy.length === 0 || defenderArmy.length === 0) break;

        const attackerTotalAttack = attackerArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        const defenderTotalAttack = defenderArmy.reduce((sum, u) => sum + u.attack * u.quantity, 0);
        
        const defenderTotalDefense = defenderArmy.reduce((sum, u) => sum + u.defense * u.quantity, 0) + defenseBonus;
        
        let attackerDamageDealt = defenderTotalAttack;
        let defenderDamageDealt = attackerTotalAttack;

        const distributeDamage = (army: ArmyUnit[], damage: number): ArmyUnit[] => {
            let remainingDamage = damage;
            const armyCopy = JSON.parse(JSON.stringify(army));
            
            while(remainingDamage > 0 && armyCopy.some((u: ArmyUnit) => u.quantity > 0)) {
                const totalDefensePoints = armyCopy.reduce((sum: number, u: ArmyUnit) => sum + (u.defense * u.quantity), 0);
                if (totalDefensePoints === 0) break;
                
                let damageDealtInLoop = false;
                for(const unit of armyCopy) {
                    if (unit.quantity > 0) {
                        const proportion = (unit.defense * unit.quantity) / totalDefensePoints;
                        const damageToUnit = Math.floor(remainingDamage * proportion);
                        const losses = Math.min(unit.quantity, Math.floor(damageToUnit / (unit.defense || 1)));
                        unit.quantity -= losses;
                        remainingDamage -= losses * unit.defense;
                        if(losses > 0) damageDealtInLoop = true;
                    }
                }
                if(!damageDealtInLoop && remainingDamage > 0) {
                    const randomUnit = armyCopy.find((u: ArmyUnit) => u.quantity > 0);
                    if(randomUnit) {
                        randomUnit.quantity--;
                        remainingDamage -= randomUnit.defense;
                    } else {
                        break;
                    }
                }
            }
            return armyCopy.filter((u: ArmyUnit) => u.quantity > 0);
        };

        const newAttackerArmy = distributeDamage(attackerArmy, attackerDamageDealt);
        const newDefenderArmy = distributeDamage(defenderArmy, defenderDamageDealt);

        rounds.push({
            round: i,
            attackerAttack: attackerTotalAttack,
            defenderAttack: defenderTotalAttack,
            attackerTroopsLeft: newAttackerArmy.map(u => ({id: u.id, quantity: u.quantity})),
            defenderTroopsLeft: newDefenderArmy.map(u => ({id: u.id, quantity: u.quantity})),
        });

        attackerArmy = newAttackerArmy;
        defenderArmy = newDefenderArmy;
    }
    
    const finalAttackerTroops = new Map(attackerArmy.map(u => [u.id, u.quantity]));
    const finalDefenderTroops = new Map(defenderArmy.map(u => [u.id, u.quantity]));

    const attackerLosses = initialAttackerTroops.map((u: ArmyUnit) => ({
        id: u.id,
        quantity: u.quantity - (finalAttackerTroops.get(u.id) || 0)
    }));

    const defenderLosses = initialDefenderTroops.map((u: ArmyUnit) => ({
        id: u.id,
        quantity: u.quantity - (finalDefenderTroops.get(u.id) || 0)
    }));
    
    const attackerHasTroops = attackerArmy.some(u => u.quantity > 0);
    const defenderHasTroops = defenderArmy.some(u => u.quantity > 0);

    let winner: 'attacker' | 'defender' | 'draw' = 'draw';
    if(attackerHasTroops && !defenderHasTroops) {
        winner = 'attacker';
    } else if (!attackerHasTroops && defenderHasTroops) {
        winner = 'defender';
    }

    const lootedResources = {
        armas: winner === 'attacker' ? Math.floor(Math.random() * 5000) : 0,
        municion: winner === 'attacker' ? Math.floor(Math.random() * 5000) : 0,
        dolares: winner === 'attacker' ? Math.floor(Math.random() * 10000) : 0,
        alcohol: winner === 'attacker' ? Math.floor(Math.random() * 2000) : 0,
    };

    return {
        winner,
        attackerPower: initialAttackerPower,
        defenderPower: initialDefenderPower,
        attackerLosses,
        defenderLosses,
        lootedResources,
        log,
        rounds,
    };
}
