
'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getPropertyOwner } from "../data";

interface MissionInput {
    origenPropiedadId: string;
    coordinates: {
        ciudad: number;
        barrio: number;
        edificio: number;
    },
    tropas: { id: string, cantidad: number }[];
    tipo: string;
}

export async function enviarMision(input: MissionInput) {
    const user = await getSessionUser();
    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    const { origenPropiedadId, coordinates, tropas, tipo } = input;
    const origenPropiedad = user.propiedades.find(p => p.id === origenPropiedadId);

    if (!origenPropiedad) {
        return { error: "Propiedad de origen no encontrada." };
    }

    if (!coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
        return { error: "Coordenadas incompletas." };
    }
    if (tropas.length === 0) {
        return { error: "Debes seleccionar al menos una tropa." };
    }

    const tropasPropiedadMap = new Map(origenPropiedad.tropas.map(t => [t.configuracionTropaId, t.cantidad]));

    for (const tropa of tropas) {
        if ((tropasPropiedadMap.get(tropa.id) || 0) < tropa.cantidad) {
            return { error: `No tienes suficientes unidades de una de las tropas seleccionadas en ${origenPropiedad.nombre}.` };
        }
    }
    
    if (tipo === 'OCUPAR') {
        const targetOwner = await getPropertyOwner(coordinates);
        if (targetOwner) {
            return { error: "No puedes ocupar una propiedad que ya tiene dueño." };
        }

        const tropaOcupacion = tropas.find(t => t.id === 'ocupacion');
        if (!tropaOcupacion || tropaOcupacion.cantidad === 0) {
            return { error: "Necesitas enviar al menos una Tropa de Ocupación para esta misión." };
        }
        
        try {
            await prisma.$transaction(async (tx) => {
                const allRoomConfigs = await tx.configuracionHabitacion.findMany();
                await tx.propiedad.create({
                    data: {
                        userId: user.id,
                        nombre: `Colonia en ${coordinates.ciudad}:${coordinates.barrio}`,
                        ciudad: coordinates.ciudad,
                        barrio: coordinates.barrio,
                        edificio: coordinates.edificio,
                        // Valores iniciales de recursos
                        armas: 10000,
                        municion: 10000,
                        alcohol: 10000,
                        dolares: 10000,
                        habitaciones: {
                            create: allRoomConfigs.map(config => ({
                                configuracionHabitacionId: config.id,
                                nivel: 1
                            }))
                        }
                    }
                });

                await tx.tropaUsuario.update({
                    where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: 'ocupacion' } },
                    data: { cantidad: { decrement: tropaOcupacion.cantidad } }
                });
            });
            
            revalidatePath('/overview');
            revalidatePath('/map');
            return { success: `¡Has ocupado exitosamente la propiedad en ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}!` };

        } catch (error) {
            console.error(error);
            return { error: "Error al crear la nueva propiedad." };
        }
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.colaMisiones.create({
                data: {
                    userId: user.id,
                    tipoMision: tipo,
                    tropas: JSON.stringify(tropas),
                    origenCiudad: origenPropiedad.ciudad,
                    origenBarrio: origenPropiedad.barrio,
                    origenEdificio: origenPropiedad.edificio,
                    destinoCiudad: coordinates.ciudad,
                    destinoBarrio: coordinates.barrio,
                    destinoEdificio: coordinates.edificio,
                    fechaLlegada: new Date(Date.now() + 5 * 60 * 1000),
                    fechaRegreso: new Date(Date.now() + 10 * 60 * 1000)
                }
            });

            for (const t of tropas) {
                await tx.tropaUsuario.update({
                    where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: t.id } },
                    data: { cantidad: { decrement: t.cantidad } }
                });
            }
        });

    } catch (error) {
        console.error("Error al crear la misión:", error);
        return { error: "No se pudo enviar la misión." };
    }
    
    revalidatePath('/missions');
    revalidatePath('/overview');

    return { success: `Misión de ${tipo} enviada a ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}.` };
}
