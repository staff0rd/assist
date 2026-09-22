# High-level review

Reviewing agent-generated code line by line no longer scales — the volume of change per PR is past what a human can eyeball, and reading it all anyway is how review degrades into a rubber stamp. `assist review` keeps running the adversarial LLM review over every line. This is the complementary **human** path, not a replacement for it.

## What a human is expected to review

Two things, and deliberately not "every line":

- **The structure of the change** — which files were added, deleted and modified, and whether that shape matches what the PR says it does. A change that claims to add a filter but rewrites the data layer is visible here and nowhere else.
- **The diffs of critical files** — the small set of files where a wrong line is expensive and an LLM reviewer has no way to know it: schema definitions, translation catalogues, infrastructure, anything else the repo names in `review.highLevel.criticalPaths`.

Everything else the human is asked for is about the PR being reviewable at all: does the description say what changed and why, is it short enough to actually be read, does it link the issue it resolves, and is a UI change evidenced by something you can look at.

Per-file GitHub diff URLs stay available throughout, for when someone does want to drop to line level.

## The checklist

Deterministic items are evaluated from the PR body and its changed files, and shown as pass or fail with the reason. Manual items are ticked by the reviewer, each backed by a view that makes the judgement possible.

| Item                                                           | Kind          | Evaluated from                                                                                                     |
| -------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Description has a **What** and a **Why** (**How** is optional) | deterministic | `## What` and `## Why` sections in the PR body, both non-empty                                                     |
| Description is under the word cap                              | deterministic | The PR body's word count against `review.highLevel.descriptionWordCap`                                             |
| Description links the GitHub issue the PR resolves             | deterministic | A `#123`, `owner/repo#123` or github.com issue URL in the PR body                                                  |
| UI changes are evidenced by one or more screenshots or videos  | deterministic | An image, video or attachment in the PR body, required only when a changed file matches `review.highLevel.uiPaths` |
| The structure of the change is sensible                        | manual        | The changed-file tree with add/delete/modify counts and a per-file GitHub diff link                                |
| The critical-file diffs are correct                            | manual        | Full diffs of files matching `review.highLevel.criticalPaths`                                                      |
| If the change needs backend work, the backend PR is linked     | manual        | The PR body                                                                                                        |

The checklist is expected to change. This document carries the rationale and the expected items; the items themselves live in `src/commands/review/highLevel/highLevelChecklist.ts`, and each deterministic one is a module beside it.

## Why these checks and not others

- **What/Why, not How.** The reviewer needs the intent to judge the structure against. How it was done is what the diff is for.
- **A word cap.** Agents write long. A description nobody finishes reading is worse than a short one, so verbosity fails the checklist rather than being tolerated.
- **A linked issue.** Without it the PR is the only record of why the work happened, and PRs are not where anyone looks a year later.
- **Screenshots for UI work.** A UI diff does not tell you what the screen looks like. Nothing but a picture does.

## Configuration

Three keys in `assist.yml`, all under `review.highLevel`:

| Key                  | Default | Meaning                                                                    |
| -------------------- | ------- | -------------------------------------------------------------------------- |
| `criticalPaths`      | none    | Globs whose full diffs back the critical-diff item                         |
| `uiPaths`            | none    | Globs that make a change a UI change, so a screenshot or video is required |
| `descriptionWordCap` | 300     | The cap the description is held to                                         |

With `uiPaths` unset the UI-evidence check passes — a repo that has not said which files are UI cannot be told it is missing a screenshot of one.

`assist review --high-level --configure` asks for all three rather than leaving them to be looked up. Each key is asked in turn, prefilled with its current value or, where it is unset, with globs Claude proposes from the repo's own tree — which is the point of asking rather than documenting a default: the critical files of a repo are its own, and nobody outside it can name them. Accept a proposal, edit it, or answer blank to leave the key unset. The flow asks first where the answers go — the project `assist.yml`, checked in so the team reviews against the same globs, or this repo's block in `~/.assist.yml`, personal to one machine — and writes them all in one pass at the end, so a value the schema rejects leaves the file as it was.

Inside an agent session the prompts have nobody to answer them, so the asking belongs to the agent: `/review-config` has it read the repo, propose each glob with the files it matches, and put that to the user in the conversation, where a proposal can be argued with rather than only accepted or retyped. The accepted answers are then passed through `--answer key=value` and `--scope`, which skip the prompts and the proposal entirely — the same single validated write, driven by the agent instead of the terminal.

## Scope

`assist review --high-level [number]` checks the PR branch out, evaluates the checklist and opens it in the web UI preview pane, where the deterministic items show their pass or fail, the manual items are ticked, and any item can carry a comment. Finishing records an approve or request-changes verdict and writes it, the per-item state and the comments to `~/.assist/high-level-reviews/<repo>/<branch>-<head-sha>.json`. Outside an assist session the checklist is printed to the terminal instead.

The two structural items carry their evidence in the pane, so the judgement is made without leaving it:

- **Structure** expands to the changed-file tree. Directories collapse and expand, and which ones are collapsed is remembered per PR, so a tree folded down to what matters stays folded across a reopen. Directories roll their children's line counts up and a chain of single-child directories reads as one row, so the shape of the change is a glance rather than a scroll. Each file is marked added, deleted or modified and carries its `+`/`-` line counts; clicking one opens its diff in the same viewer the session diff uses — syntax highlighting, word-level edit marks, unified or split — in a dialog, with a link out to GitHub for when the conversation there is what is wanted.
- **Critical diffs** expands to the full diff of every changed file matching `review.highLevel.criticalPaths`, inline in the pane and in that same viewer. With no critical paths configured, or none of them touched, the item says so rather than showing an empty box — it is still the reviewer's to tick.

Diffs travel with the review rather than being fetched per file, so they are budgeted: a single file is capped at 1500 lines and the whole review at 20000, whole hunks at a time, with critical files served first. Anything past the cap says so and points at GitHub — a lockfile does not get to crowd out the schema.

A review is keyed on the head SHA, so re-running against the same head reopens the saved one with its ticks and comments intact rather than starting over; `--force` discards it and starts fresh. A new push moves the head SHA, and so starts a new review.

**Nothing is posted to GitHub.** The review is captured locally so the checklist can be got right before anything it produces reaches a PR.
