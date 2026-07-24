---
description: Draft a new backlog item with LLM-assisted questioning
allowed_args: "[rough description of what you want to build]"
---

You are helping the user create a well-structured backlog item with a phased implementation plan.

## Step 1: Understand the idea

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask the user what they want to build — do NOT read any codebase files yet. Wait for their response before doing anything else.

Once you have a description (either from $ARGUMENTS or the user's reply), read relevant parts of the codebase to understand the current architecture and patterns as they relate to what's being drafted. Do this investigation yourself — do not delegate it to a sub-agent. You need the context in your own working memory to ask good clarifying questions and design the phases.

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
**Description:** (structured markdown — see below)
**Acceptance Criteria:**

- (specific, testable criteria)

### Writing the description

Descriptions render as markdown in both the terminal (`assist backlog show`) and the web UI, so author them as structured markdown — never a single run-on prose paragraph:

- Use short paragraphs (1-3 sentences each), separated by blank lines.
- Use `##` headings to break longer descriptions into sections (e.g. Background, Goal, Notes).
- Use bullet lists for enumerations and `-`/`1.` lists where they read more clearly than prose.
- Use **bold**, `inline code`, and other inline markdown for emphasis and identifiers.

Keep it scannable. A short item can be a couple of tight paragraphs; a larger one should use headings and lists.

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

**Every phase must pass `assist verify` on its own.** Verification includes knip, which fails on unused exports. This makes horizontal slicing mechanically impossible to verify: an API helper, type, or stub added in phase 1 "for phase 2 to use" has no caller yet, so knip flags it and phase 1 cannot complete. Therefore:

- Every export a phase adds must have a caller wired up **in that same phase**.
- Never plan a task like "add X helper/endpoint/type" unless the same phase also includes the task that consumes it.
- If a feature spans backend + UI, each phase carries its slice through both — e.g. "Phase 1: endpoint + UI button that calls it", not "Phase 1: endpoint, Phase 2: button".

Two tests for each phase before proposing the plan:

1. **Observable**: can you answer "does this work?" by running or inspecting the result? If a phase only produces internal plumbing with no observable effect, it's horizontal — restructure it.
2. **Self-contained**: would `assist verify` pass with only this phase's code committed — no unused exports, no dead stubs awaiting a later phase? If not, merge the producer and its consumer into the same phase.

Keep phases small (2-4 tasks each). A typical item should have 2-3 phases.

Most phases should NOT have manual checks. Only add `manualChecks` to a phase when the checks are genuinely difficult to automate (e.g. visual appearance, UX flow, hardware interaction). Do not add a final phase just for end-to-end verification — a review phase is auto-appended at runtime.

## Step 4: Iterate

Ask the user if they want to change anything. Iterate until they confirm.

## Step 5: Save

Once confirmed, create the item and its phases via CLI commands.

First, add the item and capture the id it prints:

```
assist backlog add --name "Item name" --type story --desc "$(printf '## Background\n\nShort paragraph.\n\n## Goal\n\n- Bullet one\n- Bullet two')" --ac "criterion 1" --ac "criterion 2" 2>&1
```

Pass the description as real markdown with line breaks preserved (use `printf` or a quoted heredoc so `\n` becomes actual newlines, not the literal `\n` characters).

Note the created item id from the output — you'll pass it to the done signal below.

Then add each phase:

```
assist backlog add-phase a<id> "Phase name" --task "Task 1" --task "Task 2" --manual-check "optional check" 2>&1
```

### Associate an external tracker

If an external tracker was referenced anywhere in the conversation leading to this item — whether in `$ARGUMENTS` or supplied at any point during the discussion — associate it with the created item so downstream sessions have the context. Detect at most **one** tracker:

- A **Jira** issue — a bare key (`PROJ-123`) or an Atlassian browse URL (`https://<site>.atlassian.net/browse/PROJ-123`):

  ```
  assist backlog associate-jira a<id> "<key-or-url>" 2>&1
  ```

- A **GitHub** issue — `owner/repo#number` shorthand or a `https://github.com/owner/repo/issues/N` URL:

  ```
  assist backlog associate-github a<id> "<issue-or-url>" 2>&1
  ```

Only one external tracker can be set per item (associating one clears the other), so run at most one of these. If no tracker was referenced, skip this step. If the association command reports an error (malformed reference, issue not found), relay it to the user but do not treat it as fatal — the item was still created successfully.

### Attach a referenced Slack thread

If a Slack thread was referenced anywhere in the conversation leading to this item — a `slack.com` archives/permalink URL (e.g. `https://<workspace>.slack.com/archives/C.../p...`), whether in `$ARGUMENTS` or supplied at any point during the discussion — attach it to the created item so it renders as a linked Slack row in the Activity section:

```
assist backlog add-activity a<id> slack "<permalink>" --url "<permalink>" --title "Item name" 2>&1
```

Use the same permalink verbatim for both the ref and `--url`, and the item's name for `--title`. If no Slack thread was referenced, skip this step.

Then show the user the item was created and suggest they can run `assist backlog run a<id>` to start implementation.

Finally, signal that the drafting task is complete, passing the created item id (a-prefixed, e.g. `a555`):

```
assist signal done a<id> 2>&1
```

This lets a wrapping `assist draft --once` session end and surfaces the created item id to the session card; in a plain interactive session it has no effect.
