


"use server"

import { PrismaClient, User, ProgresoUsuario, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion, ConfiguracionEscaladoHabitacion, ConfiguracionEntrenamiento, ColaConstruccion, ColaReclutamiento, ConfiguracionTropa, Propiedad, PuntuacionUsuario } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

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

export type FullPropiedad = Propiedad & {
    habitaciones: FullHabitacionUsuario[];
}

export type UserWithProgress = User & {
    progreso: ProgresoUsuario | null;
    propiedades: FullPropiedad[];
    entrenamientos: (EntrenamientoUsuario & { configuracion: ConfiguracionEntrenamiento })[];
    tropas: (TropaUsuario & { configuracion: ConfiguracionTropa })[];
    colaConstruccion: ColaConstruccion | null;
    colaReclutamiento: FullColaReclutamiento | null;
    puntuacion: PuntuacionUsuario | null;
};

export type UserForRanking = User & {
    puntuacion: PuntuacionUsuario | null;
    _count: {
        propiedades: number;
    }
}

export async function getPropertiesByLocation(ciudad: number, barrio: number) {
    try {
        const properties = await prisma.propiedad.findMany({
            where: {
                ciudad,
                barrio,
            },
            include: {
                user: true // Incluimos la información del usuario propietario
            }
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties by location:", error);
        return [];
    }
}

export async function getUsersForRanking(): Promise<UserForRanking[]> {
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
}

export async function getRoomConfigurations(): Promise<FullConfiguracionHabitacion[]> {
  try {
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
}

export async function getTroopConfigurations() {
    try {
        const troopConfigurations = await prisma.configuracionTropa.findMany();
        return troopConfigurations;
    } catch (error) {
        console.error("Error fetching troop configurations:", error);
        return [];
    }
}

export async function getTrainingConfigurations() {
    try {
        const trainingConfigurations = await prisma.configuracionEntrenamiento.findMany();
        return trainingConfigurations;
    } catch (error) {
        console.error("Error fetching training configurations:", error);
        return [];
    }
}


export async function getUsers() {
    try {
        const users = await prisma.user.findMany();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

const userInclude = {
    progreso: true,
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
    tropas: {
      include: {
        configuracion: true
      }
    },
    colaConstruccion: true,
    colaReclutamiento: {
      include: {
        tropaConfig: true
      }
    },
    puntuacion: true,
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
