<script lang="ts">
	import { trpc } from '$lib/trpc/trpc.client';
	import { createQuery } from '@tanstack/svelte-query';
	import LoadingPage from './LoadingPage.svelte';
	import PostView from './PostView.svelte';

	const postsQuery = createQuery({
		queryKey: ['posts'],
		queryFn: () => trpc.posts.getAll.query()
	});
</script>

{#if $postsQuery.isLoading}
	<LoadingPage />
{:else if !$postsQuery.data}
	<div>Something went wront</div>
{:else}
	<div class="flex flex-col">
		{#each $postsQuery.data as fullPost (fullPost.id)}
			<PostView post={fullPost} />
		{/each}
	</div>
{/if}
