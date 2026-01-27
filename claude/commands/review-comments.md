---
description: Process PR review comments one by one
---

Process review comments for PR #$ARGUMENTS.

## Fetching Comments

Use `gh` to fetch all review comments:

1. **Review-level comments**: `gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/reviews --jq '.[] | select(.body != "") | {id: .id, user: .user.login, state: .state, body: .body}'`
2. **Line-level comments**: `gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments --jq '.[] | {id: .id, user: .user.login, path: .path, line: .line, body: .body, diff_hunk: .diff_hunk}'`

Get the owner/repo from `gh repo view --json owner,name`.

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
   - If addressing: implement the fix
   - If not addressing: move on to the next comment

5. **Repeat** until all comments have been processed

## Important

- Process comments one at a time to avoid overwhelming the user
- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
