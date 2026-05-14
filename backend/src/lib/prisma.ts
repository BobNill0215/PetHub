import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Railway auto-provides these env vars when PostgreSQL is in the project
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER || 'pethub';
  const password = process.env.PGPASSWORD || 'pethub123';
  const database = process.env.PGDATABASE || 'pethub';
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});
