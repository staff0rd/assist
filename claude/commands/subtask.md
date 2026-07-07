---
description: Add a sub-task to the session's current backlog item
allowed_args: "<sub-task text>"
---

You are adding a sub-task to the backlog item this session is working on by calling the `assist backlog add-subtask` CLI command.

## Step 1: Resolve the target item

Use the backlog item this session is working on — the one you are implementing, reviewing, or otherwise focused on (e.g. via `/next-backlog-item`, a `backlog run`, or earlier in this conversation). Use its id directly.

If this session is not working on a backlog item, there is nothing to attach the sub-task to — tell the user there is no current item and ask them to run this from a session working on one (or to add the sub-task with `assist backlog add-subtask <id>` directly).

## Step 2: Add the sub-task

`$ARGUMENTS` is the sub-task title. Call the CLI command with the resolved id:

```
assist backlog add-subtask <id> --title '<sub-task text>' 2>&1
```

Use single quotes around the title to avoid shell escaping issues. The sub-task is created with status `todo`.

Display the command output so the user can see the result. If the command reports an error (item not found, or a missing title), relay it to the user.
