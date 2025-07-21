

"use server"

import { PrismaClient, User, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa, Propiedad, PuntuacionUsuario, ColaMisiones, Family, FamilyMember, TrainingRequirement, RoomRequirement, TropaBonusContrincante, Message, MessageCategory, ColaEntrenamiento } from '@prisma/client/edge'
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

export type FullColaEntrenamiento = ColaEntrenamiento & {
    entrenamiento: ConfiguracionEntrenamiento;
    propiedad: { nombre: string };
}

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

export type FullMessage = Message & {
    sender: { name: string; id: string } | null;
}

export type UserWithProgress = User & {
    propiedades: FullPropiedad[];
    entrenamientos: (EntrenamientoUsuario & { configuracion: ConfiguracionEntrenamiento })[];
    puntuacion: PuntuacionUsuario | null;
    misiones: ColaMisiones[];
    colaEntrenamientos: FullColaEntrenamiento[];
    familyMember: (FamilyMember & { family: Family }) | null;
    _count?: {
        receivedMessages?: number;
    }
};

export type UserProfileData = User & {
    puntuacion: PuntuacionUsuario | null;
    propiedades: {
        id: string;
        nombre: string;
        ciudad: number;
        barrio: number;
        edificio: number;
    }[];
}

export type UserForRanking = User & {
    puntuacion: PuntuacionUsuario | null;
    _count: {
        propiedades: number;
    }
}

export const getTroopBonusConfig = cache(async (): Promise<TropaBonusContrincante[]> => {
    try {
        const bonusConfig = await prisma.tropaBonusContrincante.findMany();
        return bonusConfig;
    } catch (e) {
        console.error("Error fetching troop bonus config", e);
        return [];
    }
});

export const getMessagesForUser = cache(async (userId: string): Promise<FullMessage[]> => {
    try {
        const messages = await prisma.message.findMany({
            where: { recipientId: userId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return messages as FullMessage[];
    } catch (e) {
        console.error("Error fetching messages for user", e);
        return [];
    }
});


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

export const getFamiliesForRanking = cache(async (): Promise<FullFamily[]> => {
    try {
        const families = await prisma.family.findMany({
            include: {
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        // You might want to calculate and sort by total points here in the future
        return families as FullFamily[];
    } catch (error) {
        console.error("Error fetching families for ranking:", error);
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
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
            }
        });
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
    colaEntrenamientos: {
        include: {
            entrenamiento: true,
            propiedad: {
                select: { nombre: true }
            }
        },
        orderBy: {
            fechaFinalizacion: 'asc'
        }
    },
    familyMember: {
        include: {
            family: true
        }
    },
    _count: {
        select: {
            receivedMessages: {
                where: { isRead: false }
            }
        }
    }
};

export const getUserProfileById = cache(async (userId: string): Promise<UserProfileData | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                puntuacion: true,
                propiedades: {
                    select: {
                        id: true,
                        nombre: true,
                        ciudad: true,
                        barrio: true,
                        edificio: true,
                    },
                    orderBy: {
                        nombre: 'asc'
                    }
                }
            }
        });
        return user as UserProfileData | null;
    } catch(e) {
        console.error(`Error fetching profile for user ${userId}`, e);
        return null;
    }
})

export const getMaximumResourceCapacity = cache(async () => {
    const properties = await prisma.propiedad.findMany({
        include: { habitaciones: { include: { configuracion: true } } }
    });
    return [
        { name: "Armas", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).armas)) },
        { name: "Munición", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).municion)) },
        { name: "Alcohol", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).alcohol)) },
        { name: "Dólares", maxValue: Math.max(...properties.map(p => calculateStorageCapacity(p as FullPropiedad).dolares)) },
    ];
});

export const getGlobalStatistics = cache(async () => {
    try {
        const [
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            rawTroopStats,
        ] = await Promise.all([
            getRoomConfigurations(),
            getTrainingConfigurations(),
            getTroopConfigurations(),
            prisma.habitacionUsuario.findMany(),
            prisma.entrenamientoUsuario.findMany(),
            prisma.tropaUsuario.findMany({
                include: {
                    propiedad: {
                        select: {
                            userId: true
                        }
                    }
                }
            }),
        ]);

        const troopStatsMap = new Map<string, number>();
        rawTroopStats.forEach(stat => {
            const key = `${stat.propiedad.userId}-${stat.configuracionTropaId}`;
            const currentTotal = troopStatsMap.get(key) || 0;
            troopStatsMap.set(key, currentTotal + stat.cantidad);
        });
        
        const troopStats = Array.from(troopStatsMap.entries()).map(([key, total]) => {
            const [userId, configuracionTropaId] = key.split('-');
            return { userId, configuracionTropaId, total };
        });

        return {
            allRoomConfigs,
            allTrainingConfigs,
            allTroopConfigs,
            roomStats,
            trainingStats,
            troopStats,
        };

    } catch (e) {
        console.error("Error fetching global statistics", e);
        throw new Error("Could not fetch global statistics");
    }
});

export async function getUserByUsername(username: string): Promise<UserWithProgress | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: userInclude
        });
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
        return user as UserWithProgress | null;
    } catch (error) {
        console.error(`Error fetching user ${username} with progress:`, error);
        return null;
    }
}
