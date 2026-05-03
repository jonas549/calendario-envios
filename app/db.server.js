import { PrismaClient } from "@prisma/client";

// En desarrollo: reusar la instancia entre hot-reloads (evita "Too many connections" en dev)
// En producción (Vercel serverless): cachear en globalThis para reusar en instancias warm
// Sin este patrón, cada invocación serverless crea un nuevo PrismaClient con su propio pool
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;
