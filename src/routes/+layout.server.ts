import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	console.log('Layout server load ran');

	return {
		session: event.locals.getSession()
	};
};
