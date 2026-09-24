'use client';

import { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, HabitacionUsuario, EntrenamientoUsuario } from "@prisma/client";
import { UserWithProgress } from "@/lib/data";
import { StatTableCard } from "./stat-table-card";

interface TroopStat {
    userId: string;
    total: number;
    configuracionTropaId: string;
}

interface ResourceStat {
    name: string;
    maxValue: number;
}

interface StatisticsViewProps {
    currentUser: UserWithProgress;
    allRoomConfigs: ConfiguracionHabitacion[];
    allTrainingConfigs: ConfiguracionEntrenamiento[];
    allTroopConfigs: ConfiguracionTropa[];
    roomStats: HabitacionUsuario[];
    trainingStats: EntrenamientoUsuario[];
    troopStats: TroopStat[];
    resourceStats: ResourceStat[];
}

export function StatisticsView({
    currentUser,
    allRoomConfigs,
    allTrainingConfigs,
    allTroopConfigs,
    roomStats,
    trainingStats,
    troopStats,
    resourceStats
}: StatisticsViewProps) {

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

    const roomStatData = allRoomConfigs.map(config => ([
        config.nombre,
        currentUserRoomLevels.get(config.id) || 0,
        maxRoomLevels.get(config.id) || 0,
    ]));

    const maxTrainingLevels = new Map<string, number>();
    trainingStats.forEach(stat => {
        const currentMax = maxTrainingLevels.get(stat.configuracionEntrenamientoId) || 0;
        if (stat.nivel > currentMax) {
            maxTrainingLevels.set(stat.configuracionEntrenamientoId, stat.nivel);
        }
    });
    const currentUserTrainingLevels = new Map(currentUser.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
    
    const trainingStatData = allTrainingConfigs.map(config => ([
        config.nombre,
        currentUserTrainingLevels.get(config.id) || 0,
        maxTrainingLevels.get(config.id) || 0,
    ]));

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

    const troopStatData = allTroopConfigs.map(config => ([
        config.nombre,
        currentUserTroopCounts.get(config.id) || 0,
        maxTroopCounts.get(config.id) || 0,
    ]));

    const resourceStatData = resourceStats.map(stat => ([
        stat.name,
        stat.maxValue
    ]));

    return (
        <div className="w-full space-y-3">
            <section className="v-outer-frame">
                <div className="crimson-th p-2 flex items-center justify-between">
                    <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider">
                        ESTADÍSTICAS GLOBALES DEL SERVIDOR
                    </span>
                </div>

                <div className="p-3 bg-[#dfdbc9] grid grid-cols-1 md:grid-cols-2 gap-3">
                    <StatTableCard title="RECURSOS MÁXIMOS" headers={['Recurso', 'Máximo por Edificio']} data={resourceStatData} />
                    <StatTableCard title="HABITACIONES" headers={['Habitación', 'Mi Nivel', 'Nivel Máximo']} data={roomStatData} />
                    <StatTableCard title="ENTRENAMIENTOS" headers={['Entrenamiento', 'Mi Nivel', 'Nivel Máximo']} data={trainingStatData} />
                    <StatTableCard title="TROPAS" headers={['Tropa', 'Mis Unidades', 'Unidades Máximas']} data={troopStatData} />
                </div>
            </section>
        </div>
    );
}
