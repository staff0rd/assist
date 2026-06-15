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

Keep each section to a brief plain-text summary. Wrap symbols, file paths, function names, class names, variable names, config keys, CLI commands, and flag names in backticks.

Write the description in terms of behaviour and user-facing impact: what the change does, what's different for someone using it, and why. Keep technical detail to a minimum — do not walk through the implementation approach step by step, and do not restate what is already obvious from the diff or changelog (which files changed, which functions were added). The reviewer can read the code; the description should tell them what to expect from the change, not narrate how it was built.

`assist prs raise` errors if a pull request already exists for the branch. Pass `--force` to fully overwrite the existing PR's title and body.

To update an existing PR, use `assist prs edit` with the same section options (`--title`/`--what`/`--why`/`--how`/`--resolves`). Only the sections you pass are replaced; every other section of the existing body is preserved. Passing `--resolves` without `--why` keeps the existing `## Why` text and refreshes its appended Jira URLs; passing `--why` without `--resolves` replaces the prose but keeps the existing `Resolves` links.

Before creating the PR, the user must see the full proposed title and body — do not assume they can see your reasoning or earlier tool output. Write the complete title and body verbatim in your visible reply, then use the AskUserQuestion tool to ask whether to create the PR, putting the full title and body in the approve option's `preview` field so the dialog itself displays them. This confirmation is mandatory in every permission mode, including auto-accept and bypass-permissions — never run `assist prs raise` until the user has explicitly approved the title and body through AskUserQuestion. If the user requests changes, revise and confirm again before creating.
