<script lang="ts">
	import { author } from '$lib/author';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} - {author.name}</title>
	<meta name="description" content={data.title} />
</svelte:head>

<article class="mx-auto max-w-2xl px-6 py-16">
	<a href="/" class="text-sm text-neutral-500 hover:text-white inline-block mb-8">&larr; Back</a>

	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight mb-3">{data.title}</h1>
		<div class="flex items-baseline gap-3 text-sm text-neutral-600">
			<span>{data.category}</span>
			<span>/</span>
			<time datetime={data.date}>{data.formattedDate}</time>
			<span>/</span>
			<span>{data.readingMinutes} min read</span>
		</div>
	</header>

	<div class="prose prose-neutral prose-invert max-w-none">
		{@html data.html}
	</div>
</article>
