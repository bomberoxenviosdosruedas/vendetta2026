"use server"

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export async function getRoomConfigurations() {
  try {
    const roomConfigurations = await prisma.configuracionHabitacion.findMany({
      // You can add ordering if needed, e.g. by points or name
      // orderBy: {
      //   puntos: 'asc'
      // }
    });
    return roomConfigurations;
  } catch (error) {
    console.error("Error fetching room configurations:", error);
    // In a real app, you'd want more robust error handling
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
            where: { username },
        });
        return user;
    } catch (error) {
        console.error(`Error fetching user ${username}:`, error);
        return null;
    }
}

    