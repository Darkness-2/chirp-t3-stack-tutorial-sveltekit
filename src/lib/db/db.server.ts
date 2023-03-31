import { PrismaClient } from '@prisma/client';

/**
 * Ensures only one instance of prisma is instantiated at a time.
 * See: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
