'use server';

import { z } from 'zod';
import prisma from '../prisma/prisma';
import type { Propiedad, User, FamilyMember, Family } from '@prisma/client';

export type PropertyWithOwner = Propiedad & {
    user: (User & {
        familyMember: (FamilyMember & {
            family: Family;
        }) | null;
    }) | null;
};

export type ActionResult<T = unknown> = 
    | { success: true; data: T; message?: string }
    | { success: false; error: string; code?: string };

const locationSchema = z.object({
    ciudad: z.number().int().min(1).max(999),
    barrio: z.number().int().min(1).max(999),
});

export async function getPropertiesForMap(ciudad: number, barrio: number): Promise<ActionResult<PropertyWithOwner[]>> {
    const parseResult = locationSchema.safeParse({ ciudad, barrio });
    if (!parseResult.success) {
        return {
            success: false,
            error: 'Coordenadas de ciudad o barrio inválidas.',
            code: 'INVALID_COORDINATES'
        };
    }

    try {
        const properties = await prisma.propiedad.findMany({
            where: {
                ciudad: parseResult.data.ciudad,
                barrio: parseResult.data.barrio,
            },
            include: {
                user: {
                    include: {
                        familyMember: {
                            include: {
                                family: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            success: true,
            data: properties as PropertyWithOwner[],
        };
    } catch (error) {
        console.error('Error al obtener propiedades del mapa:', error);
        return {
            success: false,
            error: 'No se pudieron cargar las propiedades del barrio.',
            code: 'DATABASE_ERROR'
        };
    }
}
