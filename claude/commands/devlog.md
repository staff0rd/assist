---
description: Generate devlog entry for the next unversioned day
---

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

## Tag Selection

Fetch existing tags from https://staffordwilliams.com/tags.json for use when selecting tags.

- The **first tag must always be the repo name** from the `assist devlog next` output
- Add 1-3 additional tags relevant to the day's work (technologies, patterns, topics)
- **Strongly prefer existing tags** from the fetched list over creating new ones
- If a candidate tag is semantically similar to an existing tag, use the existing one (e.g., use `selenium` instead of creating `webdriver` or `selenium-webdriver`)
- Only create a new tag when no existing tag adequately covers the topic

Read existing devlogs in `~/git/blog/src/content/devlog/` for style inspiration if needed. The tone should be conversational and concise.
