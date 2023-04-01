import * as SentrySvelte from '@sentry/svelte';
import type { HandleClientError } from '@sveltejs/kit';

SentrySvelte.init({
	dsn: 'https://427b63aaf29c4e7097c4cba19a6a67ac@o4504940896256000.ingest.sentry.io/4504940907003904',

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
