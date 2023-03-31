import { appRouter } from '$lib/trpc/routers/_app.server';
import { createTRPCContext } from '$lib/trpc/trpc.server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * This handle function is part of Supabase's recommended approach to autentication.
 *
 * See https://supabase.com/docs/guides/auth/auth-helpers/sveltekit
 * or https://github.com/supabase/auth-helpers/tree/main/packages/sveltekit
 */

const handleSupabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		supabaseUrl: PUBLIC_SUPABASE_URL,
		event
	});

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	return await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
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
			createContext: createTRPCContext
		});
	}

	return await resolve(event);
};

export const handle = sequence(handleSupabase, handleTRPC);
