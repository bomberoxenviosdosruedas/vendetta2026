

import prisma from '../src/lib/prisma/prisma';
import * as datosSuperUsuarios from './datosactuales/superUser.json';

async function main() {
  console.log('👤✨ Iniciando la importación de superusuarios...');

  const superUsuarios = (datosSuperUsuarios as any).default || datosSuperUsuarios;

  for (const superUserData of superUsuarios) {
    try {
      await prisma.superUser.upsert({
        where: { username: superUserData.username },
        update: {
          password: superUserData.password
        },
        create: {
          id: superUserData.id,
          username: superUserData.username,
          password: superUserData.password,
        },
      });
      console.log(`✅ Superusuario '${superUserData.username}' procesado.`);
    } catch (error) {
      console.error(`❌ Error procesando superusuario '${superUserData.username}':`, error);
    }
  }

  console.log('🎉 Importación de superusuarios finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de superusuarios:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
