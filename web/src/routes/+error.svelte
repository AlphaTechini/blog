<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();
</script>

<svelte:head>
	<title>{page.status} - Not Found</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-24 text-center">
	<p class="text-6xl font-bold mb-4">{page.status}</p>
	<p class="text-neutral-400 mb-8">{page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/" class="text-sm text-neutral-500 hover:text-white underline underline-offset-4"
		>Back home</a
	>
</div>
