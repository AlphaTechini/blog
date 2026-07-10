# posts/

Drop markdown files here. Each `.md` file becomes a blog post.

## Rules

- The filename (without `.md`) is the URL slug. `hello-world.md` -> `/posts/hello-world`.
- The first `# heading` in the file becomes the post title.
- Posts are ordered by date (newest first). The date is resolved from frontmatter `date`, then git add-date, then filesystem creation time.
- Posts are grouped into sections by `category` on the overview page. Posts without a category default to `General`.
- Files starting with `_` are treated as drafts and ignored.
- `README.md` is ignored by the renderer.

## Optional frontmatter

```markdown
---
title: My Custom Title
description: A short summary for the post listing
category: CrestPace
date: 2026-07-09
---

Body of the post...
```

If `title` is set in frontmatter, the first `# heading` is rendered as regular content instead of being used as the title.

`category` groups posts into sections on the overview page. Posts without a category default to `General`.

`date` pins the post date explicitly. When omitted, the date is resolved automatically (see below).

## How the date works

The post date is resolved in this order:

1. **Frontmatter `date`** - if set, it takes priority and never shifts.
2. **Git add-date** - the commit that first added the file, traced through renames with `--follow`:
   ```sh
   git log --diff-filter=A --follow --format=%aI -- <path>
   ```
3. **Filesystem birthtime** - the file's creation time, used when the file is not yet tracked in git.
4. **Filesystem mtime** - last resort fallback.

This means touching one file never changes another file's date. The date a post was first created or pushed is preserved across edits, moves, and renames.

## Where the rendering happens

To find the markdown scanning and rendering logic, visit [vite-plugin-posts.ts](../web/vite-plugin-posts.ts). That plugin reads this folder at build time, renders each file to HTML with `marked`, and exposes the results to the SvelteKit app via a virtual module.
