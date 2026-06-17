---
description: Write a session handover note for the next conversation
---

Write a concise handover note for the next session working on this repo, then save it to the backlog database. The note captures everything the next session needs to pick up where this one left off.

Handover notes are stored in the backlog DB (scoped by git origin), never on disk. `/handover` can be run any number of times — each run appends a new note.

## Step 1: Compose the note

Always operate on the current working directory. Compose the note body using the following sections, in this order, and omit none even if empty (use a single "—" placeholder line):

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

## Step 2: Save the note

Author a one-line summary (under 100 chars) describing the note — this is what `/recall` shows when listing notes. Then save it by piping the composed note into `assist handover save` via stdin:

```bash
assist handover save --summary "<one-line summary>" <<'HANDOVER_EOF'
# Handover

## Current Task
...
HANDOVER_EOF
```

Use a quoted heredoc delimiter (`<<'HANDOVER_EOF'`) so nothing in the note body is expanded by the shell. The command resolves the repo's git origin and inserts a new row in the backlog DB.

## Guidelines

- Keep each section terse — bullets, not paragraphs. The next session will read this cold.
- Reference concrete file paths and line numbers wherever it helps orientation.
- Do not summarise context that is already obvious from the code or git history.
- Do not write `.assist/HANDOVER.md` or any other file — handovers live only in the backlog DB.
