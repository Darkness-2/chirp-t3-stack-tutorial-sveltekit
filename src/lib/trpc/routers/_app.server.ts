import { createTRPCRouter, publicProcedure } from '../trpc.server';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	hello: publicProcedure.query(() => {
		return 'Hello world';
	})
});

// Export type definition of API
export type AppRouter = typeof appRouter;
