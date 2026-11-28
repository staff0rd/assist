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
  - cli:sessions list
  - cli:sessions send
  - cli:sessions previews
  - cli:sessions decide
  - cli:sessions interrupt
---

## Commands

- `assist sessions list` :badge[internal] lists every session on this node and its linked nodes with its id, kind, status, node, repo and branch, title and the name other agents know it by. `--node <name>` lists one node's sessions (`local` for this one), and `--json` prints JSON. The other commands here take its ids, `<node>:<id>` for a session on a linked node. Called by agents driving other sessions.
- `assist sessions send <id> <text>` :badge[internal] submits `<text>` as a prompt in that session. `--keys` types it as raw keystrokes instead, with `\r`, `\n`, `\t`, `\e` and `\xHH` decoded, such as `'1\r'` to answer a permission prompt. Called by agents driving other sessions.
- `assist sessions previews <id>` :badge[internal] shows the session's pending preview: its kind, title, body and a question form's options (`--json` for JSON). Called by agents driving other sessions.
- `assist sessions decide <id>` :badge[internal] answers that preview: `--approve [note]` (**Works** for a manual check) or `--reject [note]`, or for a question form `--answer <choice>`, as `<number|header>=<option or your own text>`, or just the choice when there is one question. Repeat `--answer` per question or per multi-select choice. Called by agents driving other sessions.
- `assist sessions interrupt` :badge[internal] stops the running turn of an SDK session, the current one or the one given by `--id <id>`. Called by agents driving other sessions.
- `assist sessions rename <title>` :badge[internal] retitles the current session's card, or the one given by `--id <id>`. Called by `/rename`.
- `assist sessions close` :badge[internal] ends the current session, or the one given by `--id <id>`, along with any dev server started from it, and reaps its worktree, subject to the unpushed-work rule. Called by `/close`.
- `assist sessions output [session-id]` :badge[internal] prints a session's recent output with colour codes stripped (`-n <count>` lines, default 200). `--server [group]` reads the current repo's live dev server instead. Called by `/run-logs`.
- `assist sessions set-status <running|waiting>` :badge[internal] sets the current session's card status. Called by assist's Claude hooks.
