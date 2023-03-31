<script lang="ts">
	import { page } from '$app/stores';
	import PostView from '$lib/components/PostView.svelte';
	import { trpc } from '$lib/trpc/trpc.client';
	import { createQuery } from '@tanstack/svelte-query';
	import type { PageData } from './$types';

	const { id } = $page.params;
	export let data: PageData;

	const postQuery = createQuery({
		queryKey: ['post', id],
		queryFn: () => trpc.posts.getById.query({ id }),
		enabled: false,
		initialData: data.post
	});
</script>

{#if $postQuery.isLoading}
	<div>Loading...</div>
{:else if !$postQuery.data}
	<div>404</div>
{:else}
	<PostView post={$postQuery.data} />
{/if}

<svelte:head>
	<!-- Todo: Get post data into title -->
</svelte:head>
