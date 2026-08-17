import { PrismaClient } from "@prisma/client";

// Exportamos a instância única para ser usada em qualquer lugar do projeto
export const prisma = new PrismaClient();
