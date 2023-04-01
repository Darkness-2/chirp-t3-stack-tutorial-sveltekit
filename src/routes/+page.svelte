<script lang="ts">
	import { page } from '$app/stores';
	import CreatePostWizard from '$lib/components/CreatePostWizard.svelte';
	import Feed from '$lib/components/Feed.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ session, supabase } = data);

	const signInWithGithub = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: $page.url.href
			}
		});
	};
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
		<CreatePostWizard />
	{/if}
</div>

<Feed />
