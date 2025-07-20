
import { PrismaClient } from '@prisma/client/edge';
import * as datosUsuarios from './datosactuales/user.json';
import * as datosPropiedades from './datosactuales/propiedad.json';
import * as datosHabitaciones from './datosactuales/habitacionUsuario.json';
import * as datosEntrenamientos from './datosactuales/entrenamientoUsuario.json';
import * as datosTropas from './datosactuales/tropaUsuario.json';
import * as datosPuntuacion from './datosactuales/puntuacionUsuario.json';
import * as datosColaConstruccion from './datosactuales/colaConstruccion.json';
import * as datosColaReclutamiento from './datosactuales/colaReclutamiento.json';
import * as datosColaMisiones from './datosactuales/colaMisiones.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando la importación de datos de usuarios y su progreso...');
  
  const usuarios = (datosUsuarios as any).default || datosUsuarios;
  const propiedades = (datosPropiedades as any).default || datosPropiedades;
  const habitaciones = (datosHabitaciones as any).default || datosHabitaciones;
  const entrenamientos = (datosEntrenamientos as any).default || datosEntrenamientos;
  const tropas = (datosTropas as any).default || datosTropas;
  const puntuaciones = (datosPuntuacion as any).default || datosPuntuacion;
  const colasConstruccion = (datosColaConstruccion as any).default || datosColaConstruccion;
  const colasReclutamiento = (datosColaReclutamiento as any).default || datosColaReclutamiento;
  const colasMisiones = (datosColaMisiones as any).default || datosColaMisiones;

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
      const { updatedAt, ...restOfPuntData } = puntData;
      await prisma.puntuacionUsuario.upsert({
          where: { id: restOfPuntData.id },
          update: restOfPuntData,
          create: restOfPuntData,
      });
     } catch (e) {
        console.error(`Error con puntuacion ${puntData.id}`, e);
     }
  }
  
  // Limpiar colas existentes para evitar duplicados en cada seed
  await prisma.colaMisiones.deleteMany({});
  await prisma.colaReclutamiento.deleteMany({});
  await prisma.colaConstruccion.deleteMany({});

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

  console.log('🎉 Importación de datos de usuario finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de datos de usuario:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
