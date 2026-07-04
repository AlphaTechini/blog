declare module 'virtual:posts' {
	export interface PostManifestEntry {
		slug: string;
		title: string;
		date: string;
		excerpt: string;
		html: string;
		readingMinutes: number;
	}
	export const posts: PostManifestEntry[];
}
