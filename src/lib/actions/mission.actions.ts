
'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getPropertyOwner, getTroopConfigurations } from "../data";
import { calcularDistancia, calcularDuracionViaje, calcularVelocidadFlota } from "../formulas/mission-formulas";

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

const MISIONES_SIN_RETORNO = ['OCUPAR'];

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
     if (tropas.length === 0 || tropas.every(t => t.cantidad === 0)) {
        return { error: "Debes seleccionar al menos una tropa." };
    }

    const tropasPropiedadMap = new Map(origenPropiedad.TropaUsuario.map(t => [t.configuracionTropaId, t.cantidad]));

    for (const tropa of tropas) {
        if ((tropasPropiedadMap.get(tropa.id) || 0) < tropa.cantidad) {
            return { error: `No tienes suficientes unidades de una de las tropas seleccionadas en ${origenPropiedad.nombre}.` };
        }
    }
    
    // Calcular distancia y duración
    const troopConfigs = await getTroopConfigurations();
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));
    
    const velocidadFlota = await calcularVelocidadFlota(tropas, troopConfigsMap);
    const distancia = calcularDistancia(origenPropiedad, coordinates);
    const duracionViaje = calcularDuracionViaje(distancia, velocidadFlota);
    
    const fechaInicio = new Date();
    const fechaLlegada = new Date(fechaInicio.getTime() + duracionViaje * 1000);
    const requiereRetorno = !MISIONES_SIN_RETORNO.includes(tipo);
    const fechaRegreso = requiereRetorno ? new Date(fechaLlegada.getTime() + duracionViaje * 1000) : null;


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
                    propiedadOrigenId: origenPropiedadId,
                    tipoMision: tipo,
                    tropas: JSON.stringify(tropas),
                    origenCiudad: origenPropiedad.ciudad,
                    origenBarrio: origenPropiedad.barrio,
                    origenEdificio: origenPropiedad.edificio,
                    destinoCiudad: coordinates.ciudad,
                    destinoBarrio: coordinates.barrio,
                    destinoEdificio: coordinates.edificio,
                    fechaInicio: fechaInicio,
                    fechaLlegada: fechaLlegada,
                    fechaRegreso: fechaRegreso,
                    velocidadFlota,
                    duracionViaje,
                }
            });

            for (const t of tropas) {
                if (t.cantidad > 0) {
                    await tx.tropaUsuario.update({
                        where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: t.id } },
                        data: { cantidad: { decrement: t.cantidad } }
                    });
                }
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


export async function cancelarMision(misionId: string) {
    const user = await getSessionUser();
    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    const mision = await prisma.colaMisiones.findUnique({
        where: { id: misionId }
    });

    if (!mision || mision.userId !== user.id) {
        return { error: "Misión no encontrada o no te pertenece." };
    }
    
    if (new Date() > new Date(mision.fechaLlegada)) {
        return { error: "No se puede cancelar una misión que ya ha llegado a su destino." };
    }

    const ahora = new Date();
    const tiempoTranscurrido = ahora.getTime() - new Date(mision.fechaInicio).getTime();
    const nuevaFechaRegreso = new Date(ahora.getTime() + tiempoTranscurrido);

    try {
        await prisma.colaMisiones.update({
            where: { id: misionId },
            data: {
                tipoMision: 'REGRESO',
                fechaRegreso: nuevaFechaRegreso,
            }
        });
        revalidatePath('/overview');
        revalidatePath('/missions');
        return { success: "La misión ha sido cancelada y la flota está de regreso." };

    } catch (error) {
        console.error("Error al cancelar la misión:", error);
        return { error: "No se pudo cancelar la misión." };
    }

}
