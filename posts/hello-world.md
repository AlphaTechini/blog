# Hello World

This is the first post on this blog. Drop any `.md` file into the `posts/` folder at the repo root and it will show up here automatically, ordered by the date the file was added to the repository.

## How it works

Each markdown file becomes a post. The title is pulled from the first `#` heading, and the date comes from git, specifically the commit that first added the file. No frontmatter required.

If you do want frontmatter, you can add it:

```markdown
---
title: My Custom Title
description: A short summary for the post listing
---

# Heading that will be ignored since title is set above
```

## Features

- Markdown rendered to HTML at build time
- Ordered by date the file was added to git
- Pure black and white theme
- Reading time estimates
- Code blocks, links, images, everything markdown supports

## Code example

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from the blog")
}
```

That's it. Just write markdown.
