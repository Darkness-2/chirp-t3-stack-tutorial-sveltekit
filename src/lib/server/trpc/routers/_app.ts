import { createTRPCRouter, publicProcedure } from '../trpc';
import { postsRouter } from './posts';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	hello: publicProcedure.query(() => {
		return 'Hello world';
	}),
	posts: postsRouter
});

// Export type definition of API
export type AppRouter = typeof appRouter;
