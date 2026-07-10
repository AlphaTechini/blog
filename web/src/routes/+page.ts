import { getAllPosts, formatDate, getCategories } from '$lib/posts';

export const prerender = true;

export async function load() {
	const categories = getCategories();
	const posts = getAllPosts().map((p) => ({
		slug: p.slug,
		title: p.title,
		date: p.date,
		category: p.category,
		excerpt: p.excerpt,
		readingMinutes: p.readingMinutes
	}));
	const formattedPosts = posts.map((p) => ({ ...p, formattedDate: formatDate(p.date) }));
	const grouped = categories.map((category) => ({
		category,
		posts: formattedPosts.filter((p) => p.category === category)
	}));
	return { grouped };
}
