
import { PrismaClient } from '@prisma/client/edge';

import * as datosHabitaciones from './room_types_data.json';
import * as datosEscalado from './room_scaling_rules_updated.json';
import * as datosEntrenamientos from './entrenamientos_types_data.json';
import * as datosTropas from './tropas_types_data.json';

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

interface EscaladoData {
    produccion_recurso?: string;
    formula_aumento_produccion?: string;
    factor_costo_por_nivel: number;
    formula_tiempo?: string;
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

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando el proceso de seeding...');

  console.log('🏠 Cargando datos de configuración de habitaciones y escalado...');
  const roomConfigIds = Object.keys(datosHabitaciones).filter(id => id !== 'default');
  for (const idHabitacion of roomConfigIds) {
    const habitacion = (datosHabitaciones as Record<string, HabitacionData>)[idHabitacion];
    const escalado = (datosEscalado as Record<string, EscaladoData>)[idHabitacion];

    await prisma.configuracionHabitacion.upsert({
      where: { id: idHabitacion },
      update: {}, 
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
      },
    });

    if (escalado) {
        await prisma.configuracionEscaladoHabitacion.upsert({
            where: { id: idHabitacion },
            update: {},
            create: {
                id: idHabitacion,
                produccionRecurso: escalado.produccion_recurso,
                formulaAumentoProduccion: escalado.formula_aumento_produccion,
                factorCostoPorNivel: escalado.factor_costo_por_nivel,
                formulaTiempo: escalado.formula_tiempo,
            }
        });
    }
  }
  console.log('✅ Configuración de habitaciones y escalado cargada.');


  console.log('🏋️ Cargando datos de configuración de entrenamientos...');
  const trainingConfigIds = Object.keys(datosEntrenamientos).filter(id => id !== 'default');
  for (const idEntrenamiento of trainingConfigIds) {
    const entrenamiento = (datosEntrenamientos as Record<string, EntrenamientoData>)[idEntrenamiento];
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
  console.log('✅ Configuración de entrenamientos cargada.');

  console.log('🛡️ Cargando datos de configuración de tropas...');
  const troopConfigIds = Object.keys(datosTropas).filter(id => id !== 'default');
  for (const idTropa of troopConfigIds) {
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
  console.log('✅ Configuración de tropas cargada.');

  console.log('👤 Creando o actualizando usuario y su progreso inicial...');
  
  const bomberox = await prisma.user.upsert({
    where: { username: 'bomberox' },
    update: {},
    create: {
      name: 'Bomberox',
      username: 'bomberox',
      password: '123456789',
      title: 'Jefe de la Familia',
      avatarUrl: '/img/bomberox.png',
    },
  });

  await prisma.progresoUsuario.upsert({
    where: { userId: bomberox.id },
    update: {},
    create: {
      userId: bomberox.id,
      dolares: 500,
      armas: 100,
      municion: 200,
      alcohol: 10,
    },
  });

  console.log('🏢 Asignando habitaciones iniciales al usuario...');
  for (const roomId of roomConfigIds) {
    await prisma.habitacionUsuario.upsert({
      where: {
        userId_configuracionHabitacionId: {
          userId: bomberox.id,
          configuracionHabitacionId: roomId,
        },
      },
      update: {},
      create: {
        userId: bomberox.id,
        configuracionHabitacionId: roomId,
        nivel: roomId === 'oficina_del_jefe' ? 1 : 0,
      },
    });
  }

  console.log('✅ Usuario, progreso y habitaciones iniciales cargados.');
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
