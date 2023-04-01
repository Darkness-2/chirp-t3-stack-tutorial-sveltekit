import type { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const githubUserDataSchema = z.object({
	user_name: z.string(),
	avatar_url: z.string().url()
});

export const filterUserForClient = (user: User) => {
	if (!user.identities || !user.identities[0].identity_data) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "User didn't have expected data"
		});
	}

	const userData = githubUserDataSchema.safeParse(user.identities[0].identity_data);

	if (!userData.success) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "User didn't have expected data"
		});
	}

	return {
		id: user.id,
		username: userData.data.user_name,
		avatarUrl: userData.data.avatar_url
	};
};
