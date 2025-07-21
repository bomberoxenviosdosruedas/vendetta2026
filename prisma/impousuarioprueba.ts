
import { PrismaClient } from '@prisma/client/edge';
import * as datosUsuarios from './datosactuales/user.json';
import * as datosPropiedades from './datosactuales/propiedad.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando la importación de usuarios y propiedades...');
  
  const usuarios = (datosUsuarios as any).default || datosUsuarios;
  const propiedades = (datosPropiedades as any).default || datosPropiedades;

  for (const userData of usuarios) {
    try {
      console.log(`👤 Procesando usuario: ${userData.username}`);
      await prisma.user.upsert({
        where: { id: userData.id },
        update: { ...userData, createdAt: new Date(userData.createdAt), updatedAt: new Date(userData.updatedAt) },
        create: { ...userData, createdAt: new Date(userData.createdAt), updatedAt: new Date(userData.updatedAt) },
      });
    } catch (e) {
      console.error(`Error con usuario ${userData.username}`, e);
    }
  }

  for (const propData of propiedades) {
    try {
      console.log(`🏡 Procesando propiedad: ${propData.nombre} de usuario ${propData.userId}`);
      await prisma.propiedad.upsert({
        where: { id: propData.id },
        update: { ...propData, ultimaActualizacion: new Date(propData.ultimaActualizacion) },
        create: { ...propData, ultimaActualizacion: new Date(propData.ultimaActualizacion) },
      });
    } catch(e) {
      console.error(`Error con propiedad ${propData.id}`, e);
    }
  }

  console.log('🎉 Importación de usuarios y propiedades finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de usuarios y propiedades:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
