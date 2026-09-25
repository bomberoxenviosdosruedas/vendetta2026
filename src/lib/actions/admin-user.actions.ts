'use server';

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "../prisma/prisma";
import { verifyAdminSession } from "../auth-admin";
import { userInclude } from "../prisma/user-include";
import type { UserWithProgress } from "../data";
import { actualizarPuntuacionUsuario } from "./user.actions";

// ---------------------------------------------------------------------------
// Tipos públicos del "Libro Mayor": estado por jugador para el CRUD admin
// ---------------------------------------------------------------------------

export interface AdminPuntuacion {
  puntosTotales: number;
  puntosHabitaciones: number;
  puntosTropas: number;
  puntosEntrenamientos: number;
}

export interface AdminHabitacionRow {
  configuracionHabitacionId: string;
  nivel: number;
}

export interface AdminTropaRow {
  configuracionTropaId: string;
  cantidad: number;
}

export interface AdminPropiedadState {
  id: string;
  nombre: string;
  ciudad: number;
  barrio: number;
  edificio: number;
  armas: number;
  municion: number;
  alcohol: number;
  dolares: number;
  habitaciones: AdminHabitacionRow[];
  tropas: AdminTropaRow[];
}

export interface AdminEntrenamientoRow {
  configuracionEntrenamientoId: string;
  nivel: number;
}

export interface AdminUserState {
  id: string;
  name: string;
  username: string;
  puntuacion: AdminPuntuacion | null;
  propiedades: AdminPropiedadState[];
  entrenamientos: AdminEntrenamientoRow[];
}

export interface AdminUserListItem {
  id: string;
  name: string;
  username: string;
  cantidadPropiedades: number;
  puntosTotales: number;
}

export type AdminActionResult<T = { puntuacion: AdminPuntuacion | null }> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Validación con Zod en la frontera de entrada
// ---------------------------------------------------------------------------

const uidSchema = z.string().min(1).max(64);
const cantidadSchema = z.number().min(0).max(999_999_999);
const nivelSchema = z.number().int().min(0).max(999);

const recursosSchema = z.object({
  armas: cantidadSchema,
  municion: cantidadSchema,
  alcohol: cantidadSchema,
  dolares: cantidadSchema,
});

const nivelesSchema = z.record(z.string().min(1).max(64), nivelSchema);
const cantidadesSchema = z.record(
  z.string().min(1).max(64),
  z.number().int().min(0).max(999_999_999)
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Relee el estado del jugador FRESCO (sin la memoización de React.cache) y
 * recalcula la puntuación en BD. Devuelve el desglose de puntos actualizado.
 */
async function refrescarYRecalcularPuntuacion(userId: string): Promise<AdminPuntuacion | null> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });
  if (!usuario) return null;

  const actualizado = await actualizarPuntuacionUsuario(usuario as unknown as UserWithProgress);
  const p = actualizado.puntuacion;
  if (!p) return null;

  return {
    puntosTotales: p.puntosTotales,
    puntosHabitaciones: p.puntosHabitaciones,
    puntosTropas: p.puntosTropas,
    puntosEntrenamientos: p.puntosEntrenamientos,
  };
}

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  if (!(await verifyAdminSession())) return [];

  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      puntuacion: { select: { puntosTotales: true } },
      _count: { select: { propiedades: true } },
    },
    orderBy: { name: 'asc' },
  });

  return usuarios.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    cantidadPropiedades: u._count.propiedades,
    puntosTotales: u.puntuacion?.puntosTotales ?? 0,
  }));
}

