---
description: Process PR review comments one by one
---

Process review comments for the current branch's pull request.

## Fetching Comments

Fetch all review comments using `assist prs list-comments`. This returns both review-level and line-level comments, each with a `type` field ("review" or "line"). Comments are also cached to `.assist/pr-{prNumber}-comments.yaml` for use by reply and resolve commands.

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
   - **Address the comment**: Display your recommended fix and explain why it addresses the feedback
   - **Do not address**: Display your reasoning for why the comment should not be addressed (e.g., already handled, out of scope, incorrect suggestion)

4. **Act on the user's choice**:
   - If addressing:
     1. Implement the fix
     2. Run `/commit` to commit changes - parse the 7-char SHA from the output line "Committed: <sha>"
     3. Run `assist prs reply <comment-id> "Fixed in <sha>"` to reply with the commit reference
     4. Run `assist prs resolve <comment-id>` to resolve the thread
   - If not addressing:
     1. Write a concise summary of why (must not contain "claude" or "opus")
     2. Run `assist prs reply <comment-id> "<reason>"` to reply with the explanation
     3. Run `assist prs resolve <comment-id>` to resolve the thread

5. **Repeat** until all comments have been processed

## Important

- Process comments one at a time to avoid overwhelming the user
- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
- Reply messages must not contain "claude" or "opus" (case-insensitive) - the command will reject them
