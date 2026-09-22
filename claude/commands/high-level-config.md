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

Show the globs with, for each, the files in this repo it matches (a count, plus a few names). Ask them to accept or edit, and ask which config file the values go to:

- `project` — the repo's own `assist.yml`, checked in, so the team reviews against the same globs
- `repo` — this repo's block in `~/.assist.yml`, personal to this machine

## Step 4: Write the answers

Pass every key, so nothing is prompted for — you have already asked:

```
assist review --high-level --configure --scope project \
  --answer 'review.highLevel.criticalPaths=**/*.graphql,en-AU/translation.json' \
  --answer 'review.highLevel.uiPaths=src/ui/**' \
  --answer 'review.highLevel.descriptionWordCap=300'
```

An empty value (`--answer 'review.highLevel.uiPaths='`) leaves that key unset — which for `uiPaths` means the UI-evidence check passes rather than fails, so only do it when the user has said the repo has no UI.

All three are validated and written in one pass, so a rejected value leaves the config file untouched. Report what was written and where, quoting the command's own output.