export async function getAdminUserState(userId: string): Promise<AdminActionResult<AdminUserState>> {
  if (!(await verifyAdminSession())) return { success: false, error: 'No autorizado.' };

  const parseId = uidSchema.safeParse(userId);
  if (!parseId.success) return { success: false, error: 'Identificador de jugador inválido.' };

  const usuario = await prisma.user.findUnique({
    where: { id: parseId.data },
    include: userInclude,
  });
  if (!usuario) return { success: false, error: 'El jugador no existe.' };

  return {
    success: true,
    data: {
      id: usuario.id,
      name: usuario.name,
      username: usuario.username,
      puntuacion: usuario.puntuacion
        ? {
            puntosTotales: usuario.puntuacion.puntosTotales,
            puntosHabitaciones: usuario.puntuacion.puntosHabitaciones,
            puntosTropas: usuario.puntuacion.puntosTropas,
            puntosEntrenamientos: usuario.puntuacion.puntosEntrenamientos,
          }
        : null,
      propiedades: usuario.propiedades.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        ciudad: p.ciudad,
        barrio: p.barrio,
        edificio: p.edificio,
        armas: p.armas,
        municion: p.municion,
        alcohol: p.alcohol,
        dolares: p.dolares,
        habitaciones: p.habitaciones.map((h) => ({
          configuracionHabitacionId: h.configuracionHabitacionId,
          nivel: h.nivel,
        })),
        tropas: p.TropaUsuario.map((t) => ({
          configuracionTropaId: t.configuracionTropaId,
          cantidad: t.cantidad,
        })),
      })),
      entrenamientos: usuario.entrenamientos.map((e) => ({
        configuracionEntrenamientoId: e.configuracionEntrenamientoId,
        nivel: e.nivel,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Mutaciones (atómicas + recálculo de puntuación)
// ---------------------------------------------------------------------------

export async function saveAdminResources(
  userId: string,
  propertyId: string,
  valores: unknown
): Promise<AdminActionResult> {
  if (!(await verifyAdminSession())) return { success: false, error: 'No autorizado.' };

  const parseId = uidSchema.safeParse(userId);
  const parseProp = uidSchema.safeParse(propertyId);
  const parseValores = recursosSchema.safeParse(valores);
  if (!parseId.success || !parseProp.success || !parseValores.success) {
    return { success: false, error: 'Valores de recursos inválidos.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const cuenta = await tx.propiedad.updateMany({
        where: { id: parseProp.data, userId: parseId.data },
        data: {
          armas: parseValores.data.armas,
          municion: parseValores.data.municion,
          alcohol: parseValores.data.alcohol,
          dolares: parseValores.data.dolares,
          // Reinicia el reloj del tick para que la producción no se acumule
          // retroactivamente sobre los valores recién asignados.
          ultimaActualizacion: new Date(),
        },
      });
      if (cuenta.count === 0) {
        throw new Error('Propiedad no encontrada para el jugador.');
      }
    });

    const puntuacion = await refrescarYRecalcularPuntuacion(parseId.data);
    revalidatePath('/admin/panel/users');
    return { success: true, data: { puntuacion }, message: 'Recursos guardados.' };
  } catch (error) {
    console.error('[AdminJugadores] Error guardando recursos:', error);
    return { success: false, error: 'No se pudieron guardar los recursos.' };
  }
}

export async function saveAdminRooms(
  userId: string,
  propertyId: string,
  niveles: unknown
): Promise<AdminActionResult> {
  if (!(await verifyAdminSession())) return { success: false, error: 'No autorizado.' };

  const parseId = uidSchema.safeParse(userId);
  const parseProp = uidSchema.safeParse(propertyId);
  const parseNiveles = nivelesSchema.safeParse(niveles);
  if (!parseId.success || !parseProp.success || !parseNiveles.success) {
    return { success: false, error: 'Valores de niveles inválidos.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const propiedad = await tx.propiedad.findFirst({
        where: { id: parseProp.data, userId: parseId.data },
        select: { id: true },
      });
      if (!propiedad) throw new Error('Propiedad no encontrada para el jugador.');

      for (const [configId, nivel] of Object.entries(parseNiveles.data)) {
        if (nivel <= 0) {
          await tx.habitacionUsuario.deleteMany({
            where: { propiedadId: parseProp.data, configuracionHabitacionId: configId },
          });
          continue;
        }
        await tx.habitacionUsuario.upsert({
          where: {
            propiedadId_configuracionHabitacionId: {
              propiedadId: parseProp.data,
              configuracionHabitacionId: configId,
            },
          },
          create: { propiedadId: parseProp.data, configuracionHabitacionId: configId, nivel },
          update: { nivel },
        });
      }
    });

    const puntuacion = await refrescarYRecalcularPuntuacion(parseId.data);
    revalidatePath('/admin/panel/users');
    return { success: true, data: { puntuacion }, message: 'Niveles de habitaciones guardados.' };
  } catch (error) {
    console.error('[AdminJugadores] Error guardando niveles de habitaciones:', error);
    return { success: false, error: 'No se pudieron guardar los niveles de habitaciones.' };
  }
}

