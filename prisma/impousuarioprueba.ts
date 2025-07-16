
import { PrismaClient } from '@prisma/client/edge';
import * as datosUsuarios from './importar/user.json';
import * as datosHabitaciones from './importar/configuracionHabitacion.json';
import * as datosEntrenamientos from './importar/configuracionEntrenamiento.json';
import * as datosTropas from './importar/configuracionTropa.json';

const prisma = new PrismaClient();

interface UserData {
  id: string;
  name: string;
  username: string;
  password?: string;
  title?: string;
  avatarUrl?: string;
}

async function main() {
  console.log('🚀 Iniciando la importación del usuario de prueba completo...');

  const usuarios: UserData[] = (datosUsuarios as any).default || datosUsuarios;
  const habitaciones = (datosHabitaciones as any).default || datosHabitaciones;
  const entrenamientos = (datosEntrenamientos as any).default || datosEntrenamientos;
  const tropas = (datosTropas as any).default || datosTropas;

  for (const userData of usuarios) {
    try {
      console.log(`👤 Procesando usuario: ${userData.username}`);

      // 1. Crear o actualizar el usuario
      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {
          name: userData.name,
          title: userData.title,
          avatarUrl: userData.avatarUrl,
        },
        create: {
          name: userData.name,
          username: userData.username,
          password: userData.password || 'password123',
          title: userData.title,
          avatarUrl: userData.avatarUrl,
        },
      });

      // 2. Crear o actualizar la propiedad principal
      const propiedad = await prisma.propiedad.upsert({
        where: {
          ciudad_barrio_edificio: {
            ciudad: 1,
            barrio: 1,
            edificio: 1,
          },
        },
        update: { userId: user.id },
        create: {
          userId: user.id,
          nombre: 'Propiedad Principal',
          ciudad: 1,
          barrio: 1,
          edificio: 1,
        },
      });

      // 3. Crear progreso inicial del usuario
      await prisma.progresoUsuario.upsert({
          where: { userId: user.id },
          update: {},
          create: {
              userId: user.id,
              dolares: 100000,
              armas: 50000,
              municion: 50000,
              alcohol: 10000,
          }
      });
      
      // 3.1 Crear puntuación inicial del usuario
      await prisma.puntuacionUsuario.upsert({
          where: { userId: user.id },
          update: {},
          create: {
              userId: user.id,
              puntosHabitaciones: 0,
              puntosTropas: 0,
              puntosEntrenamientos: 0,
              puntosTotales: 0,
          }
      });

      console.log('🏠 Asignando todas las habitaciones en Nivel 1...');
      for (const habitacion of habitaciones) {
        await prisma.habitacionUsuario.upsert({
          where: {
            propiedadId_configuracionHabitacionId: {
              propiedadId: propiedad.id,
              configuracionHabitacionId: habitacion.id,
            },
          },
          update: { nivel: 1 },
          create: {
            propiedadId: propiedad.id,
            configuracionHabitacionId: habitacion.id,
            nivel: 1,
          },
        });
      }

      console.log('🏋️ Asignando todos los entrenamientos en Nivel 1...');
      for (const entrenamiento of entrenamientos) {
        await prisma.entrenamientoUsuario.upsert({
            where: {
                userId_configuracionEntrenamientoId: {
                    userId: user.id,
                    configuracionEntrenamientoId: entrenamiento.id,
                }
            },
            update: { nivel: 1 },
            create: {
                userId: user.id,
                configuracionEntrenamientoId: entrenamiento.id,
                nivel: 1
            }
        });
      }
      
      console.log('🛡️ Asignando todas las tropas (1 unidad)...');
       for (const tropa of tropas) {
        await prisma.tropaUsuario.upsert({
            where: {
                userId_configuracionTropaId: {
                    userId: user.id,
                    configuracionTropaId: tropa.id,
                }
            },
            update: { cantidad: 1 },
            create: {
                userId: user.id,
                configuracionTropaId: tropa.id,
                cantidad: 1
            }
        });
      }


      console.log(`✅ Usuario '${userData.username}' configurado exitosamente.`);

    } catch (error) {
      console.error(`❌ Error procesando al usuario '${userData.username}':`, error);
    }
  }

  console.log('🎉 Importación de usuario de prueba finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de prueba:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
