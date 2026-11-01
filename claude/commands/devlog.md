---
description: Generate the weekly dev entry for the next unwritten ISO week
allowed_args: "[--all]"
---

Parse `$ARGUMENTS`: if `--all` is present, enable **catch-up mode** (described below). Otherwise, process a single week.

## Single-week mode (default)

Run `assist devlog next`. It prints the project `name`, the ISO `week` (e.g. `2026-W33`), its Monday–Sunday `range`, the `versions` range, and every commit in the week oldest first, each tagged with the version from `package.json` at that commit (no version is shown when the repo has none). It only ever offers completed weeks; if it reports nothing to write, stop.

Decide whether the week is worth an entry:

- **Trivial week** (only typos, formatting, config tweaks, dependency updates, release commits): check the diffs to confirm nothing meaningful changed, then run `assist devlog skip <week>` (e.g. `assist devlog skip 2026-W33`) and stop.
- Otherwise write the entry below.

## Entry file

Write `~/git/blog/src/content/dev/<name>/<yyyy>-w<NN>.md`, where `<name>` is the `name` from `assist devlog next` and the filename is the week id lowercased (`2026-W33` → `2026-w33.md`). Create the `<name>` directory if needed.

```markdown
---
project: <name>
week: <week id, e.g. 2026-W33>
title: <one-line headline of the week's main themes>
versions:
  first: <earliest version in the week>
  last: <latest version in the week>
ai-generated: <model name, e.g. claude-opus-5>
added:
  - text: <one line describing something new>
    version: <version of the commit(s) it came from>
changed:
  - text: <one line describing a change to existing behaviour>
    version: <version>
fixed:
  - text: <one line describing a fix>
    version: <version>
---

<1-2 sentence lede summarising what the week was about.>
```

- **title**: a terse headline naming the week's 2-3 main themes (e.g. `Comment previews, Windows config writes, collapsible sidebar`), not a sentence.
- **versions**: the first and last versions reported by `assist devlog next`. Omit `versions` entirely when the repo has no versions.
- **added / changed / fixed**: one line per user-visible change, newest version first within each list. Merge related commits into one line and drop release commits, refactors, tests and other internal-only work. Use `feat:` commits as a hint for **added** and `fix:` for **fixed**, but classify by what changed for the user. Omit a list that would be empty.
- **version** on each line: the version shown against the commit(s) the line came from (the latest one when several commits are merged). Omit `version` when the repo has no versions.
- Write each line as a short changelog item, not first-person prose. Wrap code symbols (commands, function names, file names, config keys) in backticks.
- **lede**: one or two sentences, conversational, saying what the week was mostly about and why it matters.

Read existing entries in `~/git/blog/src/content/dev/` for style if any exist.

## Catch-up mode (`--all`)

Loop through every completed unwritten week:

1. Run `assist devlog next`
2. If it reports nothing to write, **stop** — catch-up is complete
3. For the reported week:
   - **Trivial week**: run `assist devlog skip <week>` without prompting the user
   - **Otherwise**: write the entry as in single-week mode
4. Go back to step 1

## Important

- Do not commit entries; they are manually reviewed before publishing.
