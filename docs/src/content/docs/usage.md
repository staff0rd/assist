---
id: usage
title: Usage
group: Activity
order: 3
covers:
  - route:/usage
screenshots:
  - file: usage-rate-limits.png
    alt: The Rate limits tab, listing each 5-hour and 7-day window with its peak usage, tokens spent and reset time
    route: /usage
    scene: usage
    waitFor: text=Cycle reset
    viewport:
      width: 1440
      height: 900
  - file: usage-items.png
    alt: The Items tab, with medians across items above a table of each item's phases, active time and tokens
    route: /usage
    scene: usage
    waitFor: text=Cycle reset
    viewport:
      width: 1440
      height: 700
    actions:
      - click: "role=tab[name='Items']"
---

The **Usage** page tracks how much of your Claude plan's rate limits you use, what each backlog item cost to build, and what background jobs such as inbox scans spend. Open it from the usage figures in the dashboard's [status bar](../sessions-overview/#the-status-bar), which show your current 5-hour and 7-day usage.

## Rate limits

::screenshot{file="usage-rate-limits.png"}

Each row is one 5-hour or 7-day window, newest first, with the highest usage it reached, the average context the backlog phases in it used, the tokens spent in it and when it reset.

**All**, **5h** and **7d** filter by window. When Codex is installed, **Codex 5h** and **Codex 7d** show its windows.

## Items

::screenshot{file="usage-items.png"}

The **Items** tab lists every backlog item with recorded usage: its phases, active time, tokens and peak context. The figures across the top are medians over the items listed.

- **All**, **Done** and **Running** filter by the item's status, and the repo picker filters by repo.
- Click a column heading to sort by it, and again to reverse.
- Click an item to open it in the [backlog](../backlog/).

## Jobs

The **Jobs** tab lists the Claude runs that happen outside your sessions: each [inbox](../inbox/) scan, scheduled or started by hand, and each [PR review](../sessions-pr-review/), with one row per reviewer. Each row shows the trigger, model, start time, duration, tokens, cache use, cost and outcome. The figures across the top total the last 30 days: runs, tokens, cost and failures.

**Job** and **Trigger** filter the table.
