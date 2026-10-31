---
id: backlog
title: Backlog
group: Backlog
order: 0
covers:
  - route:/backlog
  - config:clone.baseDir
  - config:docs.refreshAfter
screenshots:
  - file: backlog-list.png
    alt: The backlog list for the sandbox repo, with an in-progress story part-way through its plan
    route: /backlog
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
    viewport:
      width: 1440
      height: 640
  - file: backlog-item.png
    alt: A backlog item's detail page, showing its description, acceptance criteria and plan
    route: /backlog
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
    viewport:
      width: 1440
      height: 900
    actions:
      - click: text=Dark mode toggle
  - file: backlog-plan.png
    alt: An item's plan, with the first phase done and the second in progress
    route: /backlog
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
    viewport:
      width: 1440
      height: 1400
    actions:
      - click: text=Dark mode toggle
    crop: "#item-section-plan"
    cropPadding: 24
  - file: backlog-activity.png
    alt: An item's activity, with its branch, a commit and a pull request, and its comments, including a phase summary
    route: /backlog
    scene: backlog
    waitFor: text=Cart total rounds to the wrong cent
    viewport:
      width: 1440
      height: 2400
    actions:
      - click: text=Dark mode toggle
    crop:
      - "#item-section-activity"
      - "#item-section-comments"
    cropPadding: 24
  - file: backlog-refresh-docs.png
    alt: The Refresh docs popover, listing the done stories no refresh covers yet with a Create Refresh docs button
    route: /backlog
    scene: backlog
    setup:
      - backlogItem:
          item:
            name: Search the product catalogue
            type: story
          status: done
      - backlogItem:
          item:
            name: Save carts between visits
            type: story
          status: done
      - backlogItem:
          item:
            name: Email a receipt after checkout
            type: story
          status: done
    waitFor: text=Cart total rounds to the wrong cent
    actions:
      - click: "button:has-text('Refresh docs')"
    crop:
      - "button:has-text('Refresh docs')"
      - ".MuiPopover-paper"
    cropPadding: 16
---

The backlog holds each repo's work as items: stories and bugs, each with a description, acceptance criteria and, usually, a plan of phases that an agent works through one at a time. Items are written by [drafting](../backlog-writing/) and built by [running](../backlog-running/) them.

The **Backlog** tab (:kbd[Alt+2]) lists the selected repo's items.

## Why a separate backlog

Assist keeps its own backlog because an item is what drives an agent's run. It holds the plan the agent works through, the phase it's on, and each session's summary, commits and usage, all updated many times per phase. An issue tracker holds none of that in a form an agent can safely update, and it would bury the team's discussion under run details.

If your team uses Jira or GitHub issues, link the ticket to the item instead. The ticket stays the team's record, and the item's first phase assigns it to you and moves it to In Progress; close it with `/jira done` or `/github done`.

## The list

::screenshot{file="backlog-list.png"}

- **Search backlog…** finds items by keyword.
- **All / Stories / Bugs** filters by type.
- **Todo / Done / All** filters by status. **Todo** shows items not yet finished, and the choice is remembered.
- The chips under the search box switch to another repo, each with its count of open items. A dashed chip is a repo that isn't cloned on the selected machine: click it to clone the repo into `clone.baseDir` (default `~/git`) and switch to it.

```bash
assist config set clone.baseDir ~/src
```

Each card shows the item's status (○ todo, ◔ in progress, ● done, ✕ won't do), id, type and, while in progress, the phase it is on, with a meter of its phases on the right. Click **phase N of M** to jump to the item's session.

On the right of a card:

- :icon[StarBorder] **Star** pins the item, so its sessions stay at the top of the [sidebar](../sessions-sidebar/).
- :icon[PlayArrow] **Build** [runs the item](../backlog-running/). A repo that isn't cloned shows **Clone** instead, and an item already running shows its session.
- :icon[MoreVert] **More actions** opens **Refine** ([refining an item](../backlog-writing/#refining-an-item)), **Mark done** and **Won't do**.

Click a card to open the item.

## Item ids

An item's id is `a` followed by a number, such as `a1` or `a555`, shown beside its type. Numbers count up as items are created and are never reused, across every repo. The `a` sets an item apart from a pull request or issue (`#14`) and a Jira key (`PROJ-12`), so you can name an item in a prompt and the agent knows it's a backlog item: `/refine a555`, `/next a555`, or "pick up a555". Commands also accept the bare number.

## An item

::screenshot{file="backlog-item.png"}

The header holds:

- **Build** runs the item from the phase it is on. Its arrow builds with Codex or pi instead, when they are installed.
- **Refine** starts a session to [refine the item](../backlog-writing/#refining-an-item). Its arrow refines with Codex or pi.
- **Delete** deletes the item.
- The status picker sets the item to todo, in-progress, done or won't do.
- The Jira or GitHub issue the item is linked to, which opens it.

Below are the **Description** and **Acceptance Criteria**, followed by the **Plan**, **Activity** and **Comments**. On a wide window, the navigator on the right jumps to each section and phase.

### Plan

::screenshot{file="backlog-plan.png"}

Each phase lists its tasks and any manual checks you'll be asked to confirm, its token and time usage, and the sessions that worked on it. **Rewind** on a finished phase sends the item back to it: give a reason, and the next build picks up from that phase with your reason.

### Activity and comments

::screenshot{file="backlog-activity.png"}

**Activity** lists the item's branches, commits, pull requests, Slack threads and agent conversations. :icon[PlayArrow] on a conversation resumes it as a new session. **Comments** holds each phase's summary and the notes agents added; :icon[DeleteOutlined] deletes a comment.

## Docs refresh

Set `docs.refreshAfter` to have a repo queue a **Refresh docs** story once that many stories are done. The story links to each story it covers, and building it updates the docs pages from what those stories shipped. Bugs don't count, and while a refresh is still open, newly done stories wait for the next one. Leave the key unset to turn this off.

```bash
assist config set docs.refreshAfter 5
```

To queue one now, click **Refresh docs** at the top of the Backlog tab. It counts the done stories no refresh covers yet; click **Create Refresh docs** in its popover to queue a story for them. While a refresh is open, the button links to it instead.

::screenshot{file="backlog-refresh-docs.png"}
