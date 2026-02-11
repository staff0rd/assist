---
description: Pick and implement the next backlog item
---

Run `assist backlog list --status todo --verbose 2>&1` to see all available backlog items.

Choose ONE item to implement. You may pick whichever item you like. Read the item's name, description, and acceptance criteria carefully. If anything is unclear or ambiguous, ask the user for clarification before proceeding.

Once you have chosen an item, run `assist backlog start <id>` to mark it as in-progress.

Implement the item fully, satisfying ALL acceptance criteria. Do not skip any.

When implementation is complete, run `/verify` and fix any issues until it passes.

Then stop and wait for the user. Do NOT call `assist backlog done` yet. Inform the user the item is ready and wait for them to call `/commit`.

Only after the user has called `/commit` and the commit succeeds, run `assist backlog done <id>` to mark the item as done.
