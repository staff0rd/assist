---
id: sessions-parallel-work
title: Parallel work
group: Sessions
order: 5
covers:
  - config:worktree.enabled
  - config:worktree.trunk
  - config:worktree.root
  - config:worktree.install
  - config:worktree.copy
  - config:worktree.commitBeforePhaseEnd
  - config:worktree.commitBeforeManualChecks
  - config:sessions.cleanLeftovers
---

## Several sessions on one repo

By default every session in a repo shares the clone's working copy, so two agents editing the same repo see each other's changes. Turn on parallel work for a repo to give each session its own git worktree instead:

```bash
assist config set worktree.enabled true
```

With it on:

- Every session gets a fresh worktree beside the clone — `<repo>-2`, `<repo>-3` and so on — even when nothing else is running. The clone itself is never handed to a session, so where a session lands never depends on what else is running.
- That covers prompt sessions, assist-command sessions (draft, bug, backlog run, review and so on), resumes of a session whose worktree has been removed, and `assist review` run from a plain terminal.
- A worktree starts off the freshly fetched remote default branch, so it never works against whatever branch the clone is on.
- Two launches stay where they are: the PR Review button runs in the tree it was launched from, and adding an agent to an existing stream joins that stream's tree.

## Work is never lost

A worktree is removed only when the last session holding it is done or closed, and only when nothing in it is unpushed. Closing a session that still holds unpushed changes stops it instead: the card stays on the board as **stopped**, and the only actions are resume, restart or an explicit discard. Discard always asks first and names what it is about to destroy.

The same applies to a session in the clone's own working copy, though the clone itself is never removed.

Removing a worktree also removes any Docker containers bind-mounting a folder inside it, and each daemon restart deletes removed worktree folders that reappeared without their git checkout. To leave both alone:

```bash
assist config set sessions.cleanLeftovers false --node
```

## Worktree settings

- `worktree.trunk` — trunk-based work. A spilled worktree's branch tracks `origin/<trunk>` so commits land on the mainline. Off (the default), a worktree starts off the remote default branch with no upstream, and the session raises its own branch and PR.
- `worktree.root` — the parent directory for `<repo>-N` worktrees. Defaults to the clone's parent.
- `worktree.install` — how a new worktree installs its dependencies. `true` (the default) detects pnpm, yarn, bun or npm; a string is the install command to run; `false` skips it; a JSON list of paths installs in each in order, stopping at the first failure:

  ```bash
  assist config set worktree.install '[".","packages/ui"]'
  ```

- `worktree.copy` — gitignored files to copy into each new worktree so it can build and run, such as `.env`:

  ```bash
  assist config set worktree.copy .env,.claude/settings.local.json
  ```

- `worktree.commitBeforePhaseEnd` — makes each backlog phase run `/commit` once verify passes, before it asks you to perform manual checks or marks the phase done, so a phase's work is never left uncommitted in a worktree that may be reaped. Off by default. `worktree.commitBeforeManualChecks` is its older name and is still read when `commitBeforePhaseEnd` is unset.
