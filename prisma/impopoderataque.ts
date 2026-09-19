

import prisma from '../src/lib/prisma/prisma';
import * as datosPoderAtaque from './datosactuales/poderAtaquemodificado.json';

interface PoderAtaqueData {
  propiedades: number;
  honor: number;
  modificador: number;
}

async function main() {
  console.log('💥 Iniciando la importación de datos de Poder de Ataque...');

  const poderesAtaque: PoderAtaqueData[] = (datosPoderAtaque as any).default || datosPoderAtaque;

  for (const paData of poderesAtaque) {
    try {
      await prisma.poderAtaque.upsert({
        where: { 
            propiedades_honor: {
                propiedades: paData.propiedades,
                honor: paData.honor
            } 
        },
        update: {
          modificador: paData.modificador,
        },
        create: {
          propiedades: paData.propiedades,
          honor: paData.honor,
          modificador: paData.modificador,
        },
      });
    } catch (error) {
      console.error(`❌ Error procesando Poder de Ataque para ${paData.propiedades} propiedades y honor ${paData.honor}:`, error);
    }
  }

  console.log('🎉 Importación de datos de Poder de Ataque finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de Poder de Ataque:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
