

"use server"

import { PrismaClient, User, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa, Propiedad, PuntuacionUsuario, ColaMisiones, Family, FamilyMember, TrainingRequirement, RoomRequirement, TropaBonusContrincante } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { cache } from 'react';
import { calculateStorageCapacity } from './formulas/room-formulas';

const prisma = new PrismaClient().$extends(withAccelerate())

export type FullConfiguracionHabitacion = ConfiguracionHabitacion & {
  requirements: RoomRequirement[];
};

export type FullConfiguracionEntrenamiento = ConfiguracionEntrenamiento & {
    requirements: TrainingRequirement[];
}

export type FullConfiguracionTropa = ConfiguracionTropa & {
    bonusContrincante: TropaBonusContrincante[];
}

export type FullHabitacionUsuario = HabitacionUsuario & { 
  configuracion: FullConfiguracionHabitacion 
};

export type FullColaReclutamiento = ColaReclutamiento & {
  tropaConfig: ConfiguracionTropa;
};

export type FullTropaUsuario = TropaUsuario & {
    configuracion: ConfiguracionTropa;
}

export type FullPropiedad = Propiedad & {
    habitaciones: FullHabitacionUsuario[];
    colaConstruccion: ColaConstruccion[];
    colaReclutamiento: FullColaReclutamiento | null;
    TropaUsuario: FullTropaUsuario[];
}

export type FullFamilyMember = FamilyMember & { user: User };

export type FullFamily = Family & {
    members: FullFamilyMember[]
}

export type UserWithProgress = User & {
    propiedades: FullPropiedad[];
    entrenamientos: (EntrenamientoUsuario & { configuracion: ConfiguracionEntrenamiento })[];
    puntuacion: PuntuacionUsuario | null;
    misiones: ColaMisiones[];
    familyMember: (FamilyMember & { family: Family }) | null;
};

export type UserForRanking = User & {
    puntuacion: PuntuacionUsuario | null;
    _count: {
        propiedades: number;
    }
}

export const getFamilyById = cache(async(id: string) => {
    try {
        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: true
                    },
                    orderBy: {
                        role: 'asc'
                    }
                }
            }
        });
        return family as FullFamily | null;
    } catch (e) {
        console.error("Error fetching family by id", e);
        return null;
    }
});

