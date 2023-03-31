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
	})
});
