
import { TipoTropa } from '@prisma/client';
import prisma from '../src/lib/prisma/prisma';
import * as datosTropas from './datosactuales/configuracionTropa.json';

const tropasDefensaIds = [
    "trabajador_ilegal",
    "centinela",
    "policia",
    "guardaespaldas",
    "guardia_de_honor"
];

interface TropaData {
    id: string;
    nombre: string;
    urlImagen: string;
    descripcion: string;
    costoArmas: number;
    costoMunicion: number;
    costoDolares: number;
    duracion: number;
    puntos: number;
    ataque: number;
    defensa: number;
    capacidad: number;
    velocidad: number;
    salario: number;
    tipo?: TipoTropa;
    requisitos: string[];
    bonusAtaque: string[];
    bonusDefensa: string[];
}

async function main() {
  console.log('🛡️ Iniciando la importación de configuración de tropas...');

  const tropas: TropaData[] = (datosTropas as any).default || datosTropas;

  for (const tropa of tropas) {
    try {
        const tipoTropa = tropasDefensaIds.includes(tropa.id) ? TipoTropa.DEFENSA : tropa.tipo || TipoTropa.ATAQUE;

      await prisma.configuracionTropa.upsert({
        where: { id: tropa.id },
        update: {
          nombre: tropa.nombre,
          urlImagen: tropa.urlImagen,
          descripcion: tropa.descripcion,
          costoArmas: tropa.costoArmas,
          costoMunicion: tropa.costoMunicion,
          costoDolares: tropa.costoDolares,
          duracion: tropa.duracion,
          puntos: tropa.puntos,
          ataque: tropa.ataque,
          defensa: tropa.defensa,
          capacidad: tropa.capacidad,
          velocidad: tropa.velocidad,
          salario: tropa.salario,
          tipo: tipoTropa,
          requisitos: tropa.requisitos,
          bonusAtaque: tropa.bonusAtaque,
          bonusDefensa: tropa.bonusDefensa,
        },
        create: {
          id: tropa.id,
          nombre: tropa.nombre,
          urlImagen: tropa.urlImagen,
          descripcion: tropa.descripcion,
          costoArmas: tropa.costoArmas,
          costoMunicion: tropa.costoMunicion,
          costoDolares: tropa.costoDolares,
          duracion: tropa.duracion,
          puntos: tropa.puntos,
          ataque: tropa.ataque,
          defensa: tropa.defensa,
          capacidad: tropa.capacidad,
          velocidad: tropa.velocidad,
          salario: tropa.salario,
          tipo: tipoTropa,
          requisitos: tropa.requisitos,
          bonusAtaque: tropa.bonusAtaque,
          bonusDefensa: tropa.bonusDefensa,
        },
      });
      console.log(`✅ Configuración para '${tropa.nombre}' procesada.`);
    } catch (error) {
      console.error(`❌ Error procesando '${tropa.nombre}':`, error);
    }
  }

  console.log('🎉 Importación de configuración de tropas finalizada.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error general en el script de importación de tropas:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

