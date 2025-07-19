
'use client';

import { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, HabitacionUsuario, EntrenamientoUsuario } from "@prisma/client";
import { UserWithProgress } from "@/lib/data";
import { StatCategoryCard, StatItem } from "./stat-category-card";

interface TroopStat {
    userId: string;
    total: number;
    configuracionTropaId: string;
}

interface StatisticsViewProps {
    currentUser: UserWithProgress;
    allRoomConfigs: ConfiguracionHabitacion[];
    allTrainingConfigs: ConfiguracionEntrenamiento[];
    allTroopConfigs: ConfiguracionTropa[];
    roomStats: HabitacionUsuario[];
    trainingStats: EntrenamientoUsuario[];
    troopStats: TroopStat[];
}

export function StatisticsView({
    currentUser,
    allRoomConfigs,
    allTrainingConfigs,
    allTroopConfigs,
    roomStats,
    trainingStats,
    troopStats
}: StatisticsViewProps) {

    // Process room stats
    const maxRoomLevels = new Map<string, number>();
    roomStats.forEach(stat => {
        const currentMax = maxRoomLevels.get(stat.configuracionHabitacionId) || 0;
        if (stat.nivel > currentMax) {
            maxRoomLevels.set(stat.configuracionHabitacionId, stat.nivel);
        }
    });

    const currentUserRoomLevels = new Map<string, number>();
    currentUser.propiedades.forEach(p => {
        p.habitaciones.forEach(h => {
            const currentLevel = currentUserRoomLevels.get(h.configuracionHabitacionId) || 0;
            if (h.nivel > currentLevel) {
                 currentUserRoomLevels.set(h.configuracionHabitacionId, h.nivel);
            }
        });
    });

    const roomStatItems: StatItem[] = allRoomConfigs.map(config => ({
        id: config.id,
        name: config.nombre,
        userValue: currentUserRoomLevels.get(config.id) || 0,
        maxValue: maxRoomLevels.get(config.id) || 0,
    }));

    // Process training stats
    const maxTrainingLevels = new Map<string, number>();
    trainingStats.forEach(stat => {
        const currentMax = maxTrainingLevels.get(stat.configuracionEntrenamientoId) || 0;
        if (stat.nivel > currentMax) {
            maxTrainingLevels.set(stat.configuracionEntrenamientoId, stat.nivel);
        }
    });
    const currentUserTrainingLevels = new Map(currentUser.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
    const trainingStatItems: StatItem[] = allTrainingConfigs.map(config => ({
        id: config.id,
        name: config.nombre,
        userValue: currentUserTrainingLevels.get(config.id) || 0,
        maxValue: maxTrainingLevels.get(config.id) || 0,
    }));

    // Process troop stats
    const maxTroopCounts = new Map<string, number>();
    troopStats.forEach(stat => {
        const currentMax = maxTroopCounts.get(stat.configuracionTropaId) || 0;
        if (stat.total > currentMax) {
            maxTroopCounts.set(stat.configuracionTropaId, stat.total);
        }
    });

    const currentUserTroopCounts = new Map<string, number>();
    troopStats.filter(t => t.userId === currentUser.id).forEach(t => {
        currentUserTroopCounts.set(t.configuracionTropaId, t.total);
    });

    const troopStatItems: StatItem[] = allTroopConfigs.map(config => ({
        id: config.id,
        name: config.nombre,
        userValue: currentUserTroopCounts.get(config.id) || 0,
        maxValue: maxTroopCounts.get(config.id) || 0,
    }));


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Estadísticas Globales</h2>
                    <p className="text-muted-foreground">
                        Compara tu progreso con los mejores jugadores del servidor.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCategoryCard title="Niveles de Habitaciones" items={roomStatItems} />
                <StatCategoryCard title="Niveles de Entrenamiento" items={trainingStatItems} />
                <StatCategoryCard title="Cantidad de Tropas" items={troopStatItems} />
            </div>
        </div>
    );
}
