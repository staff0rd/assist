---
description: Recall context from the most recent prior session in this repo
---

Load the most recent handover note for this repo so the current session can pick up where the last one left off. Always operate on the current working directory; do not ask which repo to recall.

Handover notes are stored in the backlog database (scoped by git origin), authored by `/handover`. `/recall` reads only those notes — it does not read session transcripts or any disk files.

## Step 1: List unrecalled notes

Run:

```bash
assist handover list
```

This prints one unrecalled handover per line, most recent first, as tab-separated `id`, ISO-8601 created timestamp, and one-line summary.

- **No output** — there are no unrecalled handovers. Skip to Step 3 and emit the "no handover" block.
- **Exactly one line** — recall it directly in Step 2 with no id.
- **More than one line** — present the summaries (with their created timestamps) to the user and ask which to recall, then pass the chosen `id` in Step 2.

## Step 2: Recall the chosen note

Run:

```bash
assist handover recall [id]
```

With no argument this recalls the most recent unrecalled handover; with an `id` it recalls that specific note. Either way it prints the note's content to stdout and marks it recalled (so it drops out of the SessionStart advisory and future recalls).

## Step 3: Surface it

If the command printed content, present it to the user as a `# Recall` block so they can resume:

```markdown
# Recall

<the recalled handover content>
```

If the command printed nothing, there are no unrecalled handovers — emit:

```markdown
# Recall

No handover found for this repo.
```

## Guidelines

- Always operate on the current working directory — never guess or substitute another repo.
- `/recall` is the counterpart to `/handover`: it reads notes the previous session authored, nothing else.
- Do not write or modify any files.
