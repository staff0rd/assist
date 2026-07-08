---
description: Generate devlog entry for the next unversioned day
allowed_args: "[--all]"
---

Parse `$ARGUMENTS`: if `--all` is present, enable **catch-up mode** (described below). Otherwise, process a single day as normal.

## Single-day mode (default)

Run `assist devlog next` to get the next unversioned day's commits and version options.

Analyze the commits for that day to determine the appropriate action:

1. **Trivial changes** (typos, formatting, config tweaks, dependency updates): Run `assist devlog skip YYYY-MM-DD` and stop. Check the diff before skipping to ensure no meaningful changes were made.

2. **Bug fixes** (fixing broken behavior, error handling, corrections): Use the **patch** version.

3. **New features** (new functionality, enhancements, new commands): Use the **minor** version.

If creating a devlog entry:

1. Write a summary in first-person perspective describing the changes
2. Create a file in `~/git/blog/src/content/devlog/` with the format `YYYY-MM-DD-slug.md`

The slug should be a short kebab-case description of the main theme of the day's work.

Each devlog file should follow this format:

```markdown
---
title: <short descriptive title>
date: YYYY-MM-DD
version: <selected version>
tags: [<name from the next command output>, <additional-tag>, ...]
ai-generated: <model name, e.g., "claude-opus-4-5">
---

<First-person summary of the day's work. Group related commits into cohesive paragraphs. Focus on what was accomplished and why, not implementation details. Wrap code symbols (function names, variable names, file names, commands, etc.) in backticks.>
```

## One post per version

Navigation is keyed by `version`, so **every version may appear in at most one devlog file**. Because `assist devlog next` reports the day's `major.minor` version, consecutive days that only shipped patch releases report the *same* version — these must not become separate posts.

Before creating a file, check `~/git/blog/src/content/devlog/` for an existing entry whose `version` matches the one being written:

- **If a post with that version already exists**, merge the new day's work into it as additional paragraph(s) instead of creating a new file. Keep the existing post's `date` (the date the version was first cut) and its `title`/`slug`; widen the title only if the merged scope no longer fits it.
- **If several unversioned days share one version** (catch-up mode), write a single post anchored on the earliest of those days and fold the later days' work into it.

## Tag Selection

Fetch existing tags from https://staffordwilliams.com/tags.json for use when selecting tags.

- The **first tag must always be the repo name** from the `assist devlog next` output
- Add 1-3 additional tags relevant to the day's work (technologies, patterns, topics)
- **Strongly prefer existing tags** from the fetched list over creating new ones
- If a candidate tag is semantically similar to an existing tag, use the existing one (e.g., use `selenium` instead of creating `webdriver` or `selenium-webdriver`)
- Only create a new tag when no existing tag adequately covers the topic
- Do not include tags that are too broad or generic (e.g., `javascript`, `web`, `tooling`)

Read existing devlogs in `~/git/blog/src/content/devlog/` for style inspiration if needed. The tone should be conversational and concise.

## Catch-up mode (`--all`)

When `--all` is passed, loop through all unversioned days up to (excluding) today:

1. Run `assist devlog next` to get the next unversioned day
2. If the target date is today, **stop** — catch-up is complete
3. If there are no more unversioned days, **stop**
4. Analyze the commits for that day:
   - **Trivial days**: automatically run `assist devlog skip YYYY-MM-DD` without prompting the user
   - **Non-trivial days**: create the devlog entry as normal (following the single-day instructions above), honouring the **One post per version** rule — if the reported version already has a post, merge into it rather than creating a new file
5. Go back to step 1

This continues until all past unversioned days have been processed. Do not process today's date.

## Important

- Do not commit entries, these will be manually reviewed before publishing.
