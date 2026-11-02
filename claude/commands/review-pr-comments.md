---
description: Collect a decision for every PR review comment, then fix, commit and resolve them
---

Process review comments for the current branch's pull request.

## Fetching Comments

Fetch all review comments using `assist prs list-comments`. The output is already grouped and filtered — read it directly, and do not parse the YAML cache:

- **Review comments** print first, in full.
- **Unresolved threads** print next, one block per thread, each headed `Thread on <path>:<line>` and listing every comment in the thread with its author, `id` and `html_url`, followed by the body. These are the threads to process.
- **Resolved threads** print below as a one-line-per-thread index, for reference only — do not process them.
- The closing summary reports the unresolved and resolved thread counts.

Comments are also cached to `~/.assist/pr-comments/{org}/{repo}/pr-{prNumber}-comments.yaml` for use by the reply and resolve commands.

## Processing Comments

**Threads:** each unresolved thread block is one unit of work — never merge different threads, even when they are on the same file. Within a block, present follow-up comments (e.g., a reviewer endorsing a bot suggestion) as context alongside the primary actionable comment. Only call `fixed`/`wontfix` once per thread, using the `id` of the primary actionable comment (on Azure DevOps every comment in a thread shows the thread's id).

Create a task for each unresolved **thread** (not each comment). Collect a decision for every thread before changing anything:

1. **Display the comment** to the user:
   - Show the reviewer, file/line (if applicable), and the comment text
   - Show the relevant code context (diff hunk or read the file)

2. **Analyze the comment** and determine your recommendation:
   - Read the relevant source file if needed for context
   - Consider whether the feedback is valid, applicable, and improves the code
   - Prepare a recommended fix if you believe the comment should be addressed

3. **Ask the user** using AskUserQuestion, and record their choice alongside your recommended fix:
   - Include the comment URL (from `html_url` field) so the user can view it on the PR's host (GitHub or Azure DevOps)
   - **Address the comment**: Display your recommended fix and explain why it addresses the feedback
   - **Do not address**: Display your reasoning for why the comment should not be addressed (e.g., already handled, out of scope, incorrect suggestion)
   - **Skip**: Leave the thread untouched

   Do not edit any file, commit, reply or resolve anything until every thread has a decision.

4. **Implement the fixes** once every thread has a decision: implement each **Address** thread in turn and run `/commit` after each — one commit per thread — parsing the 7-char SHA from the output line "Committed: <sha>".

5. **Reply and resolve**:
   - For each addressed thread, run `assist prs fixed <comment-id> <sha>` with the SHA of the commit that addressed it — the first one pushes every commit, so do not run `git push` yourself.
   - For each **Do not address** thread, write a **1-sentence** summary of why, max 15 words (must not contain "claude" or "opus"), and run `assist prs wontfix <comment-id> "<reason>"` to reply and resolve the thread — or, if the reason contains backticks, `$(...)` or `$VAR`, use the stdin form below so your shell cannot expand it.
   - Leave skipped threads untouched.
   - **Commit references**: Always use full markdown links to the commit on the PR's host, never bare SHAs — `[abc1234](https://github.com/owner/repo/commit/<full-sha>)` on GitHub, `[abc1234](https://dev.azure.com/org/project/_git/repo/commit/<full-sha>)` on Azure DevOps

## Auto mode

If `$ARGUMENTS` contains `--auto`, process the threads without asking the user, overriding steps 3–5 above:

1. For each thread, display it and analyse it as in steps 1 and 2, then act on your own recommendation instead of asking:
   - **Address**: implement the fix and run `/commit` — one commit per thread — noting the SHA. Do not push yet and do not run `assist prs fixed` yet.
   - **Do not address**: run `assist prs wontfix <comment-id> "<reason>"` as in step 5.
2. If you cannot confidently decide on a thread — the comment is unclear, the fix is risky or large, or reasonable people would disagree — put that one thread to the user with AskUserQuestion exactly as in step 3, act on their choice as above, then continue automatically with the next thread.
3. Once every thread has been processed, run `assist prs fixed <comment-id> <sha>` for each addressed thread with the SHA of the commit that addressed it — the first one pushes every commit, so do not run `git push` yourself.
4. Finish with a closing summary listing each thread and its outcome, calling out any thread that was skipped so the user can revisit it.

## Bodies containing markdown

Reply bodies routinely contain backticks around identifiers, and a double-quoted argument lets your shell expand backticks, `$(...)` and `$VAR` before assist ever sees the body — it posts mangled and resolves the thread with no error. Whenever the body contains any of those, pass `-` as the body and pipe it in on stdin, with the heredoc at the left margin so `EOF` terminates it:

```bash
assist prs wontfix <comment-id> - <<'EOF'
Deferring to #197, which renames `query_duckdb` to `query_data`.
EOF
```

The same `-` form works for `assist prs reply <comment-id> -` and `assist prs comment <path> <line> -`.

## Announcing when done

If `$ARGUMENTS` contains `--announce <number>`, then once every thread has been processed (addressed, wontfixed, or skipped) run `/prs-slack <number> --no-confirm` exactly once to announce the PR in Slack. Do this only at the very end, and only once, no matter how many threads there were. Without `--announce`, never announce.

## Important

- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
- Reply messages must not contain "claude" or "opus" (case-insensitive) - the command will reject them
- When referencing previous comments, use markdown link syntax: `[previous comment](url)`
- Use backticks to wrap inline code or keywords (e.g., `functionName`, `variable`) — and because that puts shell metacharacters in the body, use the stdin form from [Bodies containing markdown](#bodies-containing-markdown) whenever the body contains markdown
