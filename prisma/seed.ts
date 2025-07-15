import { PrismaClient } from '@prisma/client';

// Importa los datos desde los archivos JSON
import * as datosHabitaciones from './room_types_data.json';
import * as datosReglasHabitaciones from './room_scaling_rules_updated.json';
import * as datosEntrenamientos from './entrenamientos_types_data.json';
import * as datosTropas from './tropas_types_data.json';

// Define interfaces for your data structures to ensure type safety
interface HabitacionData {
  nombre: string;
  desc: string;
  imagen: string;
  arm: number;
  mun: number;
  dol: number;
  duracion: number;
  produccion: number;
  puntos: number;
}

interface EntrenamientoData {
    nombre: string;
    imagen: string;
    arm: number;
    mun: number;
    dol: number;
    duracion: number;
    puntos: number;
}

interface TropaData {
    id: string;
    nombre: string;
    imagen: string;
    desc: string;
    arm: number;
    mun: number;
    dol: number;
    duracion: number;
    puntos: number;
    ataque: number;
    defensa: number;
    capacidad: number;
    velocidad: number;
    salario: number;
    requisitos: string[];
    bonificacionesA: string[];
    bonificacionesD: string[];
}

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el proceso de seeding...');

  // --- Carga de Usuarios ---
  console.log('👤 Cargando datos de usuarios...');
  await prisma.user.upsert({
    where: { id: 'clp2x0y0z0000v9q9h9g9e9d9' },
    update: {},
    create: {
      id: 'clp2x0y0z0000v9q9h9g9e9d9',
      name: 'El Padrino',
      title: 'Jefe de la Familia',
      avatarUrl: 'https://placehold.co/100x100.png',
    },
  });
  await prisma.user.upsert({
    where: { id: 'clp2x1y1z1111v9q9h9g9e9d1' },
    update: {},
    create: {
      id: 'clp2x1y1z1111v9q9h9g9e9d1',
      name: 'Luca Brasi',
      title: 'Sicario',
      avatarUrl: 'https://placehold.co/100x100.png',
    },
  });
  await prisma.user.upsert({
    where: { id: 'clp2x2y2z2222v9q9h9g9e9d2' },
    update: {},
    create: {
      id: 'clp2x2y2z2222v9q9h9g9e9d2',
      name: 'Sonny Corleone',
      title: 'Caporegime',
      avatarUrl: 'https://placehold.co/100x100.png',
    },
  });
  console.log('✅ Usuarios cargados.');

  // --- Carga de Habitaciones ---
  console.log('🏠 Cargando datos de habitaciones...');
  for (const idHabitacion of Object.keys(datosHabitaciones)) {
    // La clave "default" puede aparecer si el JSON no está bien estructurado en ES Modules
    if (idHabitacion === 'default') continue;

    const habitacion = (datosHabitaciones as Record<string, HabitacionData>)[idHabitacion];
    // Las reglas no están en la misma estructura, accedemos directamente por la clave
    const regla = (datosReglasHabitaciones as Record<string, any>)[idHabitacion];

    await prisma.configuracionHabitacion.upsert({
      where: { id: idHabitacion },
      update: {}, // No actualizamos nada si ya existe, solo la creamos.
      create: {
        id: idHabitacion,
        nombre: habitacion.nombre,
        descripcion: habitacion.desc,
        urlImagen: habitacion.imagen,
        costoArmas: habitacion.arm,
        costoMunicion: habitacion.mun,
        costoDolares: habitacion.dol,
        duracion: habitacion.duracion,
        produccion: habitacion.produccion,
        puntos: habitacion.puntos,
        // Nota: Las fórmulas y factores de coste más complejos se deben manejar en la lógica de tu aplicación,
        // ya que el schema actual no los almacena como strings.
      },
    });
  }
  console.log('✅ Habitaciones cargadas.');

  // --- Carga de Entrenamientos ---
  console.log('🏋️ Cargando datos de entrenamientos...');
  for (const idEntrenamiento of Object.keys(datosEntrenamientos)) {
    if (idEntrenamiento === 'default') continue;
    const entrenamiento = (datosEntrenamientos as Record<string, any>)[idEntrenamiento];

    await prisma.configuracionEntrenamiento.upsert({
      where: { id: idEntrenamiento },
      update: {},
      create: {
        id: idEntrenamiento,
        nombre: entrenamiento.nombre,
        urlImagen: entrenamiento.imagen,
        costoArmas: entrenamiento.arm,
        costoMunicion: entrenamiento.mun,
        costoDolares: entrenamiento.dol,
        duracion: entrenamiento.duracion,
        puntos: entrenamiento.puntos,
      },
    });
  }
  console.log('✅ Entrenamientos cargados.');

  // --- Carga de Tropas ---
  console.log('🛡️ Cargando datos de tropas...');
  for (const idTropa of Object.keys(datosTropas)) {
    if (idTropa === 'default') continue;
    const tropa = (datosTropas as Record<string, TropaData>)[idTropa];

    await prisma.configuracionTropa.upsert({
      where: { id: tropa.id },
      update: {},
      create: {
        id: tropa.id,
        nombre: tropa.nombre,
        urlImagen: tropa.imagen,
        descripcion: tropa.desc,
        costoArmas: tropa.arm,
        costoMunicion: tropa.mun,
        costoDolares: tropa.dol,
        duracion: tropa.duracion,
        puntos: tropa.puntos,
        ataque: tropa.ataque,
        defensa: tropa.defensa,
        capacidad: tropa.capacidad,
        velocidad: tropa.velocidad,
        salario: tropa.salario,
        requisitos: tropa.requisitos,
        bonusAtaque: tropa.bonificacionesA,
        bonusDefensa: tropa.bonificacionesD,
      },
    });
  }
  console.log('✅ Tropas cargadas.');
}

main()
  .then(async () => {
    console.log('🎉 Seeding finalizado exitosamente.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el proceso de seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
