<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex flex-col p-4">
	<span class="text-2xl font-bold">{$page.status}</span>
	<span>{$page.error?.message}</span>
	{#if $page.error?.errorId}
		<span>Error ID: {$page.error.errorId}</span>
	{/if}
</div>
