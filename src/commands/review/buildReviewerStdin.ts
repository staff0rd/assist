const REVIEW_PROMPT = `You are reviewing a code change. The full review request — branch, base, changed files, and unified diff — is in request.md in the current working directory.

Read request.md, then produce a thorough code review in Markdown. For each finding include:
- Severity (blocker, major, minor, nit) — see rubric below
- File and line (e.g. \`src/foo.ts:42\`) when the finding is tied to a specific location
- Impact: what could go wrong
- Recommendation: a concrete change

Severity rubric:
- **blocker** — ships broken behaviour: crash, data loss, security hole, breaks the build or existing tests, or violates a stated requirement.
- **major** — likely bug, missing error handling on a real failure mode, or a regression in existing behaviour. Not "this could be cleaner" or "this might be slow."
- **minor** — narrow correctness or clarity issue with limited blast radius; worth fixing but not urgent.
- **nit** — style, naming, micro-refactors, comment wording; reviewer would not block on it.

Default to the lower tier when uncertain. Code-style preferences, refactor suggestions, and "I would have written it differently" belong in nit — not major. A finding is only major if you can name a concrete failure mode or regression.

Group findings by severity. If you have no findings in a category, omit it. End with a short overall summary.

Output only the review Markdown. Do not include any preamble or commentary about the process.`;

export function buildReviewerStdin(requestPath: string): string {
	return `${REVIEW_PROMPT}\n\nThe review request is at: ${requestPath}\n`;
}
