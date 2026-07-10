import { error } from '@sveltejs/kit';
import { getPostBySlug, getPostSlugs, formatDate } from '$lib/posts';

export const prerender = true;

export async function load({ params }) {
	const post = getPostBySlug(params.slug);
	if (!post) throw error(404, 'Post not found');
	return {
		slug: post.slug,
		title: post.title,
		html: post.html,
		date: post.date,
		category: post.category,
		formattedDate: formatDate(post.date),
		readingMinutes: post.readingMinutes
	};
}

export const entries = () => {
	return getPostSlugs().map((slug) => ({ slug }));
};
