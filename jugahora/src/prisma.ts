// src/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined; // Declaración global para el cliente de Prisma
}

// Inicializa el cliente de Prisma solo una vez
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Manteniendo los logs
});

// Asigna a global para evitar nuevas instancias en entornos de desarrollo
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Manejo de la desconexión
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prisma;
