import { createTRPCRouter } from '../trpc';
import { postsRouter } from './posts';
import { profileRouter } from './profile';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	posts: postsRouter,
	profile: profileRouter
});

// Export type definition of API
export type AppRouter = typeof appRouter;
