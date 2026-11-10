---
id: cli-watch
title: assist watch
group: CLI
order: 4
covers:
  - cli:watch wait
  - cli:watch loop
  - cli:watch simulate-divergence
  - cli:watch report
---

## Commands

- `assist watch wait [--interval <d>] [--timeout <d>|none] [--pull] [--build [entry]]` :badge[internal] blocks until the current branch's upstream gains commits. `--pull` fast-forwards to them, and `--build` then runs the `auto-build` run entry (or `[entry]`), plus `assist sync --yes` when the pulled commits touched files that sync installs. It exits 0 on movement, 2 on timeout, 3 on genuine divergence, 4 when the build or sync fails, and 1 when it cannot wait. Called by auto-update.
- `assist watch loop` :badge[internal] runs `assist watch wait --pull --build` as a fresh child process lap after lap. It relaunches after a 0, 2 or 4 exit, and stops on 1, 3 or an interrupt. Called when debugging auto-update.
- `assist watch report [--from <sha>]` :badge[internal] prints the built version and the last 10 commits as a markdown table. With `--from`, it lists only the commits since `<sha>` and says which restarts they need and whether `~/.claude` needs a sync. Called when debugging auto-update.
- `assist watch simulate-divergence` :badge[internal] makes the next `assist watch wait` poll in this repo exit 3, so you can test how divergence is handled. Called when debugging auto-update.
