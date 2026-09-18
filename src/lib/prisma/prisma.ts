import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL || '';
const isAccelerate = databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://');

function createPrismaClient() {
  const baseClient = new PrismaClient();
  if (isAccelerate) {
    return baseClient.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return baseClient;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
