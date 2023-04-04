import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	console.log('Layout server load ran');

	return {
		user: locals.user
	};
};
