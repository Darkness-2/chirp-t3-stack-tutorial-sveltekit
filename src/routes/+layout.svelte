<script lang="ts">
	import { browser } from '$app/environment';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<main class="flex h-screen justify-center">
		<div class="h-full w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
			<slot />
		</div>
	</main>
</QueryClientProvider>
