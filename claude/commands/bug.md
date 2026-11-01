---
description: File a bug with reproduction steps, expected and actual behavior
allowed_args: "[short description of the bug]"
---

You are helping the user file a bug report as a backlog item. Your goal is to extract the minimum information needed: what happens, what should happen, and how to reproduce it.

## Step 1: Understand the bug

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what's going wrong.

## Step 2: Gather details

Ask short, targeted questions one at a time to fill in any gaps. You need three things:

1. **Reproduction steps** — what does the user do to trigger the bug?
2. **Expected behavior** — what should happen?
3. **Actual behavior** — what happens instead?

Before asking the user about existing functionality — how a feature currently works, what a command does, where something lives — investigate the codebase first and answer it yourself. Do this investigation yourself — do not delegate it to a sub-agent; you need the context in your own working memory to write an accurate bug report. Only ask the user about things the code can't tell you (their intent, what they observed, how to reproduce it).

Skip questions the user has already answered. Stop asking as soon as you have enough to write a clear bug report — don't over-interrogate.

## Step 3: Design the UI change

Read the **Designing a new backlog item's UI change** section of `/design` (`~/.claude/skills/design/SKILL.md`) and follow its Decide and Design and review steps for the fix. If it decides the fix's UI change is not substantial, skip this step silently. Otherwise its link step applies in Step 4 and its attach step in Step 5.

## Step 4: Compose the bug report

Compose the bug report's content, but do not show it to the user yet and do not work out where the review should happen — `propose` decides that in Step 5 and tells you what to do next.

If Step 3 produced a design, link it from the description as `/design` describes.

**Name:** (concise title)
**Type:** bug
**Description:**
**Repro:** (numbered steps)
**Expected:** ...
**Actual:** ...

**Acceptance Criteria:**

- (conditions that confirm the bug is fixed)

Do NOT generate a plan — the implementer will determine how to fix it.

### Writing the description

The description renders as markdown in both the terminal (`assist backlog show`) and the web UI, so author it as structured markdown — never a single run-on prose paragraph. Use bold section labels or `##` headings, a numbered list for the repro steps, and short paragraphs for Expected/Actual:

```markdown
**Repro:**

1. Step one
2. Step two

**Expected:** what should happen.

**Actual:** what happens instead.
```

## Step 5: Propose the item

Propose the item and capture the id it prints. Use `propose`, not `assist backlog add` — `propose` is the reviewed path for an agent-authored item:

```
cat <<'JSON' | assist backlog propose --json - 2>&1
{
  "name": "Bug title",
  "type": "bug",
  "description": "**Repro:**\n\n1. ...\n2. ...\n\n**Expected:** ...\n\n**Actual:** ...",
  "acceptanceCriteria": ["criterion 1", "criterion 2"]
}
JSON
```

The payload is strict JSON — an unknown key is an error. `\n` inside the `description` string is a JSON escape and becomes a real newline, which is what the markdown rendering needs.

Always run `propose` **as a background task**, and do no other work until it returns. In a web session it blocks on the preview pane until the user decides, which can take far longer than the default command timeout, and the pending preview dies with the process — a killed `propose` abandons the item. To revise the report while its preview is still pending, re-run `propose` with the revised payload directly — do not stop the earlier task. The pane swaps to the new version, and the earlier task exits 0 printing `Superseded by a newer preview — no decision; ignore this result.` without creating anything: ignore it.

`propose` decides where the bug report is reviewed and prints what to do next. Follow that instruction; never inspect the environment to work it out yourself:

- **Created** — the item exists and its id is printed. Continue below.
- **Draft only** — it printed the rendered bug report, wrote nothing, and asked you to re-run with `--confirmed`. Show the rendered report in chat, ask the user if they want to change anything, and iterate until they confirm. Then re-run the same command with `--confirmed` appended to create the item.
- **Rejected** — the command exits non-zero and prints the reason plus every inline comment with the excerpt it was left on. Do not retry verbatim: address each comment, then call `propose` again with the revised payload. Repeat until it is approved.

Note the created item id from the output — you'll pass it to the done signal below.

### Associate an external tracker

If an external tracker was referenced anywhere in the conversation leading to this bug — whether in `$ARGUMENTS` or supplied at any point during the discussion — associate it with the created item so downstream sessions have the context. Detect at most **one** tracker:

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

If a Slack thread was referenced anywhere in the conversation leading to this bug — a `slack.com` archives/permalink URL (e.g. `https://<workspace>.slack.com/archives/C.../p...`), whether in `$ARGUMENTS` or supplied at any point during the discussion — attach it to the created item so it renders as a linked Slack row in the Activity section:

```
assist backlog add-activity a<id> slack "<permalink>" --url "<permalink>" --title "Bug title" 2>&1
```

Use the same permalink verbatim for both the ref and `--url`, and the item's name for `--title`. If no Slack thread was referenced, skip this step.

### Attach the design

If Step 3 published a design artifact, attach it to the created item as `/design` describes. If Step 3 was skipped, skip this step.

Then show the user the item was created. If `propose` printed `Started a backlog run session for a<id>.`, the user chose **Approve & start** and implementation is already running — say so, and do not suggest running it. Otherwise suggest they can run `assist backlog run a<id>` to start implementation.

If the conversation established that more items still need to be filed (e.g. a follow-up item, or one in another repo), do not signal yet — create each remaining item now, repeating Steps 3 to 5 for it.

Finally, once the last item is created, signal that the bug-filing task is complete, passing every item id created in this session (a-prefixed, e.g. `a555 a556`):

```
assist signal done a<id> [a<id> ...] 2>&1
```

This ends a wrapping `assist bug --once` session, so run it only once and only after the last item, and it surfaces every created id on the session card; in a plain interactive session it has no effect.
