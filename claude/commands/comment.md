---
description: Add pending review comments to the current PR
allowed_args: "<item numbers, e.g. 1,2,3>"
---

Add pending review comments to the current branch's pull request for the specified items.

## Parsing Arguments

Parse `$ARGUMENTS` as a comma-separated list of item numbers (e.g. `1,2` or `1,2,3`). These refer to items in a numbered list from earlier in the conversation.

## Finding the Referenced List

Look back through the conversation for the most recent numbered list of issues, suggestions, or comments. Each item should have enough context to determine:
- **path**: the file path
- **line**: the line number
- **body**: a concise comment describing the issue

If any referenced item number doesn't exist in the list, report the error and skip it.

## Posting Comments

For each referenced item, run:

```
assist prs comment <path> <line> '<body>' 2>&1
```

**Important:** Always use single quotes around `<body>`, never double quotes. Double quotes cause shell escaping issues with backticks and special characters.

The body must:
- Be a clear, concise description of the issue (1-2 sentences)
- Not contain "claude" or "opus" (case-insensitive) — the command will reject it
- Not contain single quotes (reword to avoid them)
- Use backticks to wrap inline code or keywords (e.g. `functionName`)

## Report

After posting, summarise which comments were added and any that failed.
