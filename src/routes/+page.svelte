<script lang="ts">
	import { trpc } from '$lib/trpc/trpc.client';
	import type { PageData } from './$types';
	import { createQuery } from '@tanstack/svelte-query';

	export let data: PageData;

	const query = createQuery({
		queryKey: ['hello'],
		queryFn: () => trpc.hello.query()
	});
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold text-blue-700">Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

	<div>
		<p>Example of CSR using Svelte #await</p>
		{#await trpc.hello.query()}
			<p>Loading...</p>
		{:then data}
			<p>{`${data} from CSR`}</p>
		{/await}
	</div>

	<div>
		<p>Example of CSR using Tanstack Query</p>
		{#if $query.isLoading}
			<p>Loading...</p>
		{:else if $query.isError}
			<p>{$query.error}</p>
		{:else if $query.isSuccess}
			<p>{`${$query.data} from Tanstack`}</p>
		{/if}
	</div>

	<div>
		<p>Example of SSR using tRPC and +page.server.ts</p>
		<p>{data.pageServerLoadExample}</p>
	</div>
</div>
