
'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getPropertyOwner } from "../data";

interface MissionInput {
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

    const { coordinates, tropas, tipo } = input;

    // Validación básica
    if (!coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
        return { error: "Coordenadas incompletas." };
    }
    if (tropas.length === 0) {
        return { error: "Debes seleccionar al menos una tropa." };
    }

    const userTropasMap = new Map(user.tropas.map(t => [t.configuracionTropaId, t.cantidad]));

    for (const tropa of tropas) {
        if ((userTropasMap.get(tropa.id) || 0) < tropa.cantidad) {
            return { error: `No tienes suficientes unidades de una de las tropas seleccionadas.` };
        }
    }
    
    // Lógica de OCUPAR
    if (tipo === 'OCUPAR') {
        const targetOwner = await getPropertyOwner(coordinates);
        if (targetOwner) {
            return { error: "No puedes ocupar una propiedad que ya tiene dueño." };
        }

        const tropaOcupacion = tropas.find(t => t.id === 'ocupacion');
        if (!tropaOcupacion || tropaOcupacion.cantidad === 0) {
            return { error: "Necesitas enviar al menos una Tropa de Ocupación para esta misión." };
        }
        
        // Simulación de éxito inmediato
        try {
            const allRoomConfigs = await prisma.configuracionHabitacion.findMany();
            await prisma.propiedad.create({
                data: {
                    userId: user.id,
                    nombre: `Colonia en ${coordinates.ciudad}:${coordinates.barrio}`,
                    ciudad: coordinates.ciudad,
                    barrio: coordinates.barrio,
                    edificio: coordinates.edificio,
                    habitaciones: {
                        create: allRoomConfigs.map(config => ({
                            configuracionHabitacionId: config.id,
                            nivel: 1
                        }))
                    }
                }
            });

            await prisma.tropaUsuario.update({
                where: { userId_configuracionTropaId: { userId: user.id, configuracionTropaId: 'ocupacion' } },
                data: { cantidad: { decrement: tropaOcupacion.cantidad } }
            });
            
            revalidatePath('/overview');
            return { success: `¡Has ocupado exitosamente la propiedad en ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}!` };

        } catch (error) {
            console.error(error);
            return { error: "Error al crear la nueva propiedad." };
        }
    }


    // Lógica para crear la misión en la cola (placeholder por ahora)
    try {
        await prisma.colaMisiones.create({
            data: {
                userId: user.id,
                tipoMision: tipo,
                tropas: JSON.stringify(tropas),
                origenCiudad: user.propiedades[0].ciudad,
                origenBarrio: user.propiedades[0].barrio,
                origenEdificio: user.propiedades[0].edificio,
                destinoCiudad: coordinates.ciudad,
                destinoBarrio: coordinates.barrio,
                destinoEdificio: coordinates.edificio,
                fechaLlegada: new Date(Date.now() + 5 * 60 * 1000), // Llega en 5 minutos
                fechaRegreso: new Date(Date.now() + 10 * 60 * 1000) // Regresa en 10 minutos
            }
        });

         // Descontar tropas
        await prisma.$transaction(
            tropas.map(t => 
                prisma.tropaUsuario.update({
                    where: { userId_configuracionTropaId: { userId: user.id, configuracionTropaId: t.id } },
                    data: { cantidad: { decrement: t.cantidad } }
                })
            )
        );

    } catch (error) {
        console.error("Error al crear la misión:", error);
        return { error: "No se pudo enviar la misión." };
    }
    
    revalidatePath('/missions');
    revalidatePath('/overview');

    return { success: `Misión de ${tipo} enviada a ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}.` };
}
