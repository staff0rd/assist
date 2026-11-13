---
id: launchers
title: Launchers
group: CLI
order: 1
covers:
  - cli:draft
  - cli:bug
  - cli:refine
  - cli:review-pr-comments
  - cli:fix-conflict
  - cli:signal next
  - cli:signal done
---

Each starts an agent mode in the terminal you run it from, like the matching mode in the dashboard's new-session dialog. It isn't a session, so it has no card on the dashboard.

## Commands

- `assist draft [description]` (alias `feat`) starts an agent in `/draft` mode.
- `assist bug [description]` starts an agent in `/bug` mode.
- `assist refine [id]` starts an agent in `/refine` mode to refine a backlog item.
- `assist review-pr-comments [number]` starts an agent working through a pull request's review comments one by one, checking out PR `<number>` first when given. `--announce` posts the PR to Slack once every thread is handled.
- `assist fix-conflict [number]` starts an agent resolving a pull request's merge conflicts against the remote default branch. `--rebase` rebases instead of merging.

`draft` and `bug` take `--model <model>` to run on that model instead of their `harness.defaults.<type>.model`, or `--no-model` for the harness's own default.

## Chaining into the next item

- `assist signal done [id]` :badge[internal] marks the session's task complete. `/draft` and `/bug` pass the id of the item they created, which then shows on the card. Called by `/draft`, `/bug` and `/refine`.
- `assist signal next [id]` :badge[internal] chains into the next backlog item: item `<id>` when given, otherwise whatever `assist next` picks. Called by `/next`.

After `/next`, `draft`, `bug` and `refine` carry on into the next backlog item.
