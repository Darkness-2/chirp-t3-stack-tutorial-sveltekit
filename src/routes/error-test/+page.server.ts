import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	throw new Error('Woah something crazy happened');
};
