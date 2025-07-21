

import { execSync } from 'child_process';
import path from 'path';

// --- CONFIGURACIÓN ---
// Define la lista de scripts a ejecutar en el orden deseado.
const scriptsToRun = [
  'impoconfiguracionHabitacion.ts',
  'impoconfiguracionEntrenamiento.ts',
  'impoconfiguracionTropa.ts',
  'impopoderataque.ts',
  'imposuperusuario.ts',
  'impousuarioprueba.ts', // Ahora solo carga User y Propiedad
  'imporelaciones.ts',    // Carga todas las demás relaciones y datos dependientes
];
// ---------------------

// --- HELPERS DE LOGGING ---
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function logHeader(message: string) {
  console.log(`\n${colors.magenta}${colors.bold}🌱 --- ${message} --- 🌱${colors.reset}`);
}

function logStep(message: string) {
  console.log(`${colors.cyan}🔹 ${message}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message: string, error: any) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
  console.error(error);
}

// --- FUNCIÓN PRINCIPAL ---
async function main() {
  logHeader('INICIANDO PROCESO DE SEEDING COMPLETO');

  const prismaDir = __dirname; 

  for (const scriptName of scriptsToRun) {
    const scriptPath = path.join(prismaDir, scriptName);
    logStep(`Ejecutando script: ${scriptName}...`);
    
    try {
      execSync(`bun ${scriptPath}`, { stdio: 'inherit' });
      logSuccess(`Script ${scriptName} finalizado exitosamente.`);
    } catch (error) {
      logError(`Ocurrió un error al ejecutar ${scriptName}. El proceso de seeding se detendrá.`, error);
      process.exit(1);
    }
  }

  logHeader('PROCESO DE SEEDING FINALIZADO EXITOSAMENTE');
}

main().catch((e) => {
  logError('Ocurrió un error inesperado en el orquestador del seed.', e);
  process.exit(1);
});
