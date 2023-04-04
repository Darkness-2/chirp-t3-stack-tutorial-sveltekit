import { error, type Config } from '@sveltejs/kit';
import { TRPCError } from '@trpc/server';
import type { PageServerLoad } from './$types';
import { ISR_BYPASS_TOKEN } from '$env/static/private';

const ONE_HOUR_IN_SECONDS = 60 * 60;

export const load: PageServerLoad = async ({ locals, setHeaders, params }) => {
	try {
		const fullPost = await locals.caller.posts.getById({ id: params.id });

		setHeaders({
			'cache-control': `max-age=0, s-maxage=${ONE_HOUR_IN_SECONDS}, stale-while-revalidate`
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
		expiration: ONE_HOUR_IN_SECONDS,
		bypassToken: ISR_BYPASS_TOKEN
	}
};
