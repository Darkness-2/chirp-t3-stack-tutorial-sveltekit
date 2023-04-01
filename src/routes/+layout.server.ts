import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	return {
		session: event.locals.getSession()
	};
};
