---
id: cli-hooks
title: Agent hooks and permissions
group: CLI
order: 20
covers:
  - cli:advise
  - cli:deny
  - cli:deny add
  - cli:deny remove
  - cli:deny list
  - cli:cli-hook
  - cli:cli-hook check
  - cli:cli-hook add
  - cli:cli-hook deny
  - cli:cli-hook deny add
  - cli:cli-hook deny remove
  - cli:cli-hook deny list
  - cli:edit-hook
  - cli:code-comment set
  - cli:code-comment confirm
  - cli:notify
  - cli:status-line
  - cli:prompts
  - cli:codex-hook
  - cli:pi-hook
---

See [Agent instructions and permissions](../hooks-and-permissions/) for what these do in a session.

## Repo instructions

- `assist advise` prints the instructions a session in this repo starts with. `--explain` lists every section with whether it's included and why, and `--hook` prints them in the form Claude Code reads at session start.

## Deny rules

- `assist deny add <pattern> <message>` blocks commands starting with `pattern`, showing agents `message` instead. It writes to the repo's `assist.yml`; `--node` writes to `~/.assist.yml`.
- `assist deny remove <pattern>` removes a rule, with the same `--node` flag.
- `assist deny list` lists the rules that apply here and where each is set.

`assist cli-hook deny add`, `remove` and `list` are the same commands.

## Permissions

- `assist cli-hook check <command>` prints whether a command would run without a permission prompt, and why. `--tool` checks against a tool other than `Bash`, such as `PowerShell`.
- `assist cli-hook add <cli...>` finds a CLI's read-only subcommands, such as `gh` or `acli jira`, and adds them to assist's list of commands that run without asking. Run it from a clone of assist, then commit the result. Discovery is cached; `--no-cache` runs it again.

## Hooks

- `assist cli-hook` :badge[internal] approves read-only commands and blocks denied ones. With `sessions.askQuestion` on, it also blocks `AskUserQuestion` in dashboard sessions and points the agent at `assist ask-question`. Called by the PreToolUse hook on shell commands, reads and `AskUserQuestion`.
- `assist edit-hook` :badge[internal] blocks edits that add code comments. Called by the PreToolUse hook on file edits.
- `assist codex-hook` :badge[internal] approves read-only commands in [Codex](../harnesses/) sessions, starts them with the repo's instructions and keeps their status on the dashboard. Called by Codex's hooks.
- `assist pi-hook` :badge[internal] approves read-only commands in [pi](../harnesses/) sessions and blocks denied ones. Called by assist's pi permission-gate extension.
- `assist code-comment set <file> <line> <text>` :badge[internal] requests a single-line comment of up to 50 characters, sending a pin to your desktop notifications. See [Approving a comment](../code-quality/#approving-a-comment). Called by agents whose edit the comment gate blocked.
- `assist code-comment confirm <pin>` :badge[internal] adds the comment the pin was issued for. Called by agents whose edit the comment gate blocked.
- `assist notify` :badge[internal] shows a [desktop notification](../hooks-and-permissions/#desktop-notifications). Called by the Notification hook.
- `assist status-line` :badge[internal] prints Claude Code's status line: model, branch, context use and rate limits. Called by Claude Code's status line.
- `assist prompts` :badge[internal] lists the tool calls you've been asked to approve most often. Called by [`/prompts`](../hooks-and-permissions/#fewer-permission-prompts).
