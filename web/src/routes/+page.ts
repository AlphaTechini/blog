import { getAllPosts, formatDate } from '$lib/posts';

export const prerender = true;

export async function load() {
	const posts = getAllPosts().map((p) => ({
		slug: p.slug,
		title: p.title,
		date: p.date,
		excerpt: p.excerpt,
		readingMinutes: p.readingMinutes
	}));
	return { posts: posts.map((p) => ({ ...p, formattedDate: formatDate(p.date) })) };
}
