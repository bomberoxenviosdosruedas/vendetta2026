
"use server"

import { PrismaClient, User, ProgresoUsuario, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as datosReglasHabitaciones from '@/data/room_scaling_rules_updated.json';

const prisma = new PrismaClient().$extends(withAccelerate())

export type UserWithProgress = User & {
    progreso: ProgresoUsuario | null;
    habitaciones: (HabitacionUsuario & { configuracion: ConfiguracionHabitacion })[];
    entrenamientos: EntrenamientoUsuario[];
    tropas: TropaUsuario[];
};

export async function getRoomConfigurations() {
  try {
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
      orderBy: { id: 'asc' },
    });
    return roomConfigurations;
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    return [];
  }
}

export async function getRoomScalingRules() {
    return datosReglasHabitaciones as Record<string, any>;
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

export async function getUserByUsername(username: string): Promise<UserWithProgress | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                progreso: true,
                habitaciones: {
                    include: {
                        configuracion: true
                    },
                    orderBy: {
                        configuracionHabitacionId: 'asc'
                    }
                },
                entrenamientos: true,
                tropas: true
            }
        });
        return user;
    } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        return null;
    }
}


export async function getUserWithProgressByUsername(username: string): Promise<UserWithProgress | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                progreso: true,
                habitaciones: {
                    include: {
                        configuracion: true
                    },
                    orderBy: {
                        configuracionHabitacionId: 'asc'
                    }
                },
                entrenamientos: true,
                tropas: true
            }
        });
        return user;
    } catch (error) {
        console.error(`Error fetching user ${username} with progress:`, error);
        return null;
    }
}
