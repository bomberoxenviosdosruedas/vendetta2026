"use server"

import { PrismaClient, User, ProgresoUsuario, HabitacionUsuario, EntrenamientoUsuario, TropaUsuario, ConfiguracionHabitacion } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

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
    });
    return roomConfigurations;
  } catch (error) {
    console.error("Error fetching room configurations:", error);
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

export async function getUserByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
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
