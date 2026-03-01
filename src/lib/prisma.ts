import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }

  // When using Neon's pgBouncer pooler, tell Prisma to use simple protocol queries
  // (no prepared statements) to avoid "cached plan must not change result type" errors
  // that occur after schema migrations.
  if (databaseUrl.includes('-pooler.') && !databaseUrl.includes('pgbouncer=true')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
