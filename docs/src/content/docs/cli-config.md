---
id: cli-config
title: assist config
group: CLI
order: 16
covers:
  - cli:config get
  - cli:config list
  - cli:config keys
  - cli:config import-repos
  - cli:config import-user
---

Keys are set with `assist config set` or on the [Config](../config/) page.

## Commands

- `assist config get <key>` prints a key's effective value for the current repo. Secrets print as `<hidden>`; `--reveal` prints the raw value.
- `assist config list` prints every key that's set, with secrets hidden.
- `assist config keys [filter]` lists every key with its default, what it does and the command that sets it. `filter` narrows the list to keys containing it.
- `assist config import-repos` moves per-repo overrides kept under `repos:` in this machine's `~/.assist.yml` into the database, where every machine sharing it sees them. It shows a diff per key and asks before writing.
- `assist config import-user [keys...]` moves keys (default `advice.rules`) from this machine's `~/.assist.yml` into user (db), which applies to every repo on every machine sharing the database. Array keys gain only the entries user (db) lacks. It shows a diff and asks before writing.
