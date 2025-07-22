
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const exportDir = path.join(__dirname, 'datosactuales');

// Helper para convertir BigInt a Number en los objetos
function convertBigIntsToNumbers(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Array) {
    return obj.map(convertBigIntsToNumbers);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'bigint') {
        return [key, Number(value)];
      }
      if (typeof value === 'object') {
        return [key, convertBigIntsToNumbers(value)];
      }
      return [key, value];
    })
  );
}


async function main() {
  console.log('⚙️  Iniciando la exportación de datos completos...');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`📂 Directorio de exportación creado en: ${exportDir}`);
  }

  const modelsToExport: (keyof PrismaClient)[] = [
    'configuracionHabitacion',
    'configuracionEntrenamiento',
    'configuracionTropa',
    'user',
    'propiedad',
    'habitacionUsuario',
    'entrenamientoUsuario',
    'tropaUsuario',
    'puntuacionUsuario',
    'colaConstruccion',
    'colaReclutamiento',
    'colaMisiones',
    'colaEntrenamiento',
    'family',
    'familyMember',
    'familyInvitation',
    'message',
    'roomRequirement',
    'trainingRequirement',
    'tropaBonusContrincante',
    'poderAtaque'
  ];

  for (const modelName of modelsToExport) {
    try {
      if (typeof (prisma as any)[modelName]?.findMany !== 'function') {
        console.log(`⚠️  El modelo '${modelName}' no tiene el método findMany y será omitido.`);
        continue;
      }
      
      const data = await (prisma as any)[modelName].findMany();
      const sanitizedData = convertBigIntsToNumbers(data);
      const filePath = path.join(exportDir, `${modelName}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(sanitizedData, null, 2), 'utf-8');
      
      console.log(`✅ Datos del modelo '${modelName}' exportados a ${filePath}`);
    } catch (error) {
      console.error(`❌ Error exportando el modelo '${modelName}':`, error);
    }
  }

  console.log('🎉 Exportación de datos finalizada exitosamente.');
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
