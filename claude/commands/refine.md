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
assist backlog update-field <id> --desc "New description"
assist backlog update-field <id> --type story
assist backlog update-field <id> --ac "criterion 1" --ac "criterion 2"
```

Note: `--ac` replaces all acceptance criteria, so include the full list (both existing and new).

**To modify a plan phase** (phase is 0-indexed):
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

**To add a comment** (for context, decisions, or notes that don't fit in fields):
```
assist backlog comment <id> "Comment text"
```

After applying changes, show the updated item with `assist backlog view <id> 2>&1` so the user can verify.

## Step 4: Iterate

Ask if there is anything else to refine. Continue the conversation until the user is satisfied.
