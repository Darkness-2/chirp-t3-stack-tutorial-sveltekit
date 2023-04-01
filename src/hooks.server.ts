import { appRouter } from '$lib/server/trpc/routers/_app';
import { createTRPCContext } from '$lib/server/trpc/trpc';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { authenticateSession } from '$lib/server/auth/clerk';

const handleClerk: Handle = async ({ event, resolve }) => {
	// Verify session cookie and attach to locals
	const sessionCookie = event.cookies.get('__session') ?? '';
	const session = await authenticateSession(sessionCookie);

	console.log(session);

	event.locals.session = session;

	return await resolve(event);
};

/**
 * This handle function intercepts requests to /api/trpc and passes them to the tRPC
 * fetch request handler.
 *
 * See https://trpc.io/docs/server/adapters/fetch
 */

const handleTRPC: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/trpc')) {
		return await fetchRequestHandler({
			endpoint: '/api/trpc',
			req: event.request,
			router: appRouter,
			onError:
				process.env.NODE_ENV === 'development'
					? ({ path, error }) => {
							console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
					  }
					: undefined,
			createContext: () => createTRPCContext()
		});
	}

	// Attach a server-side caller that can be used in server-side load functions
	event.locals.caller = appRouter.createCaller(createTRPCContext());

	return await resolve(event);
};

export const handle = sequence(handleClerk, handleTRPC);
