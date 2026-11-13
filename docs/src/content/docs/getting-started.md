---
id: getting-started
title: Getting started
group: Getting started
order: 0
covers:
  - cli:sync
  - claude:sync
  - config:sync.autoConfirm
  - config:sync.preferences
  - config:database.url
  - cli:db migrate
screenshots:
  - file: getting-started-first-session.png
    alt: The new-session dialog in prompt mode with a prompt typed in
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - click: "[aria-label='New session']"
      - click: "[role='dialog'] [aria-label='Mode'] >> text=prompt"
      - click: "[role='dialog'] textarea"
      - type: Add a footer with a link to the privacy policy
---

## Install

assist is published to npm. Install it globally, then sync its commands and settings into your coding harness:

```bash
npm install -g @staff0rd/assist
assist sync
```

The CLI is available as `assist`, and also as the shorter aliases `ast` and `a`.

`assist sync` installs every assist Claude command as `~/.claude/skills/<name>/SKILL.md`, so it takes precedence over a project skill of the same name, and copies assist's `settings.json` into `~/.claude`. When the Codex or pi CLIs are installed it also installs the commands and permission hooks for them. Inside Claude Code, `/sync` does the same thing.

Sync asks before overwriting an existing `settings.json`. Pass `--yes` to skip the prompt once, or make it permanent with:

```bash
assist config set sync.autoConfirm true
```

To also merge assist's [author preferences](#author-preferences) into your Claude `settings.json` when syncing:

```bash
assist config set sync.preferences true --node
```

## Author preferences

With `sync.preferences` on, `assist sync` sets these in your Claude `settings.json`:

| Setting                     | Value          | Effect                                            |
| --------------------------- | -------------- | ------------------------------------------------- |
| `autoMemoryEnabled`         | `false`        | Claude doesn't save memories on its own           |
| `feedbackDrafts`            | `off`          | Turns off Claude's feedback drafts                |
| `attribution.commit`        | empty          | Commits carry no Claude attribution               |
| `attribution.pr`            | empty          | Pull requests carry no Claude attribution         |
| `env.CLAUDE_AFK_TIMEOUT_MS` | `2147483647`   | Claude never treats you as away from the keyboard |
| `permissions.deny`          | `SendFeedback` | Claude can't send feedback to Anthropic           |

## Set up the database

assist keeps your [backlog](../backlog/), [usage](../usage/) and [per-repo settings](../config/) in a Postgres database, and won't start without one. Any Postgres works: one running locally or in Docker, or a managed one such as Supabase or Neon. Set its connection string, then create the tables:

```bash
assist config set database.url postgresql://user:password@host:5432/database
assist db migrate
```

The `ASSIST_DATABASE_URL` environment variable works too, and takes precedence. Point every node you use at the same database and they share one backlog.

## Open the dashboard

From a terminal in one of your repos, run:

```bash
assist
```

This starts the assist dashboard on port 3100 and opens it in your browser. The dashboard is where you start coding agents, watch them work and answer them. Add `--no-open` to start it without opening a browser.

## Start your first session

Press **+** in the toolbar (or :kbd[Mod+N]) to open the new-session dialog.

1. Choose **prompt**.
2. Pick the repo the agent should work in.
3. Type what you want done and press :kbd[Enter].

::screenshot{file="getting-started-first-session.png"}

The other modes start assist commands rather than a plain prompt: **draft** turns your description into a backlog item and **bug** files a bug report. See [Creating sessions](../sessions-creating/), and [why assist keeps its own backlog](../backlog/#why-a-separate-backlog) rather than using Jira or GitHub issues.

## Next steps

- [Sessions dashboard](../sessions-overview/) — the rest of the dashboard: the toolbar, tabs and run sessions.
- [Sidebar and cards](../sessions-sidebar/) — what a card shows and how to close, find and reopen sessions.
- [Parallel work](../sessions-parallel-work/) — several agents on one repo without them colliding.
- [Updating assist](../updating/) — keeping assist up to date.
