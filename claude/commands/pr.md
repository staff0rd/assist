---
description: Raise a PR with a concise description
---

Raise a pull request for the current branch. Use a concise description with no headers. Do not reference Claude or any AI assistance in the title or body.

Use `assist prs raise` to create the PR — do not use `gh pr create` directly. The body is assembled from discrete section options; supply at minimum `--title`, `--what`, and `--why`:

- `--title <title>` — short PR title.
- `--what <what>` — what the change does (rendered as `## What`).
- `--why <why>` — why the change is needed (rendered as `## Why`).
- `--how <how>` — optional; how the change works (rendered as `## How`). Omit it unless the approach genuinely needs explaining.
- `--resolves <key>` — Jira issue key resolved by this PR; repeatable. Each key's browse URL is appended inline to the `## Why` section. Unless a Jira key is already known from the session (e.g. mentioned by the user or present on the branch), ask the user whether this PR resolves a Jira issue and for the key before raising; omit `--resolves` only if they say there isn't one.

Wrap symbols, file paths, function names, class names, variable names, config keys, CLI commands, and flag names in backticks.

One section, one question. Each section answers exactly one thing, and implementation detail lives only in `## How`:

- `## What` — what is observably different for someone using or calling this, and nothing else. Not how it's built, not which functions/files changed.
- `## Why` — the problem or motivation that made the change worth doing. Not how the solution works.
- `## How` — only the non-obvious decisions the diff alone won't explain: a deliberate trade-off, a workaround, a reason the obvious approach was rejected. Omit it entirely by default. Never restate `## What` as mechanism, and never walk through the diff.

The most common failure is altitude bleed: the author has an implementation detail they want to include, so they spray it into whichever section they're writing — `## What` narrates the diff, `## How` restates `## What`, `## Why` smuggles in mechanism. Don't. If a sentence describes a mechanism, it belongs in `## How` — and probably shouldn't exist at all unless it's a genuine non-obvious decision.

Litmus — a sentence is almost certainly mechanism (so `## How`, or cut it) if it contains "by …ing", "so that it can", "because the X filters/needs/uses", or names an internal component, property, function, or file.

Brevity budget — keep each section within these limits:

- `## What` — a few sentences (2–3).
- `## Why` — 1–2 sentences.
- `## How` — omit by default; a sentence or two, only for non-obvious decisions, not a diff walkthrough.

Write prose. A short paragraph of a few sentences is the natural form for `## What` and `## Why` — bullets in `## What` are a smell, usually a sign the change is being narrated point-by-point like a diff. Use bullets only when there are genuinely several independent, parallel items (3+) that don't read as a paragraph; a single bullet is never right — make it a sentence. Don't pack multiple points into one long running paragraph either: a single non-list paragraph over ~600 characters or ~4 sentences is a wall of text and `assist prs raise`/`assist prs edit` will reject it.

Worked example — altitude bleed across every section.

Bad — mechanism leaks everywhere:

> ## What
>
> Adds a `RetryPolicy` wrapper that catches transient errors and re-invokes the handler with exponential backoff so callers don't see intermittent failures.
>
> ## Why
>
> Intermittent failures were surfacing to users. The handler also needs to distinguish transient from permanent errors, which the new `isTransient` check does by inspecting the status code.
>
> ## How
>
> The wrapper retries with exponential backoff on transient errors.

`## What` describes the implementation (a wrapper, backoff) rather than the observable change. `## Why`'s second sentence is mechanism dressed as motivation. `## How` just restates `## What` at a lower altitude. Good — each section stays at its own altitude:

> ## What
>
> Intermittent failures are now retried automatically instead of surfacing to the user.
>
> ## Why
>
> Transient errors were failing requests that would have succeeded on a second attempt.
>
> ## How
>
> Only errors flagged transient are retried; permanent failures still fail fast, to avoid masking real bugs behind retries.

Only the genuinely non-obvious decision survives in `## How`; everything that merely paraphrased `## What` is gone.

`assist prs raise` errors if a pull request already exists for the branch. Pass `--force` to fully overwrite the existing PR's title and body.

To update an existing PR, use `assist prs edit` with the same section options (`--title`/`--what`/`--why`/`--how`/`--resolves`). Only the sections you pass are replaced; every other section of the existing body is preserved. Passing `--resolves` without `--why` keeps the existing `## Why` text and refreshes its appended Jira URLs; passing `--why` without `--resolves` replaces the prose but keeps the existing `Resolves` links.

Before creating the PR, the user must see the full proposed title and body — do not assume they can see your reasoning or earlier tool output. Write the complete title and body verbatim in your visible reply, then use the AskUserQuestion tool to ask whether to create the PR, putting the full title and body in the approve option's `preview` field so the dialog itself displays them. This confirmation is mandatory in every permission mode, including auto-accept and bypass-permissions — never run `assist prs raise` until the user has explicitly approved the title and body through AskUserQuestion. If the user requests changes, revise and confirm again before creating.
