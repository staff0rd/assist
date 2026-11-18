---
id: cli-github
title: assist github
group: CLI
order: 14
covers:
  - cli:activity
  - cli:github commits
  - cli:github issue fix-structure
  - cli:github issue create
  - cli:github issue edit
  - cli:github issue comment
  - cli:github issue edit-comment
  - cli:github issue started
  - cli:github issue unassign
---

## Activity

- `assist activity` charts your GitHub contributions per week over the last 30 days. `--since <YYYY-MM-DD>` starts it elsewhere.
- `assist github commits <org>` reports commits across an organisation's repos per repo and author over the last 30 days. `--since <YYYY-MM-DD>` changes the window, `--top <n>` keeps the busiest repos and `--json` prints JSON.

## Issue types

`assist github issue fix-structure <target>` sets the issue types down an issue's sub-issue tree, so each level below the target carries the next type in the chain. The target is `owner/repo#number`, an issue URL, or a number with `--repo`. It only reports the changes until you pass `--apply`.

- `--type-chain <names>` replaces the default chain, `Epic,Story,Subtask`.
- `--level <level>` names the target's own level when its type isn't in the chain.
- `--strip-label <label>` removes a label from every issue in the tree, and can be repeated.

## Issues

These back [`/github`](../github-issues/). Each takes `-R <owner/repo>` for an issue outside the current repo.

- `assist github issue create` :badge[internal] files an issue from `--title` and `--body`, with `--label`, `--milestone`, `--project`, `--status`, `--type` and `--parent`, and attaches each `--screenshot '[Group/]Caption=path'` under the issue's `## Screenshots` section. Called by `/github create`.
- `assist github issue edit <number>` :badge[internal] reworks an issue's description in the preview pane, renames it with `--title`, attaches images with `--screenshot`, or with `--parent <issue>` makes it a sub-issue. Called by `/github`.
- `assist github issue comment <number>` :badge[internal] comments on an issue with `--body`, attaching images with `--screenshot`. Called by `/github update`.
- `assist github issue edit-comment <comment-id>` :badge[internal] replaces a posted comment with `--body`. Called by agents revising an issue comment.
- `assist github issue started <number>` :badge[internal] assigns the issue to you and moves it to In Progress on its boards. Called by `/github started`.
- `assist github issue unassign <number>` :badge[internal] removes you, or each `--assignee` login, from the issue's assignees. Called by agents removing an assignee.
