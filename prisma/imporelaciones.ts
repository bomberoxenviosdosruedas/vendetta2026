

import { PrismaClient } from '@prisma/client/edge';
import * as datosFamilies from './datosactuales/family.json';
import * as datosFamilyMembers from './datosactuales/familyMember.json';
import * as datosFamilyInvitations from './datosactuales/familyInvitation.json';
import * as datosRoomRequirements from './datosactuales/roomRequirement.json';
import * as datosTrainingRequirements from './datosactuales/trainingRequirement.json';
import * as datosTropaBonus from './datosactuales/tropaBonusContrincante.json';

const prisma = new PrismaClient();

async function main() {
    console.log('🤝 Iniciando la importación de datos relacionales (familias, requisitos, etc.)...');
    
    const families = (datosFamilies as any).default || datosFamilies;
    const familyMembers = (datosFamilyMembers as any).default || datosFamilyMembers;
    const familyInvitations = (datosFamilyInvitations as any).default || datosFamilyInvitations;
    const roomRequirements = (datosRoomRequirements as any).default || datosRoomRequirements;
    const trainingRequirements = (datosTrainingRequirements as any).default || datosTrainingRequirements;
    const tropaBonus = (datosTropaBonus as any).default || datosTropaBonus;

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
