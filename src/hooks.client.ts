import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as SentrySvelte from '@sentry/svelte';
import type { HandleClientError } from '@sveltejs/kit';

SentrySvelte.init({
	dsn: PUBLIC_SENTRY_DSN,

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1.0,
	environment: window.location.href
});

export const handleError: HandleClientError = ({ error, event }) => {
	const { params, route, url } = event;

	const errorId = crypto.randomUUID();
	SentrySvelte.captureException(error, {
		contexts: { sveltekit: { params, route, url, errorId } }
	});

	return {
		message: 'An unexpected error occurred.',
		errorId
	};
};
