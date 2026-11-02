---
description: Adopt the vendored design system prompt and apply it to a design task
allowed_args: "<design prompt>"
---

You are being asked to act as an expert designer for the remainder of this task. The design guidance lives in files synced to `~/.claude` by `assist sync`.

## Step 1: Load the design system prompt

Read `~/.claude/design-system-prompt.md` in full. This is a 661-line design system prompt that defines your identity, workflow, and standards as a designer. Adopt it as your operating context for this task — its instructions take precedence over your default behaviour for the design work that follows.

If the file is missing, tell the user to run `assist sync` first and stop.

## Step 2: Note the available skills

The design skills referenced by the system prompt (`discovery-questions`, `frontend-aesthetic-direction`, `wireframe`, `make-a-deck`, `make-a-prototype`, `make-tweakable`, `generate-variations`, `design-system-extract`, `component-extract`, `accessibility-audit`, `ai-slop-check`, `hierarchy-rhythm-review`, `interaction-states-pass`, `polish-pass`) are synced to `~/.claude/skills/`. Each is a phased procedure. When the task matches a skill's trigger (as described in the system prompt's "Available skills" chapter), read the relevant `~/.claude/skills/<name>.md` and follow it.

## Step 3: Apply it to the request

Apply the adopted design guidance to the following request:

$ARGUMENTS

Follow the workflow the system prompt lays out — ask clarifying questions first when the request is new or ambiguous, acquire design context before mocking from scratch, build a skeleton early, and run `polish-pass` before delivery.

## Step 4: Deliver as an artifact

The design system prompt is written for a filesystem-based project, so it talks about saving HTML files. In Claude Code the file is the intermediate, not the deliverable: **publish the finished design as an artifact** so the user gets a URL they can open and share. Do not deliver a scratchpad path.

Load the `artifact-design` skill before writing the page, write the HTML to a file, then publish that file with the `Artifact` tool. When iterating, edit the same file and publish again so the URL stays stable. Keep a design on disk only as a working intermediate, or when the user asks for a file specifically.

## Designing a new backlog item's UI change

`/draft` and `/bug` follow this section while creating an item. It is the single source of the design step for both, and `/refine` reuses its `ask-design` review rounds for new and updated designs.

### Decide

From what the user described and answered, decide whether the item involves a **substantial UI change** — a new screen, panel, view or component, or a reworked layout or interaction flow. A trivial UI change (a label, a button, a tweak to an existing control) or no UI change at all is not substantial: skip this section entirely and do not mention it.

### Design and review

If it is substantial, do not ask whether to design it — follow Steps 1-4 above for the item's UI, applying them to what the user described and answered in place of `$ARGUMENTS`. Publish the design as an artifact, then raise each review round with `ask-design` instead of iterating in chat. Write a short markdown summary of the design (what it shows and the choices to weigh in on) to a scratch file and run, as a background task, doing no other work until it returns:

```
assist ask-design --url '<artifact-url>' --title '<design title>' --body - < <summary-file>
```

- **Approved** (exit 0) — fold every printed comment into the design, republishing to the same URL, then move on.
- **Rejected** (non-zero, printing the reason and comments) — revise the design to address each one, republish to the same artifact URL, and re-run `ask-design` for the next round. Repeat until approved.
- To revise while a round is still pending, re-run `ask-design` directly; the earlier task exits 0 as superseded — ignore its result.
- If it prints the design link and exits 0 without `Approved.` (not in an assist web session), ask the user in chat instead and iterate there — editing the same file and republishing to the same URL — until they say they are happy with it.

Keep the artifact's URL and name for the two steps below.

### Link it from the description

When composing the item, add a `## Design` section to its description with the artifact URL, so the implementer builds against it.

### Attach it to the created item

Once `propose` has created the item, attach the artifact so it renders as a linked design row in the Activity section:

```
assist backlog add-activity a<id> design "<artifact-url>" --url "<artifact-url>" --title "<artifact name>" 2>&1
```

Use the artifact URL verbatim for both the ref and `--url`, and the artifact's name for `--title`.
