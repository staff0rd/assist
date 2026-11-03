---
id: cli-devlog
title: assist devlog
group: CLI
order: 27
covers:
  - cli:devlog list
  - cli:devlog next
  - cli:devlog version
  - cli:devlog skip
  - cli:devlog write
  - cli:devlog repos
---

See [Devlog](../devlog/) for writing entries with `/devlog`.

## Commands

- `assist devlog list` prints the last 6 weeks of commits, including the current one, grouped by ISO week, with each week's dev entry headline and versions, or whether it is skipped, in progress or missing. `--weeks <n>`, or `--since` with a `YYYY-MM-DD` date or `YYYY-Www` week, changes the range, `-r` lists the earliest first, and `-v` adds the files each commit changed.
- `assist devlog next` prints the next completed week without an entry: its week id, dates and version range, and its commits, each with the `package.json` version at that commit. `-v` adds the files each commit changed.
- `assist devlog version` prints the repo's name, its latest dev entry's week and last version, and the current version.
- `assist devlog skip <week>` adds a `YYYY-Www` week, such as `2026-W33`, to `devlog.skipWeeks`, so it gets no entry.
- `assist devlog write` :badge[internal] writes a dev entry from JSON on stdin, after checking it. Called by `/devlog`.
- `assist devlog repos` lists your GitHub repos pushed to in the last 30 days, with each one's latest dev entry week, and whether its entries are missing, outdated or up to date. `--days <n>` changes the window, and `--all` lists every repo that isn't archived.
