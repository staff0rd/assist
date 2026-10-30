---
id: sessions-overview
title: Sessions dashboard
group: Sessions
order: 0
covers:
  - route:/sessions
  - cli:sessions
  - cli:sessions web
screenshots:
  - file: sessions-dashboard.png
    alt: The sessions dashboard with agents in three repos and a dev server
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - click: text=Dark mode toggle
  - file: sessions-toolbar.png
    alt: The dashboard toolbar
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    crop: "[data-testid='toolbar']"
  - file: sessions-menu.png
    alt: The dashboard menu
    route: /sessions
    scene: dashboard
    waitFor: text=Pricing page copy
    actions:
      - click: "[aria-label='Open menu']"
    crop: ".MuiMenu-paper"
---

## The dashboard

The **Sessions** page is where you run and watch coding agents. The sidebar on the left lists every live session as a card, grouped by repo, and the session area on the right shows the selected session's terminal.

A session is either an agent (Claude, Codex or pi) working on a prompt or an assist command such as `/draft`, or a **run** session that executes one of the repo's `run` entries, such as a dev server.

::screenshot{file="sessions-dashboard.png"}

Here the sandbox repo has three sessions, so they share a group: an agent waiting on an answer, a dev server and an agent still working. The `api` and `website` repos have one session each, so their cards stand alone.

## Starting it

```bash
assist
```

This starts the web server on port 3100 and opens it in your browser. `assist sessions web --port <n>` picks another port, and `--no-open` skips the browser.

## The toolbar

::screenshot{file="sessions-toolbar.png"}

From left to right:

- **Refresh** restarts the web server. Sessions keep running.
- **Tabs**:
  - **Sessions** (:kbd[Alt+1]) — this page.
  - [Backlog](../backlog/) (:kbd[Alt+2]) — the selected repo's backlog items.
  - [Next](../next/) (:kbd[Alt+3]) — what to pick up next.
- **Repo picker** (:kbd[Alt+R]) chooses the repo the toolbar acts on. It lists the repo the web server started in plus every repo a session has run in; type to filter. Selecting a card switches it to that card's repo.
- **VS Code** opens the selected repo in VS Code, and **GitHub** opens it on GitHub.
- **+** (:kbd[Mod+N] or :kbd[Alt+N]) opens the new-session dialog (see [Creating sessions](../sessions-creating/)).
- A **PRs** menu appears when the repo has open [pull requests](../pull-requests/#the-prs-menu), and a run menu when the repo has [`run` entries](../run-commands/).
- **Help** opens these docs in a new window.
- The **cog** (:kbd[Alt+W]) opens the [Config](../config/) page.
- The **menu** (:kbd[Alt+E]) holds the rest.

Every shortcut can be changed, see [Keyboard shortcuts](../sessions-keyboard/).

The menu has **Toggle dark mode**, **Show render HUD**, **Keyboard shortcuts**, **Restart daemon** and **Update assist**. Restart and update both ask before acting.

::screenshot{file="sessions-menu.png"}

## The status bar

The bar along the bottom of every page holds:

- The **usage figures** on the left, your current 5-hour and 7-day usage per harness. Hover them for the breakdown, or click to open the [Usage](../usage/) page.
- The **version badge** (:kbd[Alt+Q]) on the right, which shows how many updates are ready and opens the [Updates](../updating/#the-updates-page) page.

## Releases and News

The [Releases](../releases/) and [News](../news/) tabs appear only once they're set up, so they aren't in the screenshot. They take :kbd[Alt+4] and :kbd[Alt+5].
