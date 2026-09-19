
import prisma from '../src/lib/prisma/prisma';
import * as datosUsuarios from './datosactuales/user.json';
import * as datosPropiedades from './datosactuales/propiedad.json';

async function main() {
  console.log('🚀 Iniciando la importación de usuarios y propiedades...');
  
  const usuarios = (datosUsuarios as any).default || datosUsuarios;
  const propiedades = (datosPropiedades as any).default || datosPropiedades;

  const parseDate = (val: any) => (val && typeof val === 'string' && !isNaN(new Date(val).getTime()) ? new Date(val) : new Date());

  for (const userData of usuarios) {
    try {
      console.log(`👤 Procesando usuario: ${userData.username}`);
      const createdAt = parseDate(userData.createdAt);
      const updatedAt = parseDate(userData.updatedAt);
      const lastSeen = parseDate(userData.lastSeen);
      await prisma.user.upsert({
        where: { id: userData.id },
        update: { ...userData, createdAt, updatedAt, lastSeen },
        create: { ...userData, createdAt, updatedAt, lastSeen },
      });
    } catch (e) {
      console.error(`Error con usuario ${userData.username}`, e);
    }
  }

  for (const propData of propiedades) {
    try {
      console.log(`🏡 Procesando propiedad: ${propData.nombre} de usuario ${propData.userId}`);
      const ultimaActualizacion = propData.ultimaActualizacion && !isNaN(new Date(propData.ultimaActualizacion).getTime())
        ? new Date(propData.ultimaActualizacion)
        : new Date();
      await prisma.propiedad.upsert({
        where: { id: propData.id },
        update: { ...propData, ultimaActualizacion },
        create: { ...propData, ultimaActualizacion },
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
