---
title: NewGit: A Git Host Where Git Is the Database
description: A GitLab-style Git host in Go that stores issues and reviews in Git refs, opens merge requests without forks, and signs you in with your device.
category: Projects
date: 2026-11-03
---

## Why

Most small Git hosts copy GitHub's design: Git for the code, and an SQL database for everything else. That locks issues and review history inside the forge's database, makes contributors fork to propose a change, and lets a force-push hide what changed between versions of a merge request.

There are a couple of other limits too. Anyone can write any name in `git commit --author`, and most hosts want an email, a password and a sign-up form before you can do anything.

NewGit is a small, working, GitLab-style Git host written in Go that tries a lesser-known idea for each of those limits. It's also the demo target app for Downstream, another project of mine, so it had to be a real product with real user journeys. NewGit itself has no AI features.

## How

### Signing in with the device

There are no passwords or emails. On the first visit, the browser generates an ECDSA P-256 key pair with WebCrypto and marks the private key as non-extractable, so no script can read it. The browser signs a one-time challenge from the server, and the account ID becomes the key's thumbprint. Later visits sign in silently, and another device gets its own account.

Git and AI agents can't use a browser key, so the signed-in device issues personal access tokens. They're shown once, stored only as a SHA-256 hash, and can be revoked.

### Cloning and pushing

NewGit serves real `git clone` and `git push` over HTTP(S) to any stock git client by running `git upload-pack` and `git receive-pack` directly. Clone is anonymous, and push accepts a token as the password.

### Git is the database

Issues, merge requests, comments, the push log, users and tokens are stored as append-only operation logs inside Git: one ref per entity and one commit per operation. This is the same family of design as Gerrit's NoteDb and git-bug. Writes are compare-and-swap ref updates, so two writers can't silently overwrite each other. The UI reads an in-memory index rebuilt from the refs at startup, and one `git fetch` brings the issues and review history along with the code.

### Merge requests without forks

Anyone can open a merge request by pushing to `refs/for/main`. This is the AGit flow, built on Git's `proc-receive` hook, and it needs no fork and no write access. Every push to a merge request is kept as its own immutable ref, so reviewers can compare any two versions with `git range-diff`.

### Verified pusher and Git speedups

The server records which authenticated account pushed each commit and shows it next to the self-asserted author. After each push it also writes a commit-graph with changed-path Bloom filters, which Git doesn't write by default, and it periodically repacks with reachability bitmaps.

### The web UI and the MCP endpoint

The UI is server-rendered Go templates in a GitLab-style layout, with light and dark themes. The only JavaScript handles device sign-in and small conveniences. Pages use a strict content security policy, forms are CSRF-protected, and Markdown never renders raw HTML.

An MCP endpoint at `/mcp` lets AI agents list repos, read files, file issues, comment and open merge requests using a token. Read-only tokens can only call read tools.

### Checking and deploying it

A smoke script builds the binary, starts it on a temporary data directory and runs 26 checks with a stock git client, covering sign-in, clones, pushes, AGit, range-diff, merges, issues, MCP and the index rebuild. The Dockerfile targets Google Cloud Run, where data isn't durable: it's wiped when the instance is replaced.

SSH, forks, private repos, webhooks, CI, code search and approvals aren't in this version.

## Technologies

- Go
- Git (2.38 or newer, run as a subprocess)
- Go `html/template`, chroma, goldmark
- WebCrypto (ECDSA P-256 device keys)
- MCP over streamable HTTP
- Docker and Google Cloud Run

## Architectural decisions

### Store collaboration data in Git refs

Instead of an SQL database, every issue, merge request, comment, user and token is an append-only log in Git refs. Backups are just Git, and anyone who clones can take the collaboration history with them. The tradeoff is an in-memory index rebuilt at startup, which is also why the Cloud Run deployment must stay at one instance: a second one would see a different, empty server.

### Shell out to the git binary

All Git operations go through the real `git` binary, not go-git, because go-git can't open reftable repos and ignores Bloom filters and bitmaps. The transport also skips Go's `net/http/cgi`, which rejects chunked request bodies and so fails pushes over 1 MiB. The cost is a hard dependency on Git 2.38 or newer on the server.

### The device is the account

Browsers expose no stable hardware ID, IP addresses change, and fingerprinting is unreliable and invasive. A key only the device holds, checked on each sign-in, avoids all of that with nothing to type. The honest limits: the key lives in browser storage in software, not in a TPM, and clearing site data loses the account. There's no recovery path by design, since one would be a second way in.

### Merge without a worktree

Server-side merges use `git merge-tree --write-tree`, then `commit-tree`, then a compare-and-swap ref update. No working directory is involved, so untrusted content is never checked out on the server.

### A small hand-written MCP handler

The MCP endpoint is a small JSON-RPC handler written by hand rather than built on an SDK, with tool schemas generated from Go structs. That keeps the dependencies down to two libraries and lets it build with Go 1.22 or newer.
