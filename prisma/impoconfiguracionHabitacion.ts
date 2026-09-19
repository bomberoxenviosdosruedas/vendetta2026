
import prisma from '../src/lib/prisma/prisma';
import * as datosHabitaciones from './datosactuales/configuracionHabitacion.json';

interface HabitacionData {
  id: string;
  nombre: string;
  descripcion: string;
  urlImagen: string;
  costoArmas: number;
  costoMunicion: number;
  costoDolares: number;
  duracion: number;
  produccionBase: number;
  produccionRecurso: string | null;
  puntos: number;
}

async function main() {
  console.log('🏠 Iniciando la importación de configuración de habitaciones...');

  const habitaciones: HabitacionData[] = (datosHabitaciones as any).default || datosHabitaciones;

  for (const habitacion of habitaciones) {
    try {
      await prisma.configuracionHabitacion.upsert({
        where: { id: habitacion.id },
        update: {
          nombre: habitacion.nombre,
          descripcion: habitacion.descripcion,
          urlImagen: habitacion.urlImagen,
          costoArmas: habitacion.costoArmas,
          costoMunicion: habitacion.costoMunicion,
          costoDolares: habitacion.costoDolares,
          duracion: habitacion.duracion,
          produccionBase: habitacion.produccionBase,
          produccionRecurso: habitacion.produccionRecurso,
          puntos: habitacion.puntos,
        },
        create: {
          id: habitacion.id,
          nombre: habitacion.nombre,
          descripcion: habitacion.descripcion,
          urlImagen: habitacion.urlImagen,
          costoArmas: habitacion.costoArmas,
          costoMunicion: habitacion.costoMunicion,
          costoDolares: habitacion.costoDolares,
          duracion: habitacion.duracion,
          produccionBase: habitacion.produccionBase,
          produccionRecurso: habitacion.produccionRecurso,
          puntos: habitacion.puntos,
        },
      });
      console.log(`✅ Configuración para '${habitacion.nombre}' procesada.`);
    } catch (error) {
      console.error(`❌ Error procesando '${habitacion.nombre}':`, error);
    }
  }

  console.log('🎉 Importación de configuración de habitaciones finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
