import { supabaseAdminClient } from '$lib/auth/supabase.server';
import type { Post } from '@prisma/client';
import type { User } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc.server';

const githubUserDataSchema = z.object({
	user_name: z.string(),
	avatar_url: z.string().url()
});

const filterUserForClient = (user: User) => {
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
		})
});
