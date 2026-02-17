---
description: Summarise recent journal entries as a standup update
allowed_args: "[days back, default 1] [project name]"
---

Summarise recent journal entries.

## Step 1: Determine the range

Parse `$ARGUMENTS` for:

- A number (days to look back, default 1)
- A project name (filter to that project only, default all)

Examples:

- `/standup` — yesterday's entries, all projects
- `/standup 3` — last 3 days, all projects
- `/standup project1` — yesterday's entries for project1
- `/standup 7 project2` — last 7 days for project2

## Step 2: Read journal files

Read the daily files from `~/.claude/journal/` for the date range. Files are named `YYYY-MM-DD.md`.

## Step 3: Present the summary

Summarise the entries concisely, grouped by day and project. Highlight:

- What was accomplished
- Key decisions made
- Any flagged blog topics or reusable IP
- Anything left in progress

Keep it brief — this is a standup, not a report.