export async function saveAdminTroops(
  userId: string,
  propertyId: string,
  cantidades: unknown
): Promise<AdminActionResult> {
  if (!(await verifyAdminSession())) return { success: false, error: 'No autorizado.' };

  const parseId = uidSchema.safeParse(userId);
  const parseProp = uidSchema.safeParse(propertyId);
  const parseCantidades = cantidadesSchema.safeParse(cantidades);
  if (!parseId.success || !parseProp.success || !parseCantidades.success) {
    return { success: false, error: 'Valores de cantidades inválidos.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const propiedad = await tx.propiedad.findFirst({
        where: { id: parseProp.data, userId: parseId.data },
        select: { id: true },
      });
      if (!propiedad) throw new Error('Propiedad no encontrada para el jugador.');

      for (const [configId, cantidad] of Object.entries(parseCantidades.data)) {
        if (cantidad <= 0) {
          await tx.tropaUsuario.deleteMany({
            where: { propiedadId: parseProp.data, configuracionTropaId: configId },
          });
          continue;
        }
        await tx.tropaUsuario.upsert({
          where: {
            propiedadId_configuracionTropaId: {
              propiedadId: parseProp.data,
              configuracionTropaId: configId,
            },
          },
          create: {
            propiedadId: parseProp.data,
            configuracionTropaId: configId,
            cantidad,
          },
          update: { cantidad },
        });
      }
    });

    const puntuacion = await refrescarYRecalcularPuntuacion(parseId.data);
    revalidatePath('/admin/panel/users');
    return { success: true, data: { puntuacion }, message: 'Tropas guardadas.' };
  } catch (error) {
    console.error('[AdminJugadores] Error guardando tropas:', error);
    return { success: false, error: 'No se pudieron guardar las tropas.' };
  }
}

export async function saveAdminTrainings(
  userId: string,
  niveles: unknown
): Promise<AdminActionResult> {
  if (!(await verifyAdminSession())) return { success: false, error: 'No autorizado.' };

  const parseId = uidSchema.safeParse(userId);
  const parseNiveles = nivelesSchema.safeParse(niveles);
  if (!parseId.success || !parseNiveles.success) {
    return { success: false, error: 'Valores de niveles inválidos.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const [configId, nivel] of Object.entries(parseNiveles.data)) {
        if (nivel <= 0) {
          await tx.entrenamientoUsuario.deleteMany({
            where: { userId: parseId.data, configuracionEntrenamientoId: configId },
          });
          continue;
        }
        await tx.entrenamientoUsuario.upsert({
          where: {
            userId_configuracionEntrenamientoId: {
              userId: parseId.data,
              configuracionEntrenamientoId: configId,
            },
          },
          create: {
            userId: parseId.data,
            configuracionEntrenamientoId: configId,
            nivel,
          },
          update: { nivel },
        });
      }
    });

    const puntuacion = await refrescarYRecalcularPuntuacion(parseId.data);
    revalidatePath('/admin/panel/users');
    return { success: true, data: { puntuacion }, message: 'Entrenamientos guardados.' };
  } catch (error) {
    console.error('[AdminJugadores] Error guardando entrenamientos:', error);
    return { success: false, error: 'No se pudieron guardar los entrenamientos.' };
  }
}