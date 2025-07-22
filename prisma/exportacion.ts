import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const exportDir = path.join(__dirname, 'export');

// Helper para convertir BigInt a Number antes de serializar a JSON
function convertBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigInts);
  }
  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'bigint') {
          newObj[key] = Number(value);
        } else {
          newObj[key] = convertBigInts(value);
        }
      }
    }
    return newObj;
  }
  return obj;
}


async function main() {
  console.log('🌱 Iniciando el proceso de exportación de datos...');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`📂 Directorio de exportación creado en: ${exportDir}`);
  }

  const models: (keyof PrismaClient)[] = [
    'user',
    'propiedad',
    'habitacionUsuario',
    'entrenamientoUsuario',
    'tropaUsuario',
    'configuracionHabitacion',
    'configuracionEntrenamiento',
    'configuracionTropa',
  ];

  for (const modelName of models) {
    try {
      const model = modelName as string;
      // Usamos 'any' porque el tipo de PrismaClient[modelName] es dinámico
      const data = await (prisma as any)[model].findMany();
      const sanitizedData = convertBigInts(data);
      const filePath = path.join(exportDir, `${String(model)}.json`);
      
      // Usamos JSON.stringify con un espaciado de 2 para que sea legible
      fs.writeFileSync(filePath, JSON.stringify(sanitizedData, null, 2), 'utf-8');
      
      console.log(`✅ Datos del modelo '${String(model)}' exportados a ${filePath}`);
    } catch (error) {
      console.error(`❌ Error exportando el modelo '${String(modelName)}':`, error);
    }
  }

  console.log('🎉 Exportación finalizada exitosamente.');
}

main()
  .catch(async (e) => {
    console.error('❌ Error durante el proceso de exportación:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
