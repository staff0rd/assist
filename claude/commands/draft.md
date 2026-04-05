---
description: Draft a new backlog item with LLM-assisted questioning
allowed_args: "[rough description of what you want to build]"
---

You are helping the user create a well-structured backlog item with a phased implementation plan.

## Step 1: Understand the idea

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what they want to build.

Read relevant parts of the codebase to understand the current architecture and patterns.

## Step 2: Ask clarifying questions

Ask 2-4 targeted questions conversationally to flesh out the idea. Focus on:

- **Scope**: What exactly should this include? What is out of scope?
- **Done criteria**: What does "done" look like? How will we know it works?
- **Constraints**: Are there existing patterns, APIs, or conventions to follow?
- **Edge cases**: What happens when things go wrong?

Ask one question at a time. Wait for the user's response before asking the next.

## Step 3: Propose the item

Once you have enough context, propose a complete backlog item. Show it to the user in a readable format:

**Name:** (concise title)
**Type:** story or bug
**Description:** 1-3 sentences
**Acceptance Criteria:**
- (specific, testable criteria)

**Plan:**
- Phase 1: (name) — tasks...
- Phase 2: (name) — tasks... [manual checks: ...]

Keep phases small (2-4 tasks each). A typical item should have 2-3 phases.

Most phases should NOT have manual checks. Only add `manualChecks` to a phase when the checks are genuinely difficult to automate (e.g. visual appearance, UX flow, hardware interaction). Do not add a final phase just for end-to-end verification — a review phase is auto-appended at runtime.

## Step 4: Iterate

Ask the user if they want to change anything. Iterate until they confirm.

## Step 5: Save

Once confirmed, create the item and its phases via CLI commands.

First, add the item:
```
assist backlog add --name "Item name" --type story --desc "Description text" --ac "criterion 1" --ac "criterion 2" 2>&1
```

Then add each phase:
```
assist backlog add-phase <id> "Phase name" --task "Task 1" --task "Task 2" --manual-check "optional check" 2>&1
```

Then show the user the item was created and suggest they can run `assist backlog run <id>` to start implementation.
