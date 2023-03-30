<script lang="ts">
	import { trpc } from '$lib/trpc/trpc.client';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold text-blue-700">Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

	<div>
		<p>Example of CSR using Svelte #await</p>
		{#await trpc.hello.query()}
			<div>Loading...</div>
		{:then data}
			<p>{`${data} from CSR`}</p>
		{/await}
	</div>

	<div>
		<p>Example of SSR using tRPC and +page.server.ts</p>
		<p>{data.pageServerLoadExample}</p>
	</div>
</div>
