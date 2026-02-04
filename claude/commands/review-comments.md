---
description: Process PR review comments one by one
---

Process review comments for the current branch's pull request.

## Fetching Comments

Fetch all review comments using `assist prs list-comments`. This returns both review-level and line-level comments, each with a `type` field ("review" or "line"). Comments are also cached to `.assist/pr-{prNumber}-comments.yaml` for use by reply and resolve commands.

**Note:** Line comments include a `resolved` field - only process comments where `resolved: false`. Resolved comments are included for reference when addressing subsequent comments.

## Processing Comments

Create a task for each comment found. For each comment:

1. **Display the comment** to the user:
   - Show the reviewer, file/line (if applicable), and the comment text
   - Show the relevant code context (diff hunk or read the file)

2. **Analyze the comment** and determine your recommendation:
   - Read the relevant source file if needed for context
   - Consider whether the feedback is valid, applicable, and improves the code
   - Prepare a recommended fix if you believe the comment should be addressed

3. **Present options to the user** using AskUserQuestion:
   - Include the comment URL (from `html_url` field) so the user can view it on GitHub
   - **Address the comment**: Display your recommended fix and explain why it addresses the feedback
   - **Do not address**: Display your reasoning for why the comment should not be addressed (e.g., already handled, out of scope, incorrect suggestion)

4. **Act on the user's choice**:
   - If addressing:
     1. Implement the fix
     2. Run `/commit` to commit changes - parse the 7-char SHA from the output line "Committed: <sha>"
     3. Run `assist prs fixed <comment-id> <sha>` to reply with commit link and resolve the thread
   - If not addressing:
     1. Write a **very concise** summary of why (must not contain "claude" or "opus")
     2. Run `assist prs wontfix <comment-id> "<reason>"` to reply and resolve the thread
   - **Commit references**: Always use full markdown links (e.g., `[abc1234](https://github.com/owner/repo/commit/abc1234)`), never bare SHAs

5. **Repeat** until all comments have been processed

## Important

- Process comments one at a time to avoid overwhelming the user
- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
- Reply messages must not contain "claude" or "opus" (case-insensitive) - the command will reject them
- When referencing previous comments, use markdown link syntax: `[previous comment](url)`
- Use backticks to wrap inline code or keywords (e.g., `functionName`, `variable`)
