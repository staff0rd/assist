---
description: Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
---

Run `assist prompts 2>&1` to get the list of most frequently denied tool calls.

If there are no denied tool calls, tell the user there's nothing to fix yet and stop.

Otherwise, analyze each entry and suggest specific changes to auto-allow the recurring prompts. For each entry, recommend ONE of:

1. **Add a permission rule** to `claude/settings.json` `permissions.allow` — for safe, read-only commands that should always be allowed (e.g. `Bash(git log:*)`, `Bash(npm test:*)`)
2. **Add a cli-hook allow entry** via `assist cli-hook add <cli>` — when an entire CLI's read verbs should be auto-approved
3. **Skip** — when the denial is appropriate (write operations, destructive commands, or commands that should require confirmation)

Present your suggestions as a numbered list with the specific change for each. Group related suggestions together.

**Important:**

- Only suggest allowing read-only, non-destructive commands
- Never suggest allowing write operations (git push, rm, npm publish, etc.) without flagging them as risky
- Reference the deny reason from the output to explain why each command was blocked
- After presenting suggestions, ask the user which changes they'd like to apply
- Do NOT modify `claude/settings.json` without the user's explicit approval
