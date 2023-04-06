import { appRouter } from '$lib/server/trpc/routers/_app';
import { createTRPCContext } from '$lib/server/trpc/trpc';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as SentryNode from '@sentry/node';
import crypto from 'crypto';
import { getUser } from '$lib/server/supabase/supabase';

/**
 * This handle function receives the Supabase Auth Token and validates it to get the user.
 *
 * Not using the full SvelteKit auth helpers here as we don't need a Supbase instance
 * specifically for the user. We just need to validate their JWT to get their data.
 *
 * See https://github.com/supabase/supabase/issues/147
 */

const handleSupabase: Handle = async ({ event, resolve }) => {
	// Read custom set cookie to get user credentials
	const supabaseToken = event.cookies.get('sb-access-token') ?? '';

	/**
	 * Store getUser helper function in locals.
	 *
	 * Doing it this way allows us to set a helper method in locals that can get the user,
	 * but ensures we don't have to run this function, which makes a call to Supabase,
	 * unless we need to.
	 */
	event.locals.getUser = async () => await getUser(supabaseToken);

	return await resolve(event);
};

/**
 * This handle function attaches a server-side caller for the tRPC router
 * to locals, allowing us to call tRPC functions on the server.
 *
 * See https://trpc.io/docs/server/server-side-calls
 */
const handleTRPC: Handle = async ({ event, resolve }) => {
	event.locals.caller = appRouter.createCaller(createTRPCContext(event));
	return await resolve(event);
};

export const handle = sequence(handleSupabase, handleTRPC);

/**
 * Error handling with Sentry to track errors.
 * See https://www.youtube.com/watch?v=UJ3JtNIifR8&ab_channel=Huntabyte
 */

SentryNode.init({
	dsn: PUBLIC_SENTRY_DSN,

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
	environment: process.env.VERCEL_ENV ?? 'development'
});

export const handleError: HandleServerError = async ({ error, event }) => {
	const { params, route, url, request, locals, platform } = event;
	const userId = (await locals.getUser())?.id ?? 'No user';

	const errorId = crypto.randomUUID();
	SentryNode.captureException(error, {
		contexts: { sveltekit: { params, route, url, request, userId, platform, errorId } }
	});

	return {
		message: 'An unexpected error occurred.',
		errorId
	};
};
