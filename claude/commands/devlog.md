---
description: Generate the weekly dev entry for the next unwritten ISO week
allowed_args: "[--all]"
---

Parse `$ARGUMENTS`: if `--all` is present, enable **catch-up mode** (described below). Otherwise, process a single week.

## Single-week mode (default)

Run `assist devlog next`. It prints the project `name`, the ISO `week` (e.g. `2026-W33`), its Monday–Sunday `range`, the `dates` of the first and last commits, the `versions` range, and every commit in the week oldest first, each tagged with its version. Versions come from `package.json` at that commit (as major.minor), except when `package.json` at `HEAD` is behind the latest semver tag: then each commit gets the full version of the earliest semver tag containing it (e.g. `v0.2.0`), and commits not yet in any release tag show no version. No versions are shown when the repo has no real version history (no tags and a version that never changes in the week). It only ever offers completed weeks; if it reports nothing to write, stop.

Decide whether the week is worth an entry:

- **Trivial week** (only typos, formatting, config tweaks, dependency updates, release commits): check the diffs to confirm nothing meaningful changed, then run `assist devlog skip <week>` (e.g. `assist devlog skip 2026-W33`) and stop.
- Otherwise write the entry below.

## Entry file

Never write the entry file yourself. Write the entry as JSON to a scratch file and pipe it to `assist devlog write < <file>`, which validates it and writes `<devlog.dir>/<name>/<yyyy>-w<NN>.md` with valid YAML frontmatter. If it reports errors, fix the JSON and re-run.

```json
{
	"week": "<week id, e.g. 2026-W33>",
	"title": "<one-line headline of the week's main themes>",
	"dates": {
		"first": "<first commit date in the week, YYYY-MM-DD>",
		"last": "<last commit date in the week, YYYY-MM-DD>"
	},
	"versions": {
		"first": "<earliest version in the week>",
		"last": "<latest version in the week>"
	},
	"aiGenerated": "<model name, e.g. claude-opus-5>",
	"added": [
		{
			"text": "<short phrase naming something new>",
			"version": "<version of the commit(s) it came from>"
		}
	],
	"changed": [
		{
			"text": "<short phrase naming a change to existing behaviour>",
			"version": "<version>"
		}
	],
	"fixed": [
		{ "text": "<short phrase naming what was broken>", "version": "<version>" }
	],
	"lede": "<1-2 sentence lede summarising what the week was about>"
}
```

- **title**: a terse headline naming the week's 2-3 main themes (e.g. `Comment previews, Windows config writes, collapsible sidebar`), not a sentence.
- **dates**: the first and last commit dates reported as `dates` by `assist devlog next`.
- **versions**: the first and last versions reported by `assist devlog next`. Omit `versions` entirely when it reports none.
- **added / changed / fixed**: one line per user-visible change, newest version first within each list. Merge related commits into one line and drop release commits, refactors, tests and other internal-only work. Use `feat:` commits as a hint for **added** and `fix:` for **fixed**, but classify by what changed for the user. Omit a list that would be empty.
- **version** on each line: the version shown against the commit(s) the line came from (the latest one when several commits are merged). Omit `version` when `assist devlog next` reports no versions.
- Write each line as a short changelog phrase (at most 80 characters, which `assist devlog write` enforces), not a sentence: name the thing, drop the explanation. A fix names what was broken, e.g. "`assist backlog show` not printing comments", not "`assist backlog show` collected comments but never printed them". Wrap code symbols (commands, function names, file names, config keys) in backticks.
- **lede**: one or two sentences, conversational, saying what the week was mostly about and why it matters.

Match the style of `<devlog.dir>/assist/2026-w33.md`. Older entries in `<devlog.dir>/` predate the short-phrase style, so don't copy their item length.

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
