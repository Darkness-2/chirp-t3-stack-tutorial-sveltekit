<script lang="ts">
	import { page } from '$app/stores';
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

	const signOut = async () => {
		await supabase.auth.signOut();
	};
</script>

<div class="flex border-b border-slate-400 p-4">
	{#if !session}
		<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signInWithGithub}>
			Sign in with Github
		</button>
	{/if}

	{#if session}
		TODO: Create Post Wizard
	{/if}
</div>

<Feed />

<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signOut}> Sign out </button>
