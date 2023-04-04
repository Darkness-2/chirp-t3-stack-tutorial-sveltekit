<script lang="ts">
	import { page } from '$app/stores';
	import CreatePostWizard from '$lib/components/CreatePostWizard.svelte';
	import Feed from '$lib/components/Feed.svelte';
	import { userStore } from '$lib/stores/userStore';

	console.log('Page rendered');

	const signInWithGithub = async () => {
		await $userStore.supabase.auth.signInWithOAuth({
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
	{#if !$userStore.user}
		<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signInWithGithub}>
			Sign in with Github
		</button>
	{/if}

	<!-- If user signed in, show the create post wizard -->
	{#if $userStore.user}
		<CreatePostWizard />
	{/if}
</div>

<Feed />
