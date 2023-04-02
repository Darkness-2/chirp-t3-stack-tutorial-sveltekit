import { error, type Config } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TRPCError } from '@trpc/server';
import { ISR_BYPASS_TOKEN } from '$env/static/private';

const ONE_HOUR_IN_SECONDS = 60 * 60;

export const load: PageServerLoad = async ({ locals, params, setHeaders }) => {
	const userId = params.userId;

	try {
		const user = await locals.caller.profile.getUserById({ userId });

		setHeaders({
			'cache-control': `max-age=${ONE_HOUR_IN_SECONDS}`
		});

		return {
			user
		};
	} catch (e) {
		if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
			throw error(404, {
				message: 'User not found'
			});
		} else {
			throw error(500, {
				message: 'Something went wrong'
			});
		}
	}
};

export const config: Config = {
	isr: {
		expiration: ONE_HOUR_IN_SECONDS,
		bypassToken: ISR_BYPASS_TOKEN
	}
};
