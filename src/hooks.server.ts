import { appRouter } from '$lib/trpc/routers/_app.server';
import { createTRPCContext } from '$lib/trpc/trpc.server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

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
			createContext: createTRPCContext
		});
	}

	return await resolve(event);
};

export const handle = sequence(handleTRPC);
