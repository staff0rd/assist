---
id: working-on-assist
title: Working on assist
group: Contributing
order: 0
covers: []
---

## Run from a clone

To work on assist itself, install it from a clone instead of npm:

```bash
git clone git@github.com:staff0rd/assist.git
cd assist
npm install
npm run build
npm install -g .
```

From then on assist keeps the clone built and up to date (see [Updating assist](../updating/)).

This guide is built from the clone too. It is an Astro Starlight site in `docs/` with its own dependencies: `npm run docs:install` installs them, `npm run docs:build` builds the site into `docs/dist/`, and `npm run docs:preview` serves it on http://localhost:4173, reloading as pages change. Set `DOCS_BASE_PATH=<path>` to build for a site hosted under a sub-path.

## Let assist update itself as you work

With this set up, every change a session commits ends up running in your installed assist:

1. Sessions run in worktrees with trunk-based work on, so each commit pushes straight to the clone's branch on `origin` instead of raising a PR.
2. The installed clone sees its upstream move, pulls, and runs its `auto-build` run entry.
3. Restart onto the new build from the [Updates page](../updating/#the-updates-page).

Turn it on from the clone:

```bash
assist config set worktree.enabled true
assist config set worktree.trunk true
assist config set autoUpdate.enabled true
```

The `auto-build` run entry is what an update runs after pulling. This repo's `assist.yml` already defines it to run `npm i`, then the build script. Without one, an update pulls but does not build.

See [Parallel work](../sessions-parallel-work/) for how worktrees and `worktree.trunk` behave, and [Updating assist](../updating/) for how updates are paused, checked and restarted.
