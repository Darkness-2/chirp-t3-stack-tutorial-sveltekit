import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import clerkClient from '@clerk/clerk-sdk-node';
import type { Post } from '@prisma/client';
import { filterUserForClient } from '$lib/helpers/userData';

const addUserDataToPosts = async (posts: Post[]) => {
	const users = (
		await clerkClient.users.getUserList({
			userId: [...new Set(posts.map((post) => post.authorId))],
			limit: 100
		})
	).map(filterUserForClient);

	return posts.map((post) => {
		const author = users.find((user) => user.id === post.authorId);

		if (!author || !author.username) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Author not found'
			});
		}

		return {
			post,
			author: {
				...author,
				username: author.username
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
		})
});
