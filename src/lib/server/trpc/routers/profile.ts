import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { supabaseAdminClient } from '$lib/server/supabase/supabase';
import { TRPCError } from '@trpc/server';
import { filterUserForClient } from '$lib/helpers/userData';

export const profileRouter = createTRPCRouter({
	getUserById: publicProcedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.query(async ({ input }) => {
			const { data } = await supabaseAdminClient.auth.admin.getUserById(input.userId);

			if (!data.user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			return filterUserForClient(data.user);
		})
});
