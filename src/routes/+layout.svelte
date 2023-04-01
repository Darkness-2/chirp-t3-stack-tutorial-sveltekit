<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import '../app.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	const signOut = async () => {
		await supabase.auth.signOut();
	};
</script>

<svelte:head>
	<title>Chirp</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<main class="flex h-screen justify-center">
		<div class="h-full w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
			<slot />

			<!-- Bottom of page buttons -->
			<div class="flex gap-4 p-4">
				{#if session}
					<button class="rounded-xl bg-slate-800 p-4 hover:underline" on:click={signOut}>
						Sign out
					</button>
				{/if}

				{#if $page.url.pathname !== '/'}
					<a href="/" class="rounded-xl bg-slate-800 p-4 hover:underline">Back to home</a>
				{/if}
			</div>
		</div>
	</main>
</QueryClientProvider>
