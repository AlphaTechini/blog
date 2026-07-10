import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, basename, join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { marked } from 'marked';

interface PostManifestEntry {
	slug: string;
	title: string;
	date: string;
	category: string;
	excerpt: string;
	html: string;
	readingMinutes: number;
}

const POSTS_DIR = resolve(process.cwd(), 'posts');
const VIRTUAL_ID = 'virtual:posts';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

function getGitAddDate(filePath: string): string {
	try {
		const repoRoot = execSync('git rev-parse --show-toplevel', {
			cwd: process.cwd(),
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'ignore']
		}).trim();
		const relToRepo = relative(repoRoot, filePath).replace(/\\/g, '/');
		const date = execSync(`git log --diff-filter=A --follow --format=%aI -- "${relToRepo}"`, {
			cwd: repoRoot,
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'ignore']
		})
			.trim()
			.split('\n')
			.filter(Boolean)[0];
		if (date) return date;
	} catch {
		// file not tracked in git yet, fall through to filesystem
	}
	const stats = statSync(filePath);
	const birth = stats.birthtime;
	if (birth && birth.getTime() > 0) return birth.toISOString();
	return stats.mtime.toISOString();
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) return { data: {}, content: raw };
	const yamlBlock = match[1];
	const content = match[2];
	const data: Record<string, unknown> = {};
	for (const line of yamlBlock.split(/\r?\n/)) {
		const m = line.match(/^(\w+):\s*(.*)$/);
		if (m) data[m[1]] = m[2].replace(/^["']|["']$/g, '');
	}
	return { data, content };
}

function extractTitle(content: string, fallback: string): string {
	const h1 = content.match(/^#\s+(.+)$/m);
	return h1 ? h1[1].trim() : fallback;
}

function extractExcerpt(content: string, max = 160): string {
	const withoutTitle = content.replace(/^#\s+.+$/m, '');
	const text = withoutTitle
		.replace(/[#>*_`~\-\[\]!]/g, '')
		.replace(/\[(.*?)\]\(.*?\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > max ? text.slice(0, max).trimEnd() + '...' : text;
}

function readingTime(content: string): number {
	const words = content.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}

function resolveDate(data: Record<string, unknown>, filePath: string): string {
	if (typeof data.date === 'string' && data.date) return new Date(data.date).toISOString();
	return getGitAddDate(filePath);
}

function buildManifest(): PostManifestEntry[] {
	if (!existsSync(POSTS_DIR)) return [];
	const files = readdirSync(POSTS_DIR).filter(
		(f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md'
	);
	const entries: PostManifestEntry[] = files.map((file) => {
		const fullPath = join(POSTS_DIR, file);
		const slug = basename(file, '.md');
		const raw = readFileSync(fullPath, 'utf-8');
		const { data, content } = parseFrontmatter(raw);
		const title = (typeof data.title === 'string' && data.title) || extractTitle(content, slug);
		const html = marked.parse(content, { async: false }) as string;
		const date = resolveDate(data, fullPath);
		const category = (typeof data.category === 'string' && data.category) || 'General';
		const excerpt =
			(typeof data.description === 'string' && data.description) || extractExcerpt(content);
		return {
			slug,
			title,
			date,
			category,
			excerpt,
			html,
			readingMinutes: readingTime(content)
		};
	});
	return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function postsPlugin() {
	return {
		name: 'posts-manifest',
		resolveId(id: string) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},
		load(id: string) {
			if (id !== RESOLVED_ID) return;
			const posts = buildManifest();
			return `export const posts = ${JSON.stringify(posts)};`;
		},
		configureServer(server: any) {
			server.watcher.add(POSTS_DIR);
			server.watcher.on('change', (file: string) => {
				if (file.endsWith('.md') && file.startsWith(POSTS_DIR)) {
					const posts = buildManifest();
					const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
					if (mod) {
						server.moduleGraph.invalidateModule(mod);
						server.ws.send({ type: 'full-reload' });
					}
				}
			});
		}
	};
}
