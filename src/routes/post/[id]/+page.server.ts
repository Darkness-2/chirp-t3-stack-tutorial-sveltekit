import { postsRouter } from '$lib/trpc/routers/posts';
import { createTRPCContext } from '$lib/trpc/trpc.server';
import { error } from '@sveltejs/kit';
import { TRPCError } from '@trpc/server';
import type { PageServerLoad } from './$types';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export const load: PageServerLoad = async (event) => {
	const caller = postsRouter.createCaller(createTRPCContext());

	try {
		const post = await caller.getById({ id: event.params.id });

		event.setHeaders({
			'cache-control': `max-age=${FIVE_MINUTES_IN_SECONDS}, must-revalidate`
		});

		return {
			post
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
