<script lang="ts">
	import { trpc } from '$lib/trpc/trpc.client';
</script>

<h1 class="text-2xl font-bold text-blue-700">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#await trpc.hello.query()}
	<div>Loading...</div>
{:then data}
	{data}
{/await}
