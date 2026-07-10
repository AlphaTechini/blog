<script lang="ts">
	import { author } from '$lib/author';

	let { data } = $props();
</script>

<svelte:head>
	<title>{author.name} - Blog</title>
	<meta name="description" content={author.bio} />
</svelte:head>

<header class="border-b border-neutral-800">
	<div class="mx-auto max-w-2xl px-6 py-16">
		<p class="text-sm tracking-widest text-neutral-500 uppercase mb-3">Blog</p>
		<h1 class="text-4xl font-bold tracking-tight mb-2">{author.name}</h1>
		<p class="text-lg text-neutral-400">{author.tagline}</p>
	</div>
</header>

<section class="mx-auto max-w-2xl px-6 py-12">
	<p class="text-neutral-300 leading-relaxed">{author.bio}</p>

	<div class="flex flex-wrap gap-x-5 gap-y-1 mt-6 text-sm text-neutral-400">
		<a
			href={author.website}
			target="_blank"
			rel="noopener"
			class="hover:text-white underline underline-offset-4"
			>{author.website.replace(/^https?:\/\//, '')}</a
		>
		<span class="text-neutral-700">/</span>
		<a
			href={`https://github.com/${author.github}`}
			target="_blank"
			rel="noopener"
			class="hover:text-white underline underline-offset-4">GitHub</a
		>
		<span class="text-neutral-700">/</span>
		<a
			href={`https://x.com/${author.xHandle}`}
			target="_blank"
			rel="noopener"
			class="hover:text-white underline underline-offset-4">@{author.xHandle}</a
		>
	</div>

	<div class="mt-8 space-y-4">
		{#each Object.entries(author.skills) as [category, items]}
			<div class="flex flex-col gap-1 sm:flex-row sm:gap-4">
				<span class="text-xs uppercase tracking-wider text-neutral-500 sm:w-28 sm:shrink-0 sm:pt-1"
					>{category}</span
				>
				<div class="flex flex-wrap gap-2">
					{#each items as item}
						<span class="rounded border border-neutral-800 px-2 py-0.5 text-xs text-neutral-300"
							>{item}</span
						>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="border-t border-neutral-800">
	<div class="mx-auto max-w-2xl px-6 py-12">
		<a
			href={author.website}
			target="_blank"
			rel="noopener"
			class="block rounded-lg border border-neutral-700 p-6 hover:border-neutral-500 transition-colors group"
		>
			<p class="text-sm tracking-widest text-neutral-500 uppercase mb-2">Portfolio</p>
			<p class="text-lg font-semibold group-hover:underline underline-offset-4">
				View my previous works and other projects &rarr;
			</p>
		</a>
	</div>
</section>

<section class="border-t border-neutral-800">
	<div class="mx-auto max-w-2xl px-6 py-12">
		<h2 class="text-sm tracking-widest text-neutral-500 uppercase mb-6">Posts</h2>
		{#if data.grouped.length === 0}
			<p class="text-neutral-500">
				No posts yet. Add a markdown file to the <code class="text-neutral-300">posts/</code> folder.
			</p>
		{:else}
			<div class="space-y-8">
				{#each data.grouped as group (group.category)}
					<div>
						<h3 class="text-xs tracking-widest text-neutral-600 uppercase mb-4">
							{group.category}
						</h3>
						<div class="space-y-8">
							{#each group.posts as post (post.slug)}
								<a href={`/posts/${post.slug}`} class="block group">
									<div class="flex items-baseline gap-3 text-xs text-neutral-600 mb-1">
										<time datetime={post.date}>{post.formattedDate}</time>
										<span>/</span>
										<span>{post.readingMinutes} min read</span>
									</div>
									<h4 class="text-xl font-semibold group-hover:underline underline-offset-4">
										{post.title}
									</h4>
									<p class="text-neutral-400 mt-1 leading-relaxed">{post.excerpt}</p>
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<footer class="border-t border-neutral-800">
	<div class="mx-auto max-w-2xl px-6 py-8 text-sm text-neutral-600">
		&copy; {new Date().getFullYear()}
		{author.name}
	</div>
</footer>
