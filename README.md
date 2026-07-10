# My Blog

A markdown-driven blog built with SvelteKit and Svelte 5. Drop a `.md` file into `posts/` and it shows up on the site, ordered by the date the file was added to git.

## Quick start

```sh
cd web
pnpm install
pnpm dev
```

The site runs at `http://localhost:5173`.

## How posts work

1. Create a `.md` file in [`posts/`](./posts/).
2. The filename becomes the URL slug (`posts/hello-world.md` -> `/posts/hello-world`).
3. The first `# heading` becomes the title.
4. The post date is resolved from frontmatter `date`, then the git first-commit date (traced through renames), then filesystem creation time. Touching one file never changes another file's date.
5. Optional YAML frontmatter for `title`, `description`, `category`, and `date` overrides the defaults.
6. Posts are grouped into sections by `category` on the overview page. Posts without a category default to `General`.

Files starting with `_` or named `README.md` are ignored by the renderer.

See [structure.md](./structure.md) for the full project layout and where logic lives.
