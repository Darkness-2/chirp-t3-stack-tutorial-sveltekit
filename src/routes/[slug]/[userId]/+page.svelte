<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/client/trpc';
	import LoadingPage from '$lib/components/LoadingPage.svelte';
	import PostView from '$lib/components/PostView.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ user } = data);

	const postsQuery = createQuery({
		queryKey: ['posts', data.user.id],
		queryFn: () => trpc.posts.getByAuthorId.query({ authorId: $page.params.userId })
	});
</script>

<svelte:head>
	<title>{`@${user.username}`}</title>
</svelte:head>

<div class="relative h-36 bg-slate-600">
	<img
		src={user.avatarUrl}
		alt={`@${user.username}'s profile picture'`}
		class="absolute bottom-0 left-0 -mb-[64px] ml-4 h-32 w-32 rounded-full border-4 border-black bg-black"
	/>
</div>

<div class="h-[64px]" />

<div class="p-4 text-2xl font-bold">
	{`@${user.username}`}
</div>

<div class="w-full border-b border-slate-400" />

{#if $postsQuery.isLoading}
	<LoadingPage />
{:else if !$postsQuery.data || $postsQuery.data.length === 0}
	<div>User has no posts</div>
{:else}
	<div class="flex flex-col">
		{#each $postsQuery.data as fullPost (fullPost.post.id)}
			<PostView {fullPost} />
		{/each}
	</div>
{/if}
