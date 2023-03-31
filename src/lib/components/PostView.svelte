<script lang="ts">
	import type { RouterOutputs } from '$lib/trpc/trpc.client';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	// Props
	type PostWithUser = RouterOutputs['posts']['getAll'][number];
	export let post: PostWithUser;
</script>

<div class="flex gap-3 border-b border-slate-400 p-4">
	<!-- Todo, implement author image <img /> -->
	<div class="flex flex-col">
		<div class="flex gap-1 text-slate-300">
			<a href={`/todo-author-name`}>
				<span>{`@todo-author-name`}</span>
			</a>
			<a href={`/post/${post.id}`}>
				<span class="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
			</a>
		</div>
		<span class="text-2xl">{post.content}</span>
	</div>
</div>
