
import { PrismaClient } from '@prisma/client/edge';
import * as datosEntrenamientos from './datosactuales/configuracionEntrenamiento.json';

const prisma = new PrismaClient();

interface EntrenamientoData {
  id: string;
  nombre: string;
  urlImagen: string;
  costoArmas: number;
  costoMunicion: number;
  costoDolares: number;
  duracion: number;
  puntos: number;
}

async function main() {
  console.log('🏋️ Iniciando la importación de configuración de entrenamientos...');

  const entrenamientos: EntrenamientoData[] = (datosEntrenamientos as any).default || datosEntrenamientos;

  for (const entrenamiento of entrenamientos) {
    try {
      await prisma.configuracionEntrenamiento.upsert({
        where: { id: entrenamiento.id },
        update: {
          nombre: entrenamiento.nombre,
          urlImagen: entrenamiento.urlImagen,
          costoArmas: entrenamiento.costoArmas,
          costoMunicion: entrenamiento.costoMunicion,
          costoDolares: entrenamiento.costoDolares,
          duracion: entrenamiento.duracion,
          puntos: entrenamiento.puntos,
        },
        create: {
          id: entrenamiento.id,
          nombre: entrenamiento.nombre,
          urlImagen: entrenamiento.urlImagen,
          costoArmas: entrenamiento.costoArmas,
          costoMunicion: entrenamiento.costoMunicion,
          costoDolares: entrenamiento.costoDolares,
          duracion: entrenamiento.duracion,
          puntos: entrenamiento.puntos,
        },
      });
      console.log(`✅ Configuración para '${entrenamiento.nombre}' procesada.`);
    } catch (error) {
      console.error(`❌ Error procesando '${entrenamiento.nombre}':`, error);
    }
  }

  console.log('🎉 Importación de configuración de entrenamientos finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de entrenamientos:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
