# web/

The SvelteKit frontend for the blog. Svelte 5 with runes, Tailwind CSS 4, deployed via `@sveltejs/adapter-vercel`.

## Development

```sh
pnpm install
pnpm dev        # dev server at localhost:5173
pnpm build      # production build
pnpm check      # typecheck (svelte-check)
pnpm lint       # prettier check
pnpm format     # prettier write
```

## Architecture

The blog has no database. Posts are markdown files in [`../posts/`](../posts/). A custom Vite plugin reads them at build time and exposes a virtual module.

### Build-time pipeline

1. [vite-plugin-posts.ts](./vite-plugin-posts.ts) scans `../posts/*.md` (skipping `_`-prefixed drafts and `README.md`).
2. For each file it parses optional frontmatter, extracts the title from the first `# heading`, pulls the git first-commit date, renders the markdown to HTML with `marked`, and computes a reading-time estimate.
3. The sorted manifest (newest first) is exposed as the `virtual:posts` module.

### Runtime data flow

- The overview page loads the manifest via [src/lib/posts.ts](./src/lib/posts.ts) and renders the post list with the author intro from [src/lib/author.ts](./src/lib/author.ts).
- The post page looks up a slug in the manifest and renders the pre-built HTML.
- Both pages are prerendered at build time.

## Key files

| Purpose                                                 | File                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Vite plugin (post scanning, git dates, markdown render) | [vite-plugin-posts.ts](./vite-plugin-posts.ts)                                 |
| Post query helpers and types                            | [src/lib/posts.ts](./src/lib/posts.ts)                                         |
| Author profile (bio, skills, repos, links)              | [src/lib/author.ts](./src/lib/author.ts)                                       |
| Virtual module type declaration                         | [src/virtual-posts.d.ts](./src/virtual-posts.d.ts)                             |
| Blog overview page                                      | [src/routes/+page.svelte](./src/routes/+page.svelte)                           |
| Overview load function                                  | [src/routes/+page.ts](./src/routes/+page.ts)                                   |
| Individual post page                                    | [src/routes/posts/[slug]/+page.svelte](./src/routes/posts/[slug]/+page.svelte) |
| Post load function (slug lookup, 404)                   | [src/routes/posts/[slug]/+page.ts](./src/routes/posts/[slug]/+page.ts)         |
| Root layout (black/white theme)                         | [src/routes/+layout.svelte](./src/routes/+layout.svelte)                       |
| Tailwind config + typography overrides                  | [src/routes/layout.css](./src/routes/layout.css)                               |
| Error page                                              | [src/routes/+error.svelte](./src/routes/+error.svelte)                         |
| Vite + adapter config                                   | [vite.config.ts](./vite.config.ts)                                             |

## Tech stack

- SvelteKit 2.69 / Svelte 5.56 (runes mode)
- Tailwind CSS 4.3 with `@tailwindcss/typography` and `@tailwindcss/forms`
- `marked` 18.0.5 for markdown rendering (build-time only)
- `@sveltejs/adapter-vercel` 6.3.4 for deployment
- TypeScript 6, Vite 8
- pnpm as package manager
