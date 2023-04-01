import type { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const githubUserDataSchema = z.object({
	user_name: z.string(),
	avatar_url: z.string().url()
});

export type GithubUserData = z.infer<typeof githubUserDataSchema>;

export const filterUserForClient = (user: User) => {
	if (!user.user_metadata) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "User didn't have expected data"
		});
	}

	const userData = githubUserDataSchema.safeParse(user.user_metadata);

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
