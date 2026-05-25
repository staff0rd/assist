---
description: Write a session handover note for the next conversation
---

Write a concise handover note for the next session working on this repo. The note captures everything the next session needs to pick up where this one left off.

## Step 1: Archive the previous handover

Run `assist handover archive` first. If a `.assist/HANDOVER.md` already exists, it is moved to `.assist/handovers/archive/<ISO-ts>.md` (path printed to stdout). If no handover exists, the command is a no-op.

Do NOT skip this step — re-running `/handover` must never overwrite a prior unsaved note.

## Step 2: Write `.assist/HANDOVER.md`

Always operate on the current working directory. Write the file at `.assist/HANDOVER.md` (create the `.assist/` directory if needed). Use the following sections, in this order, and omit none even if empty (use a single "—" placeholder line):

```markdown
# Handover

## Current Task

What is actively being worked on right now — one or two sentences. Include the backlog item ID or PR number if applicable.

## Just Done

The most recent things completed in this session. Bullet list. Include file paths where relevant.

## Next Steps

What the next session should do next, in order. Bullet list. Be concrete — name files, commands, or decisions.

## Key Files

Files that the next session will most likely need to read or edit. Bullet list of `path:line` references where useful.

## Open Decisions

Choices that have not yet been made, or were deferred. State the options briefly so the next session can resume the deliberation.

## Watch Out For

Non-obvious gotchas, in-flight refactors, broken tests, half-applied changes, or anything that could trip up the next session.

## Don't Do

Things that have been ruled out, attempted unsuccessfully, or that the user has explicitly asked not to do. Saves the next session from repeating dead ends.
```

## Guidelines

- Keep each section terse — bullets, not paragraphs. The next session will read this cold.
- Reference concrete file paths and line numbers wherever it helps orientation.
- Do not summarise context that is already obvious from the code or git history.
- Do not commit `.assist/HANDOVER.md` — it is gitignored.
