import { postsRouter } from '$lib/trpc/routers/posts';
import { createTRPCContext } from '$lib/trpc/trpc.server';
import type { PageServerLoad } from './$types';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export const load: PageServerLoad = async (event) => {
	const caller = postsRouter.createCaller(createTRPCContext());
	const post = await caller.getById({ id: event.params.id });

	event.setHeaders({
		'cache-control': `max-age=${FIVE_MINUTES_IN_SECONDS}, must-revalidate`
	});

	return {
		post
	};
};
