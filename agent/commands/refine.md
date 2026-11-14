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

## Step 2: Wait for the refinement

End your turn after showing the item and wait for the user to type what they want to refine. Do not ask what to refine — no question, no `assist ask-question` form, no AskUserQuestion prompt — because the user always has to state the refinement and the terminal prompt is already where they do it. Their message may ask for changes to any of:

- **Name** or **description**
- **Type** (story / bug)
- **Acceptance criteria**
- **Plan phases** (add, modify, remove, or reorder phases and their tasks)
- **External tracker** (a Jira key/URL or a GitHub issue reference to associate)
- **General feedback** that should be captured as a comment

Once they have said what to refine, ask follow-up clarifying questions as needed, one focused question at a time, waiting for the user's response before continuing.

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

**To change the plan** — adding, editing, removing or reordering phases — make one `update-plan` call with the complete desired plan. This is the way every plan change is applied, whether it is a single new phase or a full restructure:

```
cat <<'JSON' | assist backlog update-plan <id> --json - 2>&1
{
  "phases": [
    { "name": "Phase one name", "tasks": ["Task 1", "Task 2"] },
    { "name": "Phase two name", "tasks": ["Task 1"], "manualChecks": ["optional check"] }
  ]
}
JSON
```

The payload is the whole plan, not a patch: every phase you want the item to end up with, in order, each with all of its tasks. Take the current plan from `assist backlog view <id>`, apply the user's changes to it, and send the result — a phase you leave out is removed, and reordering is just sending the phases in a different order. The payload is strict JSON, so an unknown key is an error, and each phase needs at least one task. Omit `manualChecks` for phases that don't need any (most of them). A phase named `Review` is rejected: the runner appends that phase itself, so it is never part of the stored plan.

Do not chain `add-phase`, `update-phase`, `remove-phase` and `move-phase` calls to build up a change — that is one preview per command and leaves the item half-edited if the user rejects part way. Those commands remain for a human typing a quick one-liner at a terminal.

In a web session this renders the whole change into the preview pane as one diff — each phase marked unchanged, added, edited or moved, removed phases listed separately, phases the item has already completed flagged, and any clamp of `currentPhase` into the shorter plan shown at the top — and blocks until the user decides. The review can take far longer than the default command timeout, so run `update-plan` **as a background task** and do no other work until it returns; the pending preview dies with the process. To revise the change while it is still pending, re-run `update-plan` with the revised payload directly — do not stop the earlier task. The pane swaps to the new diff, and the earlier task exits 0 printing `Superseded by a newer preview — no decision; ignore this result.` without writing anything: ignore it.

When it returns:

- **Approved** — the whole plan is written in one transaction and the stored plan matches the payload exactly.
- **Rejected** — the command exits non-zero and prints the reason plus every inline comment with the excerpt it was left on. Nothing was written. Address each comment, then call `update-plan` again with the revised whole plan.

Outside a web session the resulting plan is printed and applied straight away.

### Phase design rules

When adding or restructuring plan phases, follow the same rules as /draft:

- **Vertical slices, not horizontal layers.** Each phase delivers a thin, working increment verifiable end-to-end — never "backend in phase 1, UI in phase 2".
- **Every phase must pass `assist verify` on its own.** Verification includes knip, which fails on unused exports — so every export a phase adds must have a caller wired up in that same phase. No "phase 2 will use it" scaffolding.
- If the user proposes a horizontal split, point out that the earlier phase won't verify (knip will flag the unused exports) and suggest a vertical restructure instead.
- **Docs pages belong to Refresh docs.** Run `assist config get docs.refreshAfter 2>&1`. If it prints a number, docs pages are updated by a separate Refresh docs item after stories ship and are locked during implementation, so do not add docs page tasks or docs acceptance criteria — and if the item already has them, propose removing them. Config help (`configHelp` entries) and `--help` text are code and stay in scope. The exception is an item whose subject is the docs site itself, which can plan docs changes as normal.

**To associate an external tracker** (Jira or GitHub — mutually exclusive, one per item; associating one clears the other):

```
assist backlog associate-jira <id> "<key-or-browse-url>" 2>&1
assist backlog associate-github <id> "<owner/repo#number-or-issue-url>" 2>&1
```

`associate-jira` accepts a bare key (`PROJ-123`) or an Atlassian browse URL; `associate-github` accepts `owner/repo#number` or a `github.com` issue URL. To remove any association, add `--clear` with no reference. If the command reports an error (malformed reference, issue not found), relay it to the user — nothing is stored on failure.

**To add a comment** (for context, decisions, or notes that don't fit in fields):

```
assist backlog comment <id> "Comment text"
```

After applying changes, show the updated item with `assist backlog view <id> 2>&1` so the user can verify.

## Step 4: Design the UI change

Check the item's Activity section (from `assist backlog view <id>`) for an existing `design` row, then decide whether a design is needed. A UI change is anything the user sees in a UI — placement, style, layout, controls or copy, however small.

- **No `design` activity** and the item, as refined, involves a UI change — produce a new design.
- **An existing `design` activity** and this refinement changes the UI — update that design, republishing to its existing artifact URL rather than creating a new one.
- Otherwise (no UI change) — skip this step.

When a design is needed, do not ask whether to design it — follow `/design` (`{{skill:design}}`) for the item's UI, applying it to the item as refined. To update an existing design, read the artifact at its URL first and build on it, publishing back to the same URL. Then review it with `ask-design` rather than iterating in chat: read the **Designing a new backlog item's UI change** section of `/design` and follow the review rounds in its **Design and review** step, republishing to the same artifact URL between rounds until it is approved.

Then keep the item in sync with the design:

- **Description** — make sure it links to the design (e.g. a `## Design` section with the artifact URL) so the implementer builds against it. Add the link if it is missing or points elsewhere, using `update-field --desc` with the full description.
- **Activity** — if the design is new, attach it so it renders as a linked design row in the Activity section:

  ```
  assist backlog add-activity <id> design "<artifact-url>" --url "<artifact-url>" --title "<artifact name>" 2>&1
  ```

  Use the artifact URL verbatim for both the ref and `--url`, and the artifact's name for `--title`. A republished design keeps its URL, so its existing activity needs no change.

## Step 5: Iterate

Ask if there is anything else to refine. Continue the conversation until the user is satisfied, revisiting Step 4 whenever a further refinement changes the UI.

## Step 6: Signal completion

Once the user confirms they are done refining — and any new items the conversation called for (e.g. a split-out follow-up) have been created — signal that the task is complete, passing the ids of any items created in this session:

```
assist signal done [a<id> ...] 2>&1
```

This lets a wrapping `assist refine --once` session end; in a plain interactive session it has no effect.
