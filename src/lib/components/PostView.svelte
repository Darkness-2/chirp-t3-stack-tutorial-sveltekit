<script lang="ts">
	import type { RouterOutputs } from '$lib/client/trpc';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	// Props
	type PostWithUser = RouterOutputs['posts']['getAll'][number];
	export let fullPost: PostWithUser;

	$: ({ post, author } = fullPost);
</script>

<div class="flex gap-3 border-b border-slate-400 p-4">
	<img
		src={author.avatarUrl}
		alt={`@${author.username}'s profile picture'`}
		class="h-14 w-14 rounded-full"
	/>
	<div class="flex flex-col">
		<div class="flex gap-1 text-slate-300">
			<a href={`/${author.username}`}>
				<span>{`@${author.username}`}</span>
			</a>
			<a href={`/post/${post.id}`}>
				<span class="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
			</a>
		</div>
		<span class="text-2xl">{post.content}</span>
	</div>
</div>
