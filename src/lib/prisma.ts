import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "";

  // SQLite (file:...) — use LibSQL adapter (Prisma v7 requires an adapter)
  if (dbUrl.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({ url: dbUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // PostgreSQL — use pg adapter
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
