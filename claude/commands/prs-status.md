---
description: Write a markdown overview of the open PRs across the named repos
allowed_args: "<owner/repo>..."
---

Report what is still pending merge across the repos in `$ARGUMENTS`.

## Step 1: Resolve the repos

`$ARGUMENTS` is one or more `owner/repo` arguments. With none, ask the user which repos to report on and stop — do not guess, and do not fall back to the current repo.

## Step 2: Collect the facts

Run:

```bash
assist prs status <repos> --json
```

The payload is `{ repos: [{ repo, pullRequests: [...] }], errors: [{ repo, error }] }`. Each pull request carries `number`, `title`, `url`, `author`, `isBot`, `isDraft`, `createdAt`, `updatedAt`, `age` (a label like `3d`, derived from `updatedAt`), `ageHours`, `reviewDecision`, `reviews` (per-reviewer `state`), `checks.failing`, `checks.pending`, `mergeable`, and `unresolvedThreads`.

Use only what the payload says. `unresolvedThreads: null` means that PR's thread query failed — report it as unknown, never as zero. `ageHours: null` means the timestamp could not be parsed.

## Step 3: Sort each PR into one bucket

Discard every PR with `isDraft: true` — a draft is not pending merge. Keep a count of the discarded drafts for the summary line.

Each remaining PR belongs in exactly one section, taking the first that matches:

1. **Pending review** — no failing checks, `mergeable` is not `CONFLICTING`, no unresolved threads, and `reviewDecision` is `REVIEW_REQUIRED` or absent with no approval in `reviews`.
2. **Changes requested** — `reviewDecision` is `CHANGES_REQUESTED`, or `unresolvedThreads` is above zero.
3. **Failing checks** — `checks.failing` is non-empty or `mergeable` is `CONFLICTING`.
4. **Ready to merge** — `reviewDecision` is `APPROVED` with clean checks and no unresolved threads.

## Step 4: Write the overview

Write the overview to chat as markdown. Do not create files, and do not post anywhere.

```markdown
# Open PRs — <repo>, <repo>

<n> open across <n> repos (<n> drafts excluded): <n> pending review, <n> changes requested, <n> failing checks, <n> ready to merge.

## Pending review

- [owner/repo#123](url) — Title (author, updated 3d ago)
  - awaiting: alice (COMMENTED)

## Changes requested

- [owner/repo#124](url) — Title (author, updated 6h ago)
  - 2 unresolved comments, bob requested changes

## Failing checks

- [owner/repo#125](url) — Title (author, updated 2d ago)
  - failing: build, lint
  - conflicting with the base branch

## Ready to merge

- [owner/repo#126](url) — Title (author, updated 1d ago)

## Stale — no activity in 7+ days

- [owner/repo#127](url) — 9d

## Could not be read

- owner/repo — <error>
```

Omit any section with nothing in it. The stale section re-lists any PR whose `ageHours` is 168 or more, whichever bucket it sits in; mark bot-authored PRs with `[bot]` after the title. Include the "Could not be read" section whenever `errors` is non-empty, even if every other repo succeeded. When every open PR is a draft, or there are no open PRs at all, say so in one line instead of emitting empty sections.
