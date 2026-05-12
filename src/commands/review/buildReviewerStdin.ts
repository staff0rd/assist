const REVIEW_PROMPT = `You are reviewing a code change. The full review request — branch, base, changed files, and unified diff — is in request.md in the current working directory.

Read request.md, then produce a thorough code review in Markdown. For each finding include:
- Severity (blocker, major, minor, nit)
- File and line (e.g. \`src/foo.ts:42\`) when the finding is tied to a specific location
- Impact: what could go wrong
- Recommendation: a concrete change

Group findings by severity. If you have no findings in a category, omit it. End with a short overall summary.

Output only the review Markdown. Do not include any preamble or commentary about the process.`;

export function buildReviewerStdin(requestPath: string): string {
	return `${REVIEW_PROMPT}\n\nThe review request is at: ${requestPath}\n`;
}
