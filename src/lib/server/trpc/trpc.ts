import { prisma } from '$lib/server/db/db';
import type { RequestEvent } from '@sveltejs/kit';
import { initTRPC, type inferAsyncReturnType, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * 1. Context
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

export const createTRPCContext = (event: RequestEvent) => {
	return {
		event,
		prisma
	};
};

export type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

/**
 * 2. Initialization
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<TRPCContext>().create({
	transformer: superjson,
	errorFormatter: ({ shape, error }) => {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
			}
		};
	}
});

/**
 * 3. Router, middleware, and procedures
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/lib/trpc/routers" directory.
 *
 *  This is how you create new routers and sub-routers in your tRPC API.
 *  See: https://trpc.io/docs/router
 *
 * Custom middleware can also be created here to do things such as require users to be authorized.
 */

export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */

export const publicProcedure = t.procedure;

/**
 * Private (authenticated) procedure
 *
 * This middleware and procedure ensures that the user must have a valid Supabase session.
 */

const ensureUserIsAuthenticated = t.middleware(async ({ ctx, next }) => {
	const user = ctx.event.locals.user;

	if (!user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED'
		});
	}

	return next({
		ctx: {
			user
		}
	});
});

export const privateProcedure = t.procedure.use(ensureUserIsAuthenticated);