export const getUserFamily = cache(async(userId: string) => {
    try {
        const familyMember = await prisma.familyMember.findUnique({
            where: { userId },
            include: {
                family: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        title: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!familyMember) return null;
        return getFamilyById(familyMember.familyId);
    } catch(e) {
        console.error("Error fetching user family", e);
        return null;
    }
});


export const getPropertyOwner = cache(async (coords: { ciudad: number, barrio: number, edificio: number }): Promise<{id: string, name: string} | null> => {
    try {
        const property = await prisma.propiedad.findUnique({
            where: {
                ciudad_barrio_edificio: coords
            },
            select: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return property?.user || null;
    } catch(e) {
        return null;
    }
});

export const getPropertiesByLocation = cache(async (ciudad: number, barrio: number) => {
    try {
        const properties = await prisma.propiedad.findMany({
            where: {
                ciudad,
                barrio,
            },
            include: {
                user: true
            }
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties by location:", error);
        return [];
    }
});

export const getUsersForRanking = cache(async (): Promise<UserForRanking[]> => {
    try {
        const users = await prisma.user.findMany({
            include: {
                puntuacion: true,
                _count: {
                    select: { propiedades: true },
                }
            },
            orderBy: {
                puntuacion: {
                    puntosTotales: 'desc'
                }
            }
        });
        return users as UserForRanking[];
    } catch (error) {
        console.error("Error fetching users for ranking:", error);
        return [];
    }
});

export const getRoomConfigurations = cache(async (): Promise<FullConfiguracionHabitacion[]> => {
  try {
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
        include: {
            requirements: true,
        },
      orderBy: { id: 'asc' },
    });
    return roomConfigurations as FullConfiguracionHabitacion[];
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    return [];
  }
});

export const getTroopConfigurations = cache(async (): Promise<FullConfiguracionTropa[]> => {
    try {
        const troopConfigurations = await prisma.configuracionTropa.findMany({
            include: {
                bonusContrincante: true,
            }
        });
        return troopConfigurations as FullConfiguracionTropa[];
    } catch (error) {
        console.error("Error fetching troop configurations:", error);
        return [];
    }
});

export const getTrainingConfigurations = cache(async (): Promise<FullConfiguracionEntrenamiento[]> => {
    try {
        const trainingConfigurations = await prisma.configuracionEntrenamiento.findMany({
            include: {
                requirements: true
            }
        });
        return trainingConfigurations as FullConfiguracionEntrenamiento[];
    } catch (error) {
        console.error("Error fetching training configurations:", error);
        return [];
    }
});


export const getUsers = cache(async () => {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
});

const userInclude = {
    propiedades: {
        include: {
            habitaciones: {
                include: {
                    configuracion: {
                      include: {
                        requirements: true
                      }
                    }
                },
                 orderBy: {
                    configuracionHabitacionId: 'asc'
                }
            },
            TropaUsuario: {
                include: {
                    configuracion: true
                }
            },
            colaConstruccion: {
                orderBy: {
                    createdAt: 'asc'
                }
            },
            colaReclutamiento: {
                include: {
                    tropaConfig: true
                }
            }
        }
    },
    entrenamientos: {
        include: {
            configuracion: true
        },
        orderBy: {
            configuracionEntrenamientoId: 'asc'
        }
    },
    puntuacion: true,
    misiones: {
        orderBy: {
            fechaLlegada: 'asc'
        }
    },
    familyMember: {
        include: {
            family: true
        }
    }
};

export const getGlobalStatistics = cache(async () => {
    try {
        const [
            allRoomConfigs, 
            allTrainingConfigs, 
            allTroopConfigs, 
            roomStats, 
            trainingStats,
            troopStatsRaw,
            properties
        ] = await Promise.all([
            getRoomConfigurations(),
            getTrainingConfigurations(),
            getTroopConfigurations(),
            prisma.habitacionUsuario.findMany(),
            prisma.entrenamientoUsuario.findMany(),
            prisma.tropaUsuario.groupBy({
                by: ['propiedadId', 'configuracionTropaId'],
                _sum: {
                    cantidad: true
                }
            }),
            prisma.propiedad.findMany({ select: { id: true, userId: true } })
        ]);

        const propertyIdToUserIdMap = new Map(properties.map(p => [p.id, p.userId]));
        
        const userTroopTotals = new Map<string, Map<string, number>>();

        troopStatsRaw.forEach(stat => {
            const userId = propertyIdToUserIdMap.get(stat.propiedadId);
            if (!userId) return;

            if (!userTroopTotals.has(userId)) {
                userTroopTotals.set(userId, new Map());
            }

            const userTroops = userTroopTotals.get(userId)!;
            const currentTotal = userTroops.get(stat.configuracionTropaId) || 0;
            userTroops.set(stat.configuracionTropaId, currentTotal + (stat._sum.cantidad || 0));
        });

        const finalTroopStats = Array.from(userTroopTotals.entries()).flatMap(([userId, troopMap]) => 
            Array.from(troopMap.entries()).map(([configuracionTropaId, total]) => ({
                userId,
                configuracionTropaId,
                total
            }))
        );

        return { allRoomConfigs, allTrainingConfigs, allTroopConfigs, roomStats, trainingStats, troopStats: finalTroopStats };
    } catch (error) {
        console.error("Error fetching global statistics:", error);
        return { 
            allRoomConfigs: [], 
            allTrainingConfigs: [], 
            allTroopConfigs: [], 
            roomStats: [], 
            trainingStats: [], 
            troopStats: [] 
        };
    }
});

export const getMaximumResourceCapacity = cache(async () => {
    try {
        const allProperties = await prisma.propiedad.findMany({
            include: {
                habitaciones: {
                    include: {
                        configuracion: true
                    }
                }
            }
        });
        
        const maxCapacity = {
            armas: 0,
            municion: 0,
            alcohol: 0,
            dolares: 0
        };

        allProperties.forEach(prop => {
            const capacity = calculateStorageCapacity(prop as FullPropiedad);
            if (capacity.armas > maxCapacity.armas) maxCapacity.armas = capacity.armas;
            if (capacity.municion > maxCapacity.municion) maxCapacity.municion = capacity.municion;
            if (capacity.alcohol > maxCapacity.alcohol) maxCapacity.alcohol = capacity.alcohol;
            if (capacity.dolares > maxCapacity.dolares) maxCapacity.dolares = capacity.dolares;
        });

        return [
            { name: 'Armas', maxValue: maxCapacity.armas },
            { name: 'Munición', maxValue: maxCapacity.municion },
            { name: 'Alcohol', maxValue: maxCapacity.alcohol },
            { name: 'Dólares', maxValue: maxCapacity.dolares },
        ];

    } catch (error) {
        console.error("Error fetching resource statistics:", error);
        return [];
    }
})


export async function getUserByUsername(username: string): Promise<UserWithProgress | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: userInclude
        });
        // This is a temporary type assertion to match the frontend expectations
        if (user) {
            (user as any).propiedades = user.propiedades.map(p => ({ ...p, tropas: p.TropaUsuario }));
        }
        return user as UserWithProgress | null;
    } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        return null;
    }
}


export async function getUserWithProgressByUsername(username: string): Promise<UserWithProgress | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: userInclude
        });
        // This is a temporary type assertion to match the frontend expectations
        if (user) {
            (user as any).propiedades = user.propiedades.map(p => ({ ...p, tropas: p.TropaUsuario as any }));
        }
        return user as UserWithProgress | null;
    } catch (error) {
        console.error(`Error fetching user ${username} with progress:`, error);
        return null;
    }
}
