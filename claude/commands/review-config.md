---
description: Configure this repo's high-level review checklist keys
allowed_args: "[what matters in this repo, e.g. 'the graphql schema and the translation catalogue']"
---

The user wants to set `review.highLevel.criticalPaths`, `review.highLevel.uiPaths` and `review.highLevel.descriptionWordCap` for this repo — the three variable parts of the high-level review checklist (`assist review --high-level`, see `docs/high-level-review.md`). You propose the values from the repo itself; the user accepts or edits them; `assist` writes them.

## Step 1: Read what is already set

```
assist config get review.highLevel.criticalPaths
assist config get review.highLevel.uiPaths
assist config get review.highLevel.descriptionWordCap
```

A key that is already set is the starting point — propose a change to it only where you can say why.

## Step 2: Propose globs from this repo's own tree

Look at the repo, do not guess from its language or framework. `git ls-files` is the source; read enough of the files you are unsure about to be sure.

- **criticalPaths** — the files where a wrong line is expensive and an LLM reviewer cannot judge it: schema and API definitions, translation catalogues, database migrations, infrastructure and deployment definitions, dependency and permission manifests. Their full diffs are put in front of the human reviewer, so keep the set small — a glob that matches half the repo makes the item unreadable and it will be rubber-stamped.
- **uiPaths** — the files that render the user interface, so that touching one requires a screenshot or video on the PR. Exclude tests and stories.
- **descriptionWordCap** — leave at 300 unless the user asks otherwise.

Every glob must match files this repo actually has. Check each one does before proposing it.

## Step 3: Put the proposal to the user

Do not ask in chat. Write the proposal as markdown to a scratch file with the Write tool, one heading per key so each can be commented on:

- each glob as its own bullet, with the files in this repo it matches (a count, plus a few names), and why it belongs
- `descriptionWordCap` with its value
- the scope you propose, with the other one named so the user can swap it:
  - `repo` — this repo's override in the shared assist database, personal to the user and seen by every node (propose this unless the user has said otherwise)
  - `project` — the repo's own `assist.yml`, a file to check in so the team reviews against the same globs; only when the user asks for it, since it leaves a new file in a repo they may not own

Then run, **as a background task**, doing no other work until it returns:

```
assist ask --title 'High-level review config' --body - < <scratch file>
```

- **Approved (exit 0)** — fold every printed inline comment into the answers (a comment on a glob edits or drops it; a comment on the scope switches it), then write.
- **Rejected (non-zero exit)** — write nothing. Address the reason and each comment, re-check any changed glob still matches files, revise the scratch file and re-run `assist ask`.

Outside a web session `assist ask` only prints the markdown and exits 0 without a decision: ask the user in chat instead, and write only once they have answered.

## Step 4: Write the answers

Pass every key, so nothing is prompted for — you have already asked:

```
assist review --high-level --configure --scope repo \
  --answer 'review.highLevel.criticalPaths=**/*.graphql,en-AU/translation.json' \
  --answer 'review.highLevel.uiPaths=src/ui/**' \
  --answer 'review.highLevel.descriptionWordCap=300'
```

An empty value (`--answer 'review.highLevel.uiPaths='`) leaves that key unset — which for `uiPaths` means the UI-evidence check passes rather than fails, so only do it when the user has said the repo has no UI.

All three are validated and written in one pass, so a rejected value leaves the config file untouched. Report what was written and where, quoting the command's own output.
