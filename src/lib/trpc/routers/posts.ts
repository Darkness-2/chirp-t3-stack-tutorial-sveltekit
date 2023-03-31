import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc.server';

export const postsRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.prisma.post.findMany({
			take: 100,
			orderBy: {
				createdAt: 'desc'
			}
		});

		return posts;
	}),

	getByID: publicProcedure
		.input(
			z.object({
				id: z.string().cuid()
			})
		)
		.query(async ({ ctx, input }) => {
			const post = await ctx.prisma.post.findUnique({
				where: { id: input.id }
			});

			if (!post) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Post not found'
				});
			}

			return post;
		})
});
