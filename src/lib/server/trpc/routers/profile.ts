import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import clerkClient from '@clerk/clerk-sdk-node';
import { TRPCError } from '@trpc/server';
import { filterUserForClient } from '$lib/helpers/userData';

export const profileRouter = createTRPCRouter({
	getUserByUsername: publicProcedure
		.input(
			z.object({
				username: z.string()
			})
		)
		.query(async ({ input }) => {
			const [user] = await clerkClient.users.getUserList({
				username: [input.username]
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			return filterUserForClient(user);
		})
});
