---
id: cli-rules
title: assist rules
group: CLI
order: 18
covers:
  - cli:rules list
  - cli:rules add
  - cli:rules index
---

See [Rules](../rules/) for how rules are written and used.

## Commands

- `assist rules list [path]` lists the rules that apply to `path`, from every `CLAUDE.md` between it and the repo root. It defaults to the current directory. `--full` shows each rule's text as well as its title.
- `assist rules add <text>` :badge[internal] adds a rule to the nearest `CLAUDE.md`'s `## Rules` section with the next free code, creating the section if needed. `--title` sets its title and `--scope <path>` picks the `CLAUDE.md`. `--user` appends it to `advice.rules` in user (db) instead, reaching every repo on every node, and `--node` to this node's `~/.assist.yml`; both need `--title`. Called by [`/add-rule`](../rules/#adding-a-rule) and [`/fix-rules`](../rules/#converting-existing-rules).
- `assist rules index` :badge[internal] lists the directories with their own `## Rules` in the root `CLAUDE.md`, so agents find them. Called by `/fix-rules`.
