
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const exportDir = path.join(__dirname, 'datosactuales');

async function main() {
  console.log('⚙️  Iniciando la exportación de datos de configuración...');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`📂 Directorio de exportación creado en: ${exportDir}`);
  }

  const modelsToExport: (keyof PrismaClient)[] = [
    'configuracionHabitacion',
    'configuracionEntrenamiento',
    'configuracionTropa',
  ];

  for (const modelName of modelsToExport) {
    try {
      // Usamos 'any' porque el tipo de PrismaClient[modelName] es dinámico
      const data = await (prisma as any)[modelName].findMany();
      const filePath = path.join(exportDir, `${modelName}.json`);
      
      // Usamos JSON.stringify con un espaciado de 2 para que sea legible
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      
      console.log(`✅ Datos de configuración del modelo '${modelName}' exportados a ${filePath}`);
    } catch (error) {
      console.error(`❌ Error exportando el modelo '${modelName}':`, error);
    }
  }

  console.log('🎉 Exportación de configuración finalizada exitosamente.');
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
