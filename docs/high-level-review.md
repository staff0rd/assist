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

## Scope

`assist review --high-level [number]` evaluates the checklist and renders it. **Nothing is posted to GitHub.** The verdict, per-item state and per-item comments are captured locally under `~/.assist/high-level-reviews/`, so the checklist can be got right before anything it produces reaches a PR.
