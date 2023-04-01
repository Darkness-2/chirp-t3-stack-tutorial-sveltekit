<script lang="ts">
	import { getClerk } from '$lib/client/clerk';
	import Feed from '$lib/components/Feed.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const signIn = async () => {
		const clerk = await getClerk();

		await clerk.redirectToSignIn();
	};

	$: ({ session } = data);

	$: console.log(session);
</script>

<svelte:head>
	<title>Chirp</title>
</svelte:head>

<div class="flex border-b border-slate-400 p-4">
	{#if !session}
		<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signIn}
			>Sign in with Github</button
		>
	{/if}

	{#if session}
		TODO: Create Post Wizard
	{/if}
</div>

<Feed />
