

import { PrismaClient } from '@prisma/client/edge';
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


const prisma = new PrismaClient();

async function main() {
    console.log('🤝 Iniciando la importación de datos relacionales y de progreso...');
    
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
         await prisma.puntuacionUsuario.upsert({
             where: { id: restOfPuntData.id },
             update: { ...restOfPuntData, updatedAt: new Date(restOfPuntData.updatedAt) },
             create: { ...restOfPuntData, updatedAt: new Date(restOfPuntData.updatedAt) },
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
          await prisma.colaConstruccion.create({ data: {...cola, fechaInicio: cola.fechaInicio ? new Date(cola.fechaInicio) : null, fechaFinalizacion: cola.fechaFinalizacion ? new Date(cola.fechaFinalizacion) : null, createdAt: new Date(cola.createdAt)} });
        } catch (e) {
            console.error(`Error creando cola construccion ${cola.id}`, e);
        }
    }
    for (const cola of colasReclutamiento) {
        try {
          await prisma.colaReclutamiento.create({ data: {...cola, fechaInicio: new Date(cola.fechaInicio), fechaFinalizacion: new Date(cola.fechaFinalizacion)} });
        } catch (e) {
           console.error(`Error creando cola reclutamiento ${cola.id}`, e);
        }
    }
    for (const cola of colasMisiones) {
       try {
        await prisma.colaMisiones.create({ data: {...cola, fechaLlegada: new Date(cola.fechaLlegada), fechaRegreso: cola.fechaRegreso ? new Date(cola.fechaRegreso) : null, fechaInicio: new Date(cola.fechaInicio)} });
       } catch(e) {
           console.error(`Error creando cola mision ${cola.id}`, e);
       }
    }
  
    for (const cola of colasEntrenamiento) {
      try {
        await prisma.colaEntrenamiento.create({ data: {...cola, fechaInicio: new Date(cola.fechaInicio), fechaFinalizacion: new Date(cola.fechaFinalizacion)} });
      } catch(e) {
          console.error(`Error creando cola entrenamiento ${cola.id}`, e);
      }
    }


    for (const familyData of families) {
        try {
          await prisma.family.upsert({
              where: { id: familyData.id },
              update: familyData,
              create: familyData,
          });
        } catch(e) {
           console.error(`Error con familia ${familyData.id}`, e);
        }
    }
  
    for (const memberData of familyMembers) {
        try {
          await prisma.familyMember.upsert({
              where: { userId: memberData.userId },
              update: memberData,
              create: memberData,
          });
        } catch(e) {
           console.error(`Error con miembro de familia ${memberData.userId}`, e);
        }
    }
  
    for (const invitationData of familyInvitations) {
        try {
          await prisma.familyInvitation.upsert({
              where: { id: invitationData.id },
              update: { ...invitationData, expiresAt: new Date(invitationData.expiresAt) },
              create: { ...invitationData, expiresAt: new Date(invitationData.expiresAt) },
          });
        } catch(e) {
           console.error(`Error con invitacion de familia ${invitationData.id}`, e);
        }
    }
  
    for (const req of roomRequirements) {
      try {
          await prisma.roomRequirement.upsert({
              where: { roomId_requiredRoomId: { roomId: req.roomId, requiredRoomId: req.requiredRoomId } },
              update: req,
              create: req,
          });
      } catch(e) {
          console.error(`Error con requisito de habitacion ${req.roomId}`, e);
      }
    }
    
    for (const req of trainingRequirements) {
      try {
          await prisma.trainingRequirement.upsert({
              where: { trainingId_requiredTrainingId: { trainingId: req.trainingId, requiredTrainingId: req.requiredTrainingId } },
              update: req,
              create: req,
          });
      } catch(e) {
          console.error(`Error con requisito de entrenamiento ${req.trainingId}`, e);
      }
    }

    for (const bonus of tropaBonus) {
        try {
            await prisma.tropaBonusContrincante.upsert({
                where: { tropaAtacanteId_tropaDefensoraId: { tropaAtacanteId: bonus.tropaAtacanteId, tropaDefensoraId: bonus.tropaDefensoraId } },
                update: bonus,
                create: bonus,
            });
        } catch (e) {
            console.error(`Error con bonus de tropa ${bonus.tropaAtacanteId}`, e);
        }
    }

    for (const messageData of messages) {
        try {
            await prisma.message.upsert({
                where: { id: messageData.id },
                update: { ...messageData, createdAt: new Date(messageData.createdAt) },
                create: { ...messageData, createdAt: new Date(messageData.createdAt) },
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
