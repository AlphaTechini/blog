import { posts, type PostManifestEntry } from 'virtual:posts';

export type { PostManifestEntry };
export type Post = PostManifestEntry;

export function getAllPosts(): Post[] {
	return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
	return posts.map((p) => p.slug);
}

export function formatDate(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
