---
description: Split a coarse PR comment (e.g. from Slack) into per-line review comments on the current branch's PR, attributed to the original reviewer
allowed_args: "<reviewer handle> — followed by the quoted comment text"
---

Take a multi-point comment that was given outside of GitHub's review UI (Slack, chat, in-person notes) and post each concern as a separate line-level review comment on the current branch's PR, attributed to the original reviewer with a `via @handle` prefix.

## Inputs

- **Reviewer handle** — the GitHub username of the person whose feedback this is (e.g. `Sebastian-MakerX`)
- **Comment text** — the verbatim feedback, usually pasted into the user's prompt

If either is missing or ambiguous, ask before proceeding. The PR is always the current branch's PR.

## Steps

1. **Split the comment into atomic concerns.** Each concern becomes one review comment. A concern is a single actionable point about a single location in the code. Framing prose ("the only thing slightly naff is..."), transitions ("Another thing is..."), and meta-comments ("looks pretty good") are NOT concerns — drop them.

2. **For each concern, locate the target file and line.** Read the PR's changed files (`gh pr diff` or `gh api repos/.../pulls/<n>/files`) and the relevant source. Anchor each comment on the most specific line that the concern is about:
   - A suggestion about a specific resolver/function → the line of that resolver
   - A suggestion about a file's name or location → line 1 of the file
   - A suggestion about a type definition → the line where the type is defined
   - A suggestion about a return shape → the line that constructs/returns it

3. **Compose each comment body.** Format:

   ```
   via @<handle>

   > <verbatim quote of just the part relevant to this line>
   ```

   Rules for the quote:
   - **Quote verbatim.** Preserve the reviewer's exact wording, including typos, repeated words, odd spacing, and punctuation. Do not paraphrase, "fix," or tidy. The reviewer's voice matters.
   - **Drop framing prose.** Only the actionable suggestion that maps to _this specific line_ should appear. If the reviewer's sentence opens with broad framing ("the only thing that's slightly naff is...") and then states the suggestion, quote only the suggestion part.
   - **Add backticks around symbols.** Identifier names, type names, file names, and function names should be wrapped in backticks (e.g. `` `displayValue` ``, `` `SurveyQuestionModel` ``, `` `resolvers.ts` ``) even if the reviewer didn't use them. This is the only formatting change permitted.
   - **No editorialising.** Do not add your own commentary, explanation, or restatement. The whole body is the attribution line plus the quote.

4. **Confirm placements before posting.** List each planned comment to the user as `<file>:<line> — <one-line summary>`. Wait for the user to confirm or correct file/line choices.

5. **Post each comment** via:

   ```
   assist prs comment '<path>' <line> '<body>' 2>&1
   ```

   - Always single-quote `<path>` and `<body>`. Never double-quote — backticks in the body would break.
   - For apostrophes inside the body (e.g. `it's`), use the shell escape `'\''`.
   - Bodies must not contain "claude" or "opus" (the command rejects them).
   - Run posts in parallel when there are no dependencies between them.

6. **Report** the resulting `<file>:<line>` line returned by each `assist prs comment` call, plus any failures.

## Notes

- `assist prs comment` publishes a new review thread immediately (despite the help text saying "pending review") — the comment appears live and notifies subscribers.
- `assist prs comment` targets the **current branch's PR**. If the feedback is for a different PR, switch branches first.
- If the same concern legitimately spans multiple lines/files, post one comment per anchor location, not a single combined comment.
- If the reviewer's text contains a clear typo of a real symbol name (e.g. `SuveyQuestion` for `SurveyQuestion`), preserve the typo in the quote. Do not silently correct.
