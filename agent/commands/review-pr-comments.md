---
description: Collect a decision for every PR review comment, then fix, commit and resolve them
---

Process review comments for the current branch's pull request.

## Fetching Comments

Fetch all review comments using `assist prs list-comments`. The output is already grouped and filtered — read it directly, and do not parse the YAML cache:

- **Unhandled reviews** print first, in full, each headed `Review by <user>` with its `id` and `html_url`, followed by the review body. These are the review bodies to process.
- **Handled reviews** print below them as a one-line-per-review index — these already have an `assist prs review-reply`, so do not process them.
- **Unresolved threads** print next, one block per thread, each headed `Thread on <path>:<line>` and listing every comment in the thread with its author, `id` and `html_url`, followed by the body. These are the threads to process.
- **Resolved threads** print below as a one-line-per-thread index, for reference only — do not process them.
- The closing summary reports the unhandled and handled review counts and the unresolved and resolved thread counts.

Comments are also cached to `~/.assist/pr-comments/{org}/{repo}/pr-{prNumber}-comments.yaml` for use by the reply and resolve commands.

## Processing Comments

**Threads:** each unresolved thread block is one unit of work — never merge different threads, even when they are on the same file. Within a block, present follow-up comments (e.g., a reviewer endorsing a bot suggestion) as context alongside the primary actionable comment. Only call `fixed`/`wontfix` once per thread, using the `id` of the primary actionable comment (on Azure DevOps every comment in a thread shows the thread's id).

**Review bodies:** read each unhandled review body and split it into units of work yourself — one per distinct, actionable finding (e.g. each item under a "Findings outside the diff" heading, or each separate request in a reviewer's prose). Do not rely on any particular markup. Drop, and note as skipped with a short reason:

- a finding already covered by an unresolved or resolved inline thread (same file and concern) — the thread handles it
- anything with nothing to act on: praise, a verdict or approval, a summary of the change, or a restatement of the inline comments

A review left with no units still gets a `review-reply` (see step 5) noting why nothing needed doing, so it stops coming back.

Create a task for each unresolved **thread** (not each comment) and each **review unit**. Collect a decision for every thread and review unit before changing anything — steps 1–4 apply to review units just as to threads:

1. **Display the comment** to the user:
   - Show the reviewer, file/line (if applicable), and the comment text — for a review unit, the part of the review body it came from
   - Show the relevant code context (diff hunk or read the file)

2. **Analyze the comment** and determine your recommendation:
   - Read the relevant source file if needed for context
   - Consider whether the feedback is valid, applicable, and improves the code
   - Prepare a recommended fix if you believe the comment should be addressed

3. **Ask the user** using AskUserQuestion, and record their choice alongside your recommended fix:
   - Include the comment URL (from `html_url` field; for a review unit, the review's `html_url`) so the user can view it on the PR's host (GitHub or Azure DevOps)
   - **Address the comment**: Display your recommended fix and explain why it addresses the feedback
   - **Do not address**: Display your reasoning for why the comment should not be addressed (e.g., already handled, out of scope, incorrect suggestion)
   - **Skip**: Leave the thread or review unit untouched

   Do not edit any file, commit, reply or resolve anything until every thread and review unit has a decision.

4. **Implement the fixes** once every thread and review unit has a decision: implement each **Address** thread or review unit in turn and run `/commit` after each — one commit per thread or unit — parsing the 7-char SHA from the output line "Committed: <sha>".

5. **Reply and resolve**:
   - For each addressed thread, run `assist prs fixed <comment-id> <sha>` with the SHA of the commit that addressed it — the first one pushes every commit, so do not run `git push` yourself.
   - For each **Do not address** thread, write a **1-sentence** summary of why, max 15 words (must not contain "claude" or "opus"), and run `assist prs wontfix <comment-id> "<reason>"` to reply and resolve the thread — or, if the reason contains backticks, `$(...)` or `$VAR`, use the stdin form below so your shell cannot expand it.
   - Leave skipped threads untouched.
   - For each unhandled review, once every one of its units has a decision and its addressed units are committed, run `assist prs review-reply <review-id> -` once, with the body on stdin (see [Bodies containing markdown](#bodies-containing-markdown)). It pushes pending commits itself. The body is a bullet list with one line per unit and its outcome — **Fixed** in a commit link, **Won't fix** with a 1-sentence reason (max 15 words), or **Skipped** — followed by any units dropped as already covered by a thread or not actionable, each with a short reason. Do not repeat the review link or add a marker; the command adds both:

     ```bash
     assist prs review-reply 123456789 - <<'EOF'
     - `parseConfig` ignores unknown keys: fixed in [abc1234](https://github.com/owner/repo/commit/<full-sha>)
     - Rename `runAll`: won't fix — the name matches the CLI command it backs.
     - Missing test for `loadCache`: covered by the [inline thread](<thread-url>).
     EOF
     ```

     If every unit of a review was skipped by the user, do not post a `review-reply` for it — it stays unhandled so it is offered again next run.

   - **Commit references**: Always use full markdown links to the commit on the PR's host, never bare SHAs — `[abc1234](https://github.com/owner/repo/commit/<full-sha>)` on GitHub, `[abc1234](https://dev.azure.com/org/project/_git/repo/commit/<full-sha>)` on Azure DevOps

6. **Closing summary**: list each thread and each review's units with their outcome, including units dropped as covered by a thread or not actionable, and call out anything skipped so the user can revisit it.

## Auto mode

If `$ARGUMENTS` contains `--auto`, process the threads and review units without asking the user, overriding steps 3–5 above:

1. For each thread and review unit, display it and analyse it as in steps 1 and 2, then act on your own recommendation instead of asking:
   - **Address**: implement the fix and run `/commit` — one commit per thread or unit — noting the SHA. Do not push yet and do not run `assist prs fixed` or `assist prs review-reply` yet.
   - **Do not address**: for a thread, run `assist prs wontfix <comment-id> "<reason>"` as in step 5; for a review unit, note the reason for its review's `review-reply`.
2. If you cannot confidently decide on a thread or review unit — the comment is unclear, the fix is risky or large, or reasonable people would disagree — put that one item to the user with AskUserQuestion exactly as in step 3, act on their choice as above, then continue automatically with the next one.
3. Once every thread and review unit has been processed, run `assist prs fixed <comment-id> <sha>` for each addressed thread with the SHA of the commit that addressed it — the first one pushes every commit, so do not run `git push` yourself — then run one `assist prs review-reply <review-id> -` per unhandled review as in step 5.
4. Finish with a closing summary listing each thread and each review's units with their outcome, including units dropped as covered by a thread or not actionable, and calling out any thread or unit that was skipped so the user can revisit it.

## Bodies containing markdown

Reply bodies routinely contain backticks around identifiers, and a double-quoted argument lets your shell expand backticks, `$(...)` and `$VAR` before assist ever sees the body — it posts mangled and resolves the thread with no error. Whenever the body contains any of those, pass `-` as the body and pipe it in on stdin, with the heredoc at the left margin so `EOF` terminates it:

```bash
assist prs wontfix <comment-id> - <<'EOF'
Deferring to #197, which renames `query_duckdb` to `query_data`.
EOF
```

The same `-` form works for `assist prs reply <comment-id> -`, `assist prs review-reply <review-id> -` and `assist prs comment <path> <line> -`. Always use it for `review-reply`, whose body is a markdown list.

## Announcing when done

If `$ARGUMENTS` contains `--announce <number>`, then once every thread and review has been processed (addressed, wontfixed, or skipped) run `/prs-slack <number> --no-confirm` exactly once to announce the PR in Slack. Do this only at the very end, and only once, no matter how many threads there were. Without `--announce`, never announce.

## Important

- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
- Reply messages must not contain "claude" or "opus" (case-insensitive) - the command will reject them
- When referencing previous comments, use markdown link syntax: `[previous comment](url)`
- Use backticks to wrap inline code or keywords (e.g., `functionName`, `variable`) — and because that puts shell metacharacters in the body, use the stdin form from [Bodies containing markdown](#bodies-containing-markdown) whenever the body contains markdown
