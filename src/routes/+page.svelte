<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';

	const isSignedIn: boolean = true;
</script>

<div class="flex border-b border-slate-400 p-4">
	{#if !isSignedIn}
		<div class="flex justify-center">TODO: Clerk login</div>
	{/if}

	{#if isSignedIn}
		TODO: Create Post Wizard
	{/if}
</div>

<Feed />
