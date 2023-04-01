import { supabaseAdminClient } from '$lib/server/supabase/supabase';
import { filterUserForClient } from '$lib/helpers/userData';
import type { Post } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';
import { ratelimit } from '$lib/server/upstash/ratelimiter';

const addUserDataToPosts = async (posts: Post[]) => {
	const usersToGet = new Set(posts.map((post) => post.authorId));

	const supabaseRequests = [...usersToGet].map((user) =>
		supabaseAdminClient.auth.admin.getUserById(user)
	);
	const users = await Promise.all(supabaseRequests);

	return posts.map((post) => {
		const author = users.find((user) => user.data.user?.id === post.authorId);

		if (!author || !author.data.user) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Author not found'
			});
		}

		const filteredAuthor = filterUserForClient(author.data.user);

		return {
			post,
			author: {
				...filteredAuthor
			}
		};
	});
};

export const postsRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.prisma.post.findMany({
			take: 100,
			orderBy: {
				createdAt: 'desc'
			}
		});

		return await addUserDataToPosts(posts);
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string().cuid() }))
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

			return (await addUserDataToPosts([post]))[0];
		}),

	getByAuthorId: publicProcedure
		.input(z.object({ authorId: z.string() }))
		.query(async ({ ctx, input }) => {
			const posts = await ctx.prisma.post.findMany({
				where: {
					authorId: input.authorId
				},
				take: 100,
				orderBy: {
					createdAt: 'desc'
				}
			});

			return await addUserDataToPosts(posts);
		}),

	create: privateProcedure
		.input(
			z.object({
				content: z.string().emoji('Only emojis are allowed').min(1).max(255)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.session.user.id;

			const { success } = await ratelimit.limit(authorId);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS'
				});
			}

			const post = await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content
				}
			});

			return post;
		})
});
