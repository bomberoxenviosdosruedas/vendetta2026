import type { Prisma } from '@prisma/client';

/**
 * Include completo del estado de un jugador (propiedades, habitaciones, tropas,
 * entrenamientos, misiones, mensajería, familia y puntuación).
 *
 * Vive en un módulo SIN `'use server'` porque es un objeto plano: un módulo
 * `use server` solo puede exportar funciones async.
 *
 * Lo consumen `src/lib/data.ts` (lecturas memoizadas con React.cache) y las
 * server actions del panel admin (`src/lib/actions/admin-user.actions.ts`),
 * que necesitan re-leer el estado FRESCO tras mutar sin la memoización.
 */
export const userInclude = {
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
                    configuracionHabitacionId: 'asc' as Prisma.SortOrder
                }
            },
            TropaUsuario: {
                include: {
                    configuracion: true
                }
            },
            colaConstruccion: {
                orderBy: {
                    createdAt: 'asc' as Prisma.SortOrder
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
            configuracionEntrenamientoId: 'asc' as Prisma.SortOrder
        }
    },
    puntuacion: true,
    misiones: {
        orderBy: {
            fechaLlegada: 'asc' as Prisma.SortOrder
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
            fechaFinalizacion: 'asc' as Prisma.SortOrder
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