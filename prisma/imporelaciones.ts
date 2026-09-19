

import prisma from '../src/lib/prisma/prisma';
import * as datosFamilies from './datosactuales/family.json';
import * as datosFamilyMembers from './datosactuales/familyMember.json';
import * as datosFamilyInvitations from './datosactuales/familyInvitation.json';
import * as datosRoomRequirements from './datosactuales/roomRequirement.json';
import * as datosTrainingRequirements from './datosactuales/trainingRequirement.json';
import * as datosTropaBonus from './datosactuales/tropaBonusContrincante.json';
import * as datosMessages from './datosactuales/message.json';
import * as datosHabitaciones from './datosactuales/habitacionUsuario.json';
import * as datosEntrenamientos from './datosactuales/entrenamientoUsuario.json';
import * as datosTropas from './datosactuales/tropaUsuario.json';
import * as datosPuntuacion from './datosactuales/puntuacionUsuario.json';
import * as datosColaConstruccion from './datosactuales/colaConstruccion.json';
import * as datosColaReclutamiento from './datosactuales/colaReclutamiento.json';
import * as datosColaMisiones from './datosactuales/colaMisiones.json';
import * as datosColaEntrenamiento from './datosactuales/colaEntrenamiento.json';

async function main() {
    console.log('🤝 Iniciando la importación de datos relacionales y de progreso...');
    
    const parseDate = (val: any) => (val && typeof val === 'string' && !isNaN(new Date(val).getTime()) ? new Date(val) : new Date());
    const parseOptionalDate = (val: any) => (val && typeof val === 'string' && !isNaN(new Date(val).getTime()) ? new Date(val) : null);

    const families = (datosFamilies as any).default || datosFamilies;
    const familyMembers = (datosFamilyMembers as any).default || datosFamilyMembers;
    const familyInvitations = (datosFamilyInvitations as any).default || datosFamilyInvitations;
    const roomRequirements = (datosRoomRequirements as any).default || datosRoomRequirements;
    const trainingRequirements = (datosTrainingRequirements as any).default || datosTrainingRequirements;
    const tropaBonus = (datosTropaBonus as any).default || datosTropaBonus;
    const messages = (datosMessages as any).default || datosMessages;
    const habitaciones = (datosHabitaciones as any).default || datosHabitaciones;
    const entrenamientos = (datosEntrenamientos as any).default || datosEntrenamientos;
    const tropas = (datosTropas as any).default || datosTropas;
    const puntuaciones = (datosPuntuacion as any).default || datosPuntuacion;
    const colasConstruccion = (datosColaConstruccion as any).default || datosColaConstruccion;
    const colasReclutamiento = (datosColaReclutamiento as any).default || datosColaReclutamiento;
    const colasMisiones = (datosColaMisiones as any).default || datosColaMisiones;
    const colasEntrenamiento = (datosColaEntrenamiento as any).default || datosColaEntrenamiento;

    // Limpiar relaciones antes de importar
    await prisma.roomRequirement.deleteMany({});
    await prisma.trainingRequirement.deleteMany({});
    await prisma.tropaBonusContrincante.deleteMany({});


    for (const habData of habitaciones) {
        try {
            await prisma.habitacionUsuario.upsert({
                where: { id: habData.id },
                update: habData,
                create: habData,
            });
        } catch(e) {
             console.error(`Error con habitacion ${habData.id}`, e);
        }
    }

    for (const entData of entrenamientos) {
        try {
           await prisma.entrenamientoUsuario.upsert({
               where: { id: entData.id },
               update: entData,
               create: entData,
           });
        } catch (e) {
           console.error(`Error con entrenamiento ${entData.id}`, e);
        }
    }
   
    for (const tropaData of tropas) {
       try {
           await prisma.tropaUsuario.upsert({
               where: { id: tropaData.id },
               update: tropaData,
               create: tropaData,
           });
       } catch (e) {
           console.error(`Error con tropa ${tropaData.id}`, e);
       }
    }
     
    for (const puntData of puntuaciones) {
        try {
         const { ...restOfPuntData } = puntData;
         const updatedAt = parseDate(restOfPuntData.updatedAt);
         await prisma.puntuacionUsuario.upsert({
             where: { id: restOfPuntData.id },
             update: { ...restOfPuntData, updatedAt },
             create: { ...restOfPuntData, updatedAt },
         });
        } catch (e) {
           console.error(`Error con puntuacion ${puntData.id}`, e);
        }
    }
     
    // Limpiar colas existentes para evitar duplicados en cada seed
    await prisma.colaMisiones.deleteMany({});
    await prisma.colaReclutamiento.deleteMany({});
    await prisma.colaConstruccion.deleteMany({});
    await prisma.colaEntrenamiento.deleteMany({});
   
   
    for (const cola of colasConstruccion) {
        try {
          await prisma.colaConstruccion.create({ data: {...cola, fechaInicio: parseOptionalDate(cola.fechaInicio), fechaFinalizacion: parseOptionalDate(cola.fechaFinalizacion), createdAt: parseDate(cola.createdAt)} });
        } catch (e) {
            console.error(`Error creando cola construccion ${cola.id}`, e);
        }
    }
    for (const cola of colasReclutamiento) {
        try {
          await prisma.colaReclutamiento.create({ data: {...cola, fechaInicio: parseDate(cola.fechaInicio), fechaFinalizacion: parseDate(cola.fechaFinalizacion)} });
        } catch (e) {
           console.error(`Error creando cola reclutamiento ${cola.id}`, e);
        }
    }
    for (const cola of colasMisiones) {
       try {
        await prisma.colaMisiones.create({ data: {...cola, fechaLlegada: parseDate(cola.fechaLlegada), fechaRegreso: parseOptionalDate(cola.fechaRegreso), fechaInicio: parseDate(cola.fechaInicio)} });
       } catch(e) {
           console.error(`Error creando cola mision ${cola.id}`, e);
       }
    }
  
    for (const cola of colasEntrenamiento) {
      try {
        await prisma.colaEntrenamiento.create({ data: {...cola, fechaInicio: parseDate(cola.fechaInicio), fechaFinalizacion: parseDate(cola.fechaFinalizacion)} });
      } catch(e) {
          console.error(`Error creando cola entrenamiento ${cola.id}`, e);
      }
    }


    for (const familyData of families) {
        try {
          const createdAt = parseDate(familyData.createdAt);
          const updatedAt = parseDate(familyData.updatedAt);
          await prisma.family.upsert({
              where: { id: familyData.id },
              update: { ...familyData, createdAt, updatedAt },
              create: { ...familyData, createdAt, updatedAt },
          });
        } catch(e) {
           console.error(`Error con familia ${familyData.id}`, e);
        }
    }
  
    for (const memberData of familyMembers) {
        try {
          const joinedAt = parseDate(memberData.joinedAt);
          await prisma.familyMember.upsert({
              where: { userId: memberData.userId },
              update: { ...memberData, joinedAt },
              create: { ...memberData, joinedAt },
          });
        } catch(e) {
           console.error(`Error con miembro de familia ${memberData.userId}`, e);
        }
    }
  
    for (const invitationData of familyInvitations) {
        try {
          await prisma.familyInvitation.upsert({
              where: { id: invitationData.id },
              update: { ...invitationData, expiresAt: parseDate(invitationData.expiresAt) },
              create: { ...invitationData, expiresAt: parseDate(invitationData.expiresAt) },
          });
        } catch(e) {
           console.error(`Error con invitacion de familia ${invitationData.id}`, e);
        }
    }
  
    for (const req of roomRequirements) {
      try {
          await prisma.roomRequirement.create({ data: req });
      } catch(e) {
          console.error(`Error con requisito de habitacion ${req.roomId}`, e);
      }
    }
    
    for (const req of trainingRequirements) {
      try {
        await prisma.trainingRequirement.create({ data: req });
      } catch (e) {
        console.error(`Error con requisito de entrenamiento ${req.trainingId}`, e);
      }
    }

    for (const bonus of tropaBonus) {
        try {
            await prisma.tropaBonusContrincante.create({ data: bonus });
        } catch (e) {
            console.error(`Error con bonus de tropa ${bonus.tropaAtacanteId}`, e);
        }
    }

    for (const messageData of messages) {
        try {
            await prisma.message.upsert({
                where: { id: messageData.id },
                update: { ...messageData, createdAt: parseDate(messageData.createdAt) },
                create: { ...messageData, createdAt: parseDate(messageData.createdAt) },
            });
        } catch(e) {
            console.error(`Error con mensaje ${messageData.id}`, e);
        }
    }
  
    console.log('🎉 Importación de datos relacionales finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de relaciones:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
