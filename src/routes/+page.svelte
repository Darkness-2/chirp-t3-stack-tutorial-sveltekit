<script lang="ts">
	import { page } from '$app/stores';
	import { isTRPCClientError, trpc } from '$lib/client/trpc';
	import Feed from '$lib/components/Feed.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { githubUserDataSchema, type GithubUserData } from '$lib/helpers/userData';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import type { PageData } from './$types';

	export let data: PageData;
	const queryClient = useQueryClient();

	$: ({ session, supabase } = data);

	// Extract user Github identity data
	$: user = githubUserDataSchema.safeParse(session?.user.user_metadata);

	const signInWithGithub = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: $page.url.href
			}
		});
	};

	let postContent = '';
	let errorText = '';

	const createPostMutation = createMutation({
		mutationFn: (postContent: string) => trpc.posts.create.mutate({ content: postContent }),
		onSuccess: () => {
			postContent = '';
			errorText = '';
			queryClient.invalidateQueries({
				queryKey: ['posts']
			});
		},
		onError: (e) => {
			if (isTRPCClientError(e)) {
				const errorMessage = e.data?.zodError?.fieldErrors.content;

				if (errorMessage && errorMessage[0]) {
					errorText = errorMessage[0];
				}
			} else {
				errorText = 'Something went wrong';
			}
		}
	});
</script>

<svelte:head>
	<title>Chirp</title>
</svelte:head>

<div class="flex flex-col gap-4 border-b border-slate-400 p-4">
	{#if !session}
		<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signInWithGithub}>
			Sign in with Github
		</button>
	{/if}

	<!-- If user signed in, show the create post wizard -->
	{#if session}
		<div class="flex w-full gap-3">
			{#if user.success}
				<img
					src={user.data.avatar_url}
					alt={`@${user.data.user_name}`}
					class="h-14 w-14 rounded-full"
				/>
			{/if}
			<input
				placeholder="Type some emojis!"
				class="grow bg-transparent outline-none"
				type="text"
				bind:value={postContent}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						if (postContent !== '') {
							$createPostMutation.mutate(postContent);
						}
					}
				}}
				disabled={$createPostMutation.isLoading}
			/>
			{#if postContent !== '' && !$createPostMutation.isLoading}
				<button
					on:click={() => $createPostMutation.mutate(postContent)}
					disabled={$createPostMutation.isLoading}>Post</button
				>
			{/if}
			{#if $createPostMutation.isLoading}
				<div class="flex items-center justify-center">
					<Spinner size={20} />
				</div>
			{/if}
		</div>
		{#if errorText}
			<div class="w-full bg-red-700 p-4">
				{errorText}
			</div>
		{/if}
	{/if}
</div>

<Feed />
