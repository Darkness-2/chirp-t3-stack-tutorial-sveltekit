import { browser } from '$app/environment';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import type { AppRouter } from '../server/trpc/routers/_app';

/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `trpc` object which
 * contains the tRPC endpoints usable on the client.
 *
 * We also create a few inference helpers for input and output types.
 */

const getBaseURL = () => {
	if (browser) return ''; // Browser should always use relative URL
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use Vercel URL
	return `http://localhost:${process.env.PORT ?? 5173}`; // Local development should use localhost
};

export const trpc = createTRPCProxyClient<AppRouter>({
	/**
	 * Transformer used for data de-serialization from the server.
	 * See https://trpc.io/docs/data-transformers
	 */
	transformer: superjson,

	/**
	 * Links used to determine request flow from client to server.
	 * See https://trpc.io/docs/links
	 */
	links: [
		/**
		 * Logger will be enabled in development, or if there is an error.
		 */
		loggerLink({
			enabled: (opts) => {
				return (
					process.env.NODE_ENV === 'development' ||
					(opts.direction === 'down' && opts.result instanceof Error)
				);
			}
		}),
		httpBatchLink({
			url: `${getBaseURL()}/api/trpc`
		})
	]
});

/**
 * Inference helper for inputs.
 * Example: type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 * Example: type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
