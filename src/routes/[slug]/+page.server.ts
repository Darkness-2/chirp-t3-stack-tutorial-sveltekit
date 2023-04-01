import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TRPCError } from '@trpc/server';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

export const load: PageServerLoad = async ({ locals, params, setHeaders }) => {
	const username = params.slug.replace('@', '');

	try {
		const user = locals.caller.profile.getUserByUsername({ username });

		setHeaders({
			'cache-control': `max-age=${FIVE_MINUTES_IN_SECONDS}, must-revalidate`
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
