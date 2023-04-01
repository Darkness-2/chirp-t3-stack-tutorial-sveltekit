<script lang="ts">
	import PostView from '$lib/components/PostView.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ fullPost } = data);
</script>

<svelte:head>
	<title>{`${fullPost.post.content} - ${fullPost.author.username}`}</title>
</svelte:head>

<PostView {fullPost} />
