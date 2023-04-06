import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { RequestHandler } from './$types';
import { appRouter } from '$lib/server/trpc/routers/_app';
import { createTRPCContext } from '$lib/server/trpc/trpc';

/**
 * This API endpoint responds to requests to /api/trpc and passes them to
 * the tRPC fetch request handler.
 *
 * See https://trpc.io/docs/server/adapters/fetch
 */
const handleTRPC: RequestHandler = async (event) => {
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
		createContext: () => createTRPCContext(event)
	});
};

// tRPC applies to GET and POST requests
export const GET = handleTRPC;
export const POST = handleTRPC;
