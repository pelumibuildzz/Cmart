import { PrismaClient } from '@prisma/client';
import { getPooledDatabaseUrl } from './db-config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get the database URL with connection pooling parameters
const databaseUrl = process.env.DATABASE_URL 
  ? getPooledDatabaseUrl(process.env.DATABASE_URL)
  : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;