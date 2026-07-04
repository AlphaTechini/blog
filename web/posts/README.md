# posts/

Drop markdown files here. Each `.md` file becomes a blog post.

## Rules

- The filename (without `.md`) is the URL slug. `hello-world.md` -> `/posts/hello-world`.
- The first `# heading` in the file becomes the post title.
- Posts are ordered by the date the file was first added to git (first commit author date).
- Files starting with `_` are treated as drafts and ignored.
- `README.md` is ignored by the renderer.

## Optional frontmatter

```markdown
---
title: My Custom Title
description: A short summary for the post listing
---

Body of the post...
```

If `title` is set in frontmatter, the first `# heading` is rendered as regular content instead of being used as the title.

## How the date works

To find the date the file was added, the build plugin runs:

```sh
git log --diff-filter=A --follow --format=%aI -- <path>
```

If the file is not yet tracked in git, it falls back to the file's modification time. Once committed, the git date takes over.

## Where the rendering happens

To find the markdown scanning and rendering logic, visit [vite-plugin-posts.ts](../web/vite-plugin-posts.ts). That plugin reads this folder at build time, renders each file to HTML with `marked`, and exposes the results to the SvelteKit app via a virtual module.
