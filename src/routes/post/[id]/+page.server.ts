import { error, type Config } from '@sveltejs/kit';
import { TRPCError } from '@trpc/server';
import type { PageServerLoad } from './$types';
import { ISR_BYPASS_TOKEN } from '$env/static/private';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export const load: PageServerLoad = async ({ locals, setHeaders, params }) => {
	try {
		const fullPost = await locals.caller.posts.getById({ id: params.id });

		setHeaders({
			'cache-control': `max-age=${FIVE_MINUTES_IN_SECONDS}, public, must-revalidate`
		});

		return {
			fullPost
		};
	} catch (e) {
		if (e instanceof TRPCError && e.code === 'NOT_FOUND') {
			throw error(404, {
				message: 'Post not found'
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
		expiration: FIVE_MINUTES_IN_SECONDS,
		bypassToken: ISR_BYPASS_TOKEN
	}
};
