import { appRouter } from '$lib/trpc/routers/_app.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const caller = appRouter.createCaller({});
	const data = await caller.hello();

	return {
		pageServerLoadExample: `${data} from +page.server.ts`
	};
};
