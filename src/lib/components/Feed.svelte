<script lang="ts">
	import { trpc } from '$lib/client/trpc';
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
	<div>Something went wrong</div>
{:else}
	<div class="flex flex-col">
		{#each $postsQuery.data as fullPost (fullPost.post.id)}
			<PostView {fullPost} />
		{/each}
	</div>
{/if}
