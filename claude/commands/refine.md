---
description: Refine an existing backlog item through conversation
allowed_args: "<backlog item id>"
---

You are helping the user refine an existing backlog item through conversation.

## Step 1: Load the item

Parse `$ARGUMENTS` as a backlog item ID. If no ID was provided, ask the user which item they want to refine.

Show the current item state by running:

```
assist backlog view <id> 2>&1
```

Display the output so the user can see the current state.

## Step 2: Ask what to refine

Ask the user what they want to change or improve about this item. Listen for changes to any of:

- **Name** or **description**
- **Type** (story / bug)
- **Acceptance criteria**
- **Plan phases** (add, modify, or remove phases and their tasks)
- **General feedback** that should be captured as a comment

Ask one focused question at a time. Wait for the user's response before continuing.

## Step 3: Apply changes

Based on the user's input, apply changes using the appropriate commands. Always append `2>&1` to each command.

**To update item fields:**

```
assist backlog update-field <id> --name "New name"
assist backlog update-field <id> --desc "$(printf '## Section\n\nShort paragraph.\n\n- Bullet one\n- Bullet two')"
assist backlog update-field <id> --type story
assist backlog update-field <id> --ac "criterion 1" --ac "criterion 2"
```

Note: `--ac` replaces all acceptance criteria, so include the full list (both existing and new).

Descriptions render as markdown in both the terminal (`assist backlog show`) and the web UI, so author them as structured markdown — short paragraphs, `##` headings for longer descriptions, and bullet lists rather than one run-on prose paragraph. Pass the value as real markdown with line breaks preserved (use `printf` or a quoted heredoc so `\n` becomes actual newlines, not literal `\n` characters).

**To modify a plan phase** (phase is 1-based — the first phase is `1`, matching `assist backlog show`):

```
assist backlog update-phase <id> <phase> --name "New phase name"
assist backlog update-phase <id> <phase> --task "Task 1" --task "Task 2"
assist backlog update-phase <id> <phase> --manual-check "Check 1"
```

Note: `--task` and `--manual-check` replace the full list for that phase, so include all items.

**To remove a plan phase:**

```
assist backlog remove-phase <id> <phase>
```

**To add a new plan phase:**

```
assist backlog add-phase <id> "Phase name" --task "Task 1" --task "Task 2"
```

### Phase design rules

When adding or restructuring plan phases, follow the same rules as /draft:

- **Vertical slices, not horizontal layers.** Each phase delivers a thin, working increment verifiable end-to-end — never "backend in phase 1, UI in phase 2".
- **Every phase must pass `assist verify` on its own.** Verification includes knip, which fails on unused exports — so every export a phase adds must have a caller wired up in that same phase. No "phase 2 will use it" scaffolding.
- If the user proposes a horizontal split, point out that the earlier phase won't verify (knip will flag the unused exports) and suggest a vertical restructure instead.

**To add a comment** (for context, decisions, or notes that don't fit in fields):

```
assist backlog comment <id> "Comment text"
```

After applying changes, show the updated item with `assist backlog view <id> 2>&1` so the user can verify.

## Step 4: Iterate

Ask if there is anything else to refine. Continue the conversation until the user is satisfied.

## Step 5: Signal completion

Once the user confirms they are done refining, signal that the task is complete:

```
assist signal done 2>&1
```

This lets a wrapping `assist refine --once` session end; in a plain interactive session it has no effect.
