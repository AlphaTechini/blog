---
title: Downstream: Finding What a Reviewed Change Quietly Broke
description: How Downstream replays realistic user traffic through the old and new build of a GitLab merge request, measures against its own noise, and files a fix.
category: Projects
date: 2026-11-03
---

## Why

Code review shows what a change says. It doesn't show what the change does to the parts of the application nobody opened in the diff. A reviewer can read every line of a merge request and still miss that it slowed down a route on the other side of the codebase.

Small teams often have no staging environment that replays real user behaviour before something ships.

I built Downstream to close that gap inside GitLab. Before a reviewed change reaches users, it runs realistic user traffic through the old and new builds, finds what else the change quietly broke or slowed, traces the likely cause and files a fix. Merged is not safe.

## How

### One mention starts it

Downstream is a custom flow on the GitLab Duo Agent Platform, published in GitLab's AI Catalog so any project can enable it. A reviewer mentions the bot on a merge request, and the flow builds the engine (a Go program using only the standard library) at a pinned commit inside the Duo sandbox.

### Mapping what the change can reach

The engine parses the Go source, builds the route table from `net/http` registrations and walks the calls from each handler. A route is "changed" when it reaches a changed function and "affected" when it shares code with a changed route. New routes are found too. This static analysis covers Go `net/http` only for now.

### Journeys written by the model, checked by the engine

The model writes up to 20 user journeys as JSON. The engine rejects any set that misses a changed, affected or new route, or has no control journeys elsewhere in the app. Journeys that already fail on the old build are thrown out, so the change is never blamed for an existing bug.

### Measuring against its own noise

k6 runs the journeys on the old build, the new build, then the old build again, with a few virtual users for tens of seconds. Any disagreement between the two old runs counts as noise.

Verdicts come from failing steps and process counters: CPU per completed journey, bytes written, write syscalls, memory, file descriptors, threads, and Go runtime counters like allocations and goroutines. The runtime counters come from one file injected at build time with `go build -overlay`, so the target repository is never edited. Latency is reported but is advisory only.

### Frontend changes

When a change touches pages, templates or a frontend build, Downstream renders the old and new pages in happy-dom, without a real browser. It reports bundle growth with the asset responsible, missing assets, new accessibility and markup errors, and uncaught JavaScript errors. Layout, paint and color contrast are never checked.

### Issues and the fix loop

Findings are grouped so one cause gives one issue, with a repro, the figures, a likely cause and numbered fix options. Replying `fix it` commits the fix on a new branch, opens a merge request with the requester as reviewer and measures it again. Downstream never merges. A `verify` command for after a merge is written but hasn't been run yet.

### Remembering across runs

A sandbox starts empty every time, so ten merge requests that each add 8% CPU would all pass. For projects that opt in, a numbers-only record of each run goes to a memory service on Google Cloud Run with Firestore, and the report gains a Trend section that compounds merged changes and flags creep at 25%.

### What it has shown

On a demo API with a deliberately planted regression, the flow caught the slowdown and `fix it` brought it back down. It has also run on NewGit, another project of mine. With the current rule, a clean change came out clean in 3 of 3 sandbox runs, which is a small sample, not a measured rate.

## Technologies

- Go (standard library only)
- GitLab Duo Agent Platform (custom flow, AI Catalog)
- k6
- Node.js with happy-dom, axe-core and html-validate
- Google Cloud Run and Firestore
- GitLab CI

## Architectural decisions

### Run the old build twice

One old run against one new run produces false alarms, because performance numbers are noisy. Running old, new, old in sequence means machine drift shows up as disagreement between the two old runs. The cost is a third run every time, and the builds never run in parallel because on a 2-CPU sandbox they would slow each other down.

### Gate on process counters, not latency

The first version decided on step latency. Running identical code against itself showed the two baseline runs differing by 32.5% at the median, while bytes written and write syscalls barely moved. So verdicts now rest on what the process did. The tradeoff is that a page that only gets slower, with no change in failures or counters, doesn't open an issue.

### Tolerances with floors, added after real false alarms

Each metric needs a percentage change and an absolute floor, and it has to beat the gap between the two old runs. Each floor went in through its own merge request after a real false alarm on the live bot. The downside is that smaller regressions of those kinds pass as noise.

### The model never holds the keys

The model picks journeys, explains causes and suggests fixes. The engine produces every number. Shell commands are fixed in the flow file, traffic stays on `127.0.0.1`, and the engine and the app's run config come from commits the merge request can't change. One known gap is that the model's JSON reaches the shell inside a quoted heredoc.

### Store relative changes, not absolute figures

The same branch measured 5.2 ms and 10.4 ms of CPU per journey in two sandbox sessions, so raw numbers can't be compared across runs. The memory service keeps each metric's change against the worse old run instead. It stores no code, diffs or route names, and it scales to zero.
