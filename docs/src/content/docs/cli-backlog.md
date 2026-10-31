---
id: cli-backlog
title: assist backlog
group: CLI
order: 8
covers:
  - cli:backlog
  - cli:backlog web
  - cli:list
  - cli:backlog list
  - cli:backlog search
  - cli:backlog show
  - cli:backlog plan
  - cli:backlog comments
  - cli:backlog add
  - cli:backlog update-field
  - cli:backlog add-phase
  - cli:backlog update-phase
  - cli:backlog remove-phase
  - cli:backlog move-phase
  - cli:backlog update-plan
  - cli:backlog start
  - cli:backlog stop
  - cli:backlog done
  - cli:backlog wontdo
  - cli:backlog set-status
  - cli:backlog star
  - cli:backlog unstar
  - cli:backlog delete
  - cli:backlog comment
  - cli:backlog refresh-docs
  - cli:backlog delete-comment
  - cli:backlog link
  - cli:backlog unlink
  - cli:backlog associate-jira
  - cli:backlog associate-github
  - cli:backlog add-activity
  - cli:backlog record-slack
  - cli:backlog run
  - cli:backlog next
  - cli:next
  - claude:next
  - cli:backlog refine
  - cli:backlog phase-done
  - cli:backlog rewind
  - cli:backlog clone
  - cli:backlog move-repo
  - cli:backlog export
  - cli:backlog import
---

These work on the current repo's [backlog](../backlog/). Item ids are written `a555`; commands also accept `555`.

## Viewing

- `assist backlog` (or `assist backlog web`) opens the Backlog tab in the dashboard. `--port <number>` picks the port (default 3100) and `--no-open` skips opening a browser.
- `assist backlog list` (alias `ls`, also `assist list`) lists open items. `--status <status>` filters by status, `--all` includes done and won't-do items, `--all-repos` lists every repo's items and `--verbose` shows each item in full.
- `assist backlog search <query>` finds items by keyword.
- `assist backlog show <id>` (alias `view`) prints an item in full. `--all-commits` lists every commit in its activity rather than the newest 10.
- `assist backlog plan <id>` prints just its plan, and `assist backlog comments <id>` just its comments.

## Writing

- `assist backlog add` :badge[internal] adds an item from `--name`, `--type <story|bug>`, `--desc` and `--ac <criterion>` (repeatable). Called by agents working on backlog items.
- `assist backlog update-field <id>` :badge[internal] changes `--name`, `--desc` or `--type`. `--ac` replaces every acceptance criterion, while `--add-ac <text>`, `--edit-ac <n> <text>` and `--remove-ac <n>` change one. `--origin [origin]` moves the item to another repo. Called by `/refine`.
- `assist backlog add-phase <id> <name> --task <task>` :badge[internal] adds a phase, with `--manual-check <check>` (both repeatable) and `--position <n>`. Called by agents working on backlog items.
- `assist backlog update-phase <id> <phase>` :badge[internal] (alias `edit-phase`) changes a phase's `--name`, `--task` and `--manual-check` lists, or one task or check with `--add-task`, `--edit-task <n>`, `--remove-task <n>`, `--add-check`, `--edit-check <n>` and `--remove-check <n>`. Called by agents working on backlog items.
- `assist backlog remove-phase <id> <phase>` :badge[internal] removes a phase. Called by agents working on backlog items.
- `assist backlog move-phase <id> <from> <to>` :badge[internal] moves a phase. Called by agents working on backlog items.
- `assist backlog update-plan <id> --json <file|->` :badge[internal] replaces the whole plan from a JSON payload, after approval in a dashboard session. Called by `/refine`.

## Status

- `assist backlog start <id>` :badge[internal] sets an item in progress. Called by agents working on backlog items.
- `assist backlog stop` :badge[internal] puts every in-progress item back to todo at its first phase. Called by agents working on backlog items.
- `assist backlog done <id> [summary]` :badge[internal] marks an item done. Called by the review phase of a backlog run.
- `assist backlog wontdo <id> [reason]` :badge[internal] marks an item won't do. Called by agents working on backlog items.
- `assist backlog set-status <id> <todo|in-progress|done|wontdo>` :badge[internal] sets any status. Called by agents working on backlog items.
- `assist backlog star <id>` :badge[internal] stars an item. Called by agents working on backlog items.
- `assist backlog unstar <id>` :badge[internal] unstars an item. Called by agents working on backlog items.
- `assist backlog delete <id>` :badge[internal] (alias `remove`) deletes an item. Called by agents working on backlog items.

## Comments, links and activity

- `assist backlog comment <id> <text>` :badge[internal] adds a comment. Called by backlog run phases and `/refine`.
- `assist backlog delete-comment <id> <comment-id>` :badge[internal] deletes a comment other than a phase summary. Called by agents working on backlog items.
- `assist backlog link <from> <to>` :badge[internal] links two items, `--type depends-on` making `<from>` wait for `<to>` (default `relates-to`). Called by agents working on backlog items.
- `assist backlog unlink <from> <to>` :badge[internal] removes a link. Called by agents working on backlog items.
- `assist backlog associate-jira <id> [key]` :badge[internal] links a Jira issue by key or browse URL, replacing any GitHub issue; `--clear` removes it. Called by `/draft`, `/bug` and `/refine`.
- `assist backlog associate-github <id> [issue]` :badge[internal] links a GitHub issue by URL or `owner/repo#number`, replacing any Jira issue; `--clear` removes it. Called by `/draft`, `/bug` and `/refine`.
- `assist backlog add-activity <id> <branch|commit|pr|slack|session> <ref>` :badge[internal] attaches a ref to an item's activity, with `--title`, `--url` and `--state`. Called by `/draft` and `/bug`.
- `assist backlog record-slack <url>` :badge[internal] attaches a Slack thread to the current session's item. Called by `/prs-slack`.

## Running

- `assist next [id]` (or `assist backlog next`) runs the item already in progress, or one you pick, then offers the next. With `[id]` it runs that item first; with no items left it starts `/draft`. `--once` stops after one item. In a terminal started by `assist next`, `assist draft`, `assist bug` or `assist refine`, `/next [id]` ends the current session and moves on to item `<id>`, or to whatever `assist next` picks.
- `assist backlog run <id>` :badge[internal] runs an item's plan from the phase it is on. `--harness <claude|codex|pi>` overrides `harness.engine`, and `--no-write` runs the harness without write access. Called by the dashboard's Build and `assist next`.
- `assist backlog refine [id]` :badge[internal] is the same as [`assist refine`](../launchers/). Called by agents working on backlog items.
- `assist backlog rewind <id> <phase> --reason <reason>` :badge[internal] sends an item back to an earlier phase. Called by the review phase of a backlog run.
- `assist backlog phase-done <id> <phase> <summary>` :badge[internal] marks a phase complete and records its summary. Called by the agent running each phase of a backlog run.

## Repos and data

- `assist backlog clone <origin>` clones an item's repo over SSH into `clone.baseDir`.
- `assist backlog refresh-docs` queues a [Refresh docs](../backlog/#docs-refresh) story now for every done story no refresh covers yet, whatever `docs.refreshAfter` is set to.
- `assist backlog move-repo <old-origin> [new-origin]` moves every item from one repo to another after a rename, the current repo when no new origin is given. `--yes` skips the prompt.
- `assist backlog export [file]` writes the whole backlog database to a file, or stdout, and `assist backlog import [file]` replaces the database with an export, from stdin when no file is given. `--yes` skips the prompt.
