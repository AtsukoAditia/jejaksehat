import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { jejakSehatPrisma?: PrismaClient };

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.jejakSehatPrisma) return globalForPrisma.jejakSehatPrisma;

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.jejakSehatPrisma = client;
  }

  return client;
}

export async function closePrismaClient(): Promise<void> {
  await globalForPrisma.jejakSehatPrisma?.$disconnect();
  globalForPrisma.jejakSehatPrisma = undefined;
}
