---
id: devlog
title: Devlog
group: Integrations
order: 10
covers:
  - claude:devlog
  - config:devlog.name
  - config:devlog.ignore
  - config:devlog.skip
---

A devlog is a changelog-style dev entry per ISO week (Monday to Sunday) of work on a repo, written for a blog. assist writes the entries into `~/git/blog/src/content/dev/<repo>/`, one file per week such as `2026-w33.md`.

## Writing entries

Run `/devlog` in a repo to write the entry for the next completed week that has commits but no entry; the week in progress is never written. The agent reads that week's commits and writes a headline, a short lede and what was added, changed and fixed, each line tagged with the version it shipped in. A week of only trivial changes is skipped instead. `/devlog --all` keeps going until every completed week is written or skipped.

## Settings

| Key             | Effect                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------- |
| `devlog.name`   | The name entries are filed under. Defaults to the name in `package.json`                 |
| `devlog.ignore` | Paths whose changes don't count: a commit that only touches files under them is left out |
| `devlog.skip`   | Weeks never to write an entry for. Add one with [`assist devlog skip`](../cli-devlog/)   |
