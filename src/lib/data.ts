
"use server"

import { PrismaClient, User, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion, ConfiguracionEscaladoHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa, Propiedad, PuntuacionUsuario, ColaMisiones } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { cache } from 'react';

const prisma = new PrismaClient().$extends(withAccelerate())

export type FullConfiguracionHabitacion = ConfiguracionHabitacion & {
  escalado: ConfiguracionEscaladoHabitacion | null;
};

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
    tropas: FullTropaUsuario[];
}

export type UserWithProgress = User & {
    propiedades: FullPropiedad[];
    entrenamientos: (EntrenamientoUsuario & { configuracion: ConfiguracionEntrenamiento })[];
    puntuacion: PuntuacionUsuario | null;
    misiones: ColaMisiones[];
};

export type UserForRanking = User & {
    puntuacion: PuntuacionUsuario | null;
    _count: {
        propiedades: number;
    }
}

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
    console.log("Fetching room configurations from DB...");
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
      include: {
        escalado: true,
      },
      orderBy: { id: 'asc' },
    });
    return roomConfigurations;
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    return [];
  }
});

export const getTroopConfigurations = cache(async () => {
    try {
        console.log("Fetching troop configurations from DB...");
        const troopConfigurations = await prisma.configuracionTropa.findMany();
        return troopConfigurations;
    } catch (error) {
        console.error("Error fetching troop configurations:", error);
        return [];
    }
});

export const getTrainingConfigurations = cache(async () => {
    try {
        console.log("Fetching training configurations from DB...");
        const trainingConfigurations = await prisma.configuracionEntrenamiento.findMany();
        return trainingConfigurations;
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
                        escalado: true
                      }
                    }
                },
                 orderBy: {
                    configuracionHabitacionId: 'asc'
                }
            },
            tropas: {
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
};

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
