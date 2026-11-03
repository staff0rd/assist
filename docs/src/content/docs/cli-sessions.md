---
id: cli-sessions
title: assist sessions
group: CLI
order: 3
covers:
  - cli:sessions close
  - cli:sessions rename
  - cli:sessions output
  - cli:sessions set-status
---

## Commands

- `assist sessions rename <title>` :badge[internal] retitles the current session's card. Called by `/rename`.
- `assist sessions close` :badge[internal] ends the current session, along with any dev server started from it, and reaps its worktree, subject to the unpushed-work rule. Called by `/close`.
- `assist sessions output [session-id]` :badge[internal] prints a session's recent output with colour codes stripped (`-n <count>` lines, default 200). `--server [group]` reads the current repo's live dev server instead. Called by `/run-logs`.
- `assist sessions set-status <running|waiting>` :badge[internal] sets the current session's card status. Called by assist's Claude hooks.
