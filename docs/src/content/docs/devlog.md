---
id: devlog
title: Devlog
group: Integrations
order: 10
covers:
  - claude:devlog
  - config:devlog.name
  - config:devlog.ignore
  - config:devlog.skipWeeks
  - config:devlog.dir
---

A devlog is a changelog-style dev entry per ISO week (Monday to Sunday) of work on a repo, written for a blog. assist writes the entries into `<devlog.dir>/<repo>/`, one file per week such as `2026-w33.md`.

## Writing entries

Run `/devlog` in a repo to write the entry for the next completed week that has commits but no entry; the week in progress is never written. The agent reads that week's commits and writes a headline, a short lede, the first and last days of the week that had commits, and what was added, changed and fixed as short phrases, each tagged with the version it shipped in. A repo with no tags whose version never changes gets no versions. A week of only trivial changes is skipped instead.

To keep going until every completed week is written or skipped:

```
/devlog --all
```

## Settings

| Key                | Effect                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `devlog.dir`       | The folder entries are written into, such as `~/git/blog/src/content/dev`                |
| `devlog.name`      | The name entries are filed under. Defaults to the name in `package.json`                 |
| `devlog.ignore`    | Paths whose changes don't count: a commit that only touches files under them is left out |
| `devlog.skipWeeks` | Weeks never to write an entry for. Add one with [`assist devlog skip`](../cli-devlog/)   |
