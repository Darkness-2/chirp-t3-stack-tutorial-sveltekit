import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import Clerk from '@clerk/clerk-js';

let clerk: Clerk;

export const getClerk = async () => {
	if (clerk?.isReady()) {
		return clerk;
	} else {
		clerk = new Clerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
		await clerk.load({});
		return clerk;
	}
};
