import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const exportDir = path.join(__dirname, 'export');

async function main() {
  console.log('🌱 Iniciando el proceso de exportación de datos...');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`📂 Directorio de exportación creado en: ${exportDir}`);
  }

  const models: (keyof PrismaClient)[] = [
    'user',
    'progresoUsuario',
    'habitacionUsuario',
    'entrenamientoUsuario',
    'tropaUsuario',
    'configuracionHabitacion',
    'configuracionEscaladoHabitacion',
    'configuracionEntrenamiento',
    'configuracionTropa',
  ];

  for (const modelName of models) {
    try {
      // Usamos 'any' porque el tipo de PrismaClient[modelName] es dinámico
      const data = await (prisma as any)[modelName].findMany();
      const filePath = path.join(exportDir, `${modelName}.json`);
      
      // Usamos JSON.stringify con un espaciado de 2 para que sea legible
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      
      console.log(`✅ Datos del modelo '${modelName}' exportados a ${filePath}`);
    } catch (error) {
      console.error(`❌ Error exportando el modelo '${modelName}':`, error);
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
