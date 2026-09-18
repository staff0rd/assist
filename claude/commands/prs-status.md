---
description: Preview a markdown overview of the open PRs across the named repos, then post it to Slack
allowed_args: "[channel] <owner/repo>..."
---

Report what is still pending merge across the repos in `$ARGUMENTS`.

## Step 1: Resolve the arguments

Every argument containing a `/` is an `owner/repo`. An argument without one — `#name`, a bare name or a channel id — is the Slack channel to post to. With no repo arguments, ask the user which repos to report on and stop — do not guess, and do not fall back to the current repo. With no channel argument, omit the channel and let `assist slack post` fall back to the `slack.channel` config key.

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

## Step 4: Compose the overview

The overview is posted as two messages: the summary line in the channel, and every section under it as a reply in that message's thread. Write each to its own scratch file with the Write tool — they contain backticks, quotes and newlines, so never inline them in a shell command. Plain markdown, no wrapping code fence: Slack renders markdown as it is. Slack does not render headings, so every section label is bold text, not `#`. Each PR line already names its repo, so the summary does not list the repos again.

The summary file is one line, ending in a 🧵 that points at the thread:

```markdown
**Open PRs** — <n> open across <n> repos (<n> drafts excluded): <n> pending review, <n> changes requested, <n> failing checks, <n> ready to merge. 🧵
```

The reply file holds the sections:

```markdown
**Pending review**

- [repo#123](url) — Title (author, updated 3d ago)
  - awaiting: alice (COMMENTED)

**Changes requested**

- [repo#124](url) — Title (author, updated 6h ago)
  - 2 unresolved comments, bob requested changes

**Failing checks**

- [repo#125](url) — Title (author, updated 2d ago)
  - failing: build, lint
  - conflicting with the base branch

**Ready to merge**

- [repo#126](url) — Title (author, updated 1d ago)

**Stale — no activity in 7+ days**

- [repo#127](url) — 9d

**Could not be read**

- owner/repo — <error>
```

Omit any section with nothing in it. The stale section re-lists any PR whose `ageHours` is 168 or more, whichever bucket it sits in; mark bot-authored PRs with `[bot]` after the title. Include the "Could not be read" section whenever `errors` is non-empty, even if every other repo succeeded. When every open PR is a draft, or there are no open PRs at all, say so in one line and stop — do not preview an empty overview.

## Step 5: Preview the thread

Preview both messages as one batch, in thread order, so nothing posts until the whole thread is approved:

```bash
assist slack post '<channel>' --parts <summary scratch file> <reply scratch file>
```

The panes pop in sequence and no path is handed back until both parts are approved.

- **Approved** — stdout names the target, then each approved body's path under `~/.assist/slack/` prefixed with its position (`1/2`, `2/2`). Those files, not the scratch files, are what get posted.
- **Rejected** — the first rejection halts the batch and exits non-zero naming that part's position, the reason, any inline comments and its working file. Nothing posts. Address every comment, rewrite that working file in place, and re-run the whole batch against the working files. Do not rebuild the overview from scratch — re-run `assist prs status` only if the rejection asks for fresh data. A comment on the summary that also applies to the sections is carried into the reply body too.

## Step 6: Post the thread

1. Resolve the channel named on the `Approved for ...` line to its id with `mcp__claude_ai_Slack__slack_search_channels`, passing `channel_types: "public_channel,private_channel"`. If the query returns no match, or more than one plausible match, stop and ask the user which channel to use — do not guess.
2. Post part `1/2` verbatim with `mcp__claude_ai_Slack__slack_send_message` (`channel_id`, `message`).
3. Post part `2/2` the same way, adding `thread_ts` set to the `ts` the first response returned.
4. Report the summary's permalink.

If the reply fails to post, say so plainly — the channel now holds a 🧵 with nothing under it. Revise that body and re-preview it with `--thread '<summary permalink>'`, which previews it as a reply under the live thread.
