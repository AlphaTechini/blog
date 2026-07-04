# Project Structure

```
My Blog/
├── posts/                  Markdown blog posts (just drop .md files here)
│   ├── README.md           How to add posts (ignored by the renderer)
│   ├── hello-world.md      Sample post
│   └── backend-cloud...md  Sample post
├── web/                    SvelteKit frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── author.ts   Author profile (name, bio, skills, links, repos)
│   │   │   └── posts.ts    Post helpers (getAllPosts, getPostBySlug, formatDate)
│   │   ├── routes/
│   │   │   ├── +layout.svelte   Root layout (black bg, white text)
│   │   │   ├── layout.css       Tailwind + typography theme overrides
│   │   │   ├── +page.ts         Loads post manifest for the overview
│   │   │   ├── +page.svelte     Blog overview (author intro + post list)
│   │   │   ├── +error.svelte    404 / error page
│   │   │   └── posts/[slug]/
│   │   │       ├── +page.ts     Loads a single post by slug
│   │   │       └── +page.svelte Renders the post HTML
│   │   ├── app.d.ts             SvelteKit ambient types
│   │   └── virtual-posts.d.ts   Type declaration for the virtual:posts module
│   ├── vite-plugin-posts.ts     Build-time plugin: scans posts/, gets git dates, renders markdown
│   ├── vite.config.ts           Vite config (adapter-vercel, posts plugin, tailwind)
│   └── package.json
├── structure.md            This file
└── README.md               Project overview
```

## Where logic lives

| What | Where |
|------|-------|
| Post scanning, git date lookup, markdown rendering | [web/vite-plugin-posts.ts](./web/vite-plugin-posts.ts) |
| Post query helpers (by slug, all posts, formatting) | [web/src/lib/posts.ts](./web/src/lib/posts.ts) |
| Author profile data | [web/src/lib/author.ts](./web/src/lib/author.ts) |
| Blog overview page | [web/src/routes/+page.svelte](./web/src/routes/+page.svelte) |
| Individual post page | [web/src/routes/posts/[slug]/+page.svelte](./web/src/routes/posts/[slug]/+page.svelte) |
| Theme (black/white, typography) | [web/src/routes/layout.css](./web/src/routes/layout.css) |
| Vite + adapter config | [web/vite.config.ts](./web/vite.config.ts) |
| Markdown posts source | [posts/](./posts/) |

## Folder READMEs

- [posts/README.md](./posts/README.md) - How to add and format blog posts
- [web/README.md](./web/README.md) - Frontend architecture and development
