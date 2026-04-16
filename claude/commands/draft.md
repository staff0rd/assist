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

### Phase design rules

**Phases must be vertical slices, not horizontal layers.** Each phase should deliver a thin, working increment of the feature that can be verified end-to-end. Do NOT decompose by architectural layer (e.g. "Phase 1: schema changes", "Phase 2: backend API", "Phase 3: UI"). Instead, each phase should cut through all necessary layers to produce something observable.

Bad (horizontal):
- Phase 1: Add database schema and types
- Phase 2: Build API endpoints
- Phase 3: Create UI components
- Phase 4: Wire everything together

Good (vertical):
- Phase 1: Minimal working feature (hardcoded/simplified) visible end-to-end
- Phase 2: Add real data handling and validation
- Phase 3: Polish edge cases and error states

The test: at the end of each phase, you should be able to answer "does this work?" by running or inspecting the result. If a phase only produces internal plumbing with no observable effect, it's horizontal — restructure it.

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
