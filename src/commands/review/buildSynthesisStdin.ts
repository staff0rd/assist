const SYNTHESIS_PROMPT = `You are consolidating two independent code reviews of the same change. The original review request is in request.md. The two reviews are in claude.md and codex.md in the current working directory.

If codex.md does not exist on disk, the codex reviewer was skipped (CLI unavailable). In that case, work from claude.md alone; treat every finding as 'claude-only', do not mark anything 'confirmed' or 'codex-only', and add a note in the Summary that the codex reviewer was skipped.

Read all available review files, deduplicate findings, and produce a single consolidated review in Markdown with this exact structure:

# Code review synthesis

## Summary

A 2-3 sentence overall summary of the change's quality and the most important risks.

## Findings

For each finding, emit one block in this exact format:

### Finding: <short title>
- Severity: blocker | major | minor | nit
- Source: confirmed | disputed | claude-only | codex-only | already-raised
- Location: \`path/to/file.ext:LINE\` or \`n/a\` when not tied to a specific line
- Impact: one sentence on what could go wrong
- Recommendation: one or two sentences with a concrete change

Severity rubric (recalibrate each finding against this — reviewers tend to inflate):
- **blocker** — ships broken behaviour: crash, data loss, security hole, breaks the build or existing tests, or violates a stated requirement.
- **major** — likely bug, missing error handling on a real failure mode, or a regression in existing behaviour. Not "this could be cleaner" or "this might be slow."
- **minor** — narrow correctness or clarity issue with limited blast radius; worth fixing but not urgent.
- **nit** — style, naming, micro-refactors, comment wording; reviewer would not block on it.

Default to the lower tier when uncertain. Code-style preferences, refactor suggestions, and "I would have written it differently" belong in nit — not major. A finding is only major if you can name a concrete failure mode or regression. If a reviewer marked something major but the impact reads as taste or hypothetical, downgrade it.

## Keep tautological-test findings

A finding that a test added or changed by this change is tautological or vacuous — it asserts a mock returns its stub, computes its expected value with the code under test, only checks a mock was called, has no real assertions, snapshots mocked output, or would still pass if the implementation broke — is a legitimate defect, not taste. Keep it even when only one reviewer raised it, and do not downgrade it below minor. Keep major when the test is the sole coverage of a behaviour the change introduces or modifies.

Rules:
- \`confirmed\` = both reviewers raised it.
- \`disputed\` = the reviewers disagreed on the diagnosis or fix.
- \`claude-only\` / \`codex-only\` = only one reviewer raised it.
- \`already-raised\` = a prior review comment in request.md (under "Prior review comments") substantively covers this finding — same file, same defect or recommendation. Use this even when the prior thread is resolved or outdated. Cosmetic overlap is not enough; the prior comment must address the same underlying issue. Prefer \`already-raised\` over the other source values when it applies.
- Order findings by severity (blocker, major, minor, nit), then by source (confirmed first).
- If a finding has no specific file:line, set Location to \`n/a\` exactly.
- Do not invent findings beyond what the two reviews support.

## Drop comment-adding findings

This codebase enforces self-documenting code, so a recommendation to add a code comment cannot be applied. Omit from the consolidated output entirely any finding whose recommendation is to add a code comment — including a comment that restates what the code does, labels a block, or narrates why the change was made — and any finding whose defect is that comments are absent. Omit it, do not downgrade it to nit: drop it even when only one reviewer raised it, and even when both reviewers agreed on it.

Two cases survive consolidation and must be kept:

1. A finding about a comment this change made stale or wrong, where the recommendation is to remove or correct it.
2. A finding about genuinely misleading code, where the recommendation is a clearer name, a smaller function, or a test. If the recommendation is instead to add a comment, drop it.

Output only the consolidated Markdown. No preamble, no commentary about your process.`;

export function buildSynthesisStdin(
	requestPath: string,
	claudePath: string,
	codexPath: string,
): string {
	return `${SYNTHESIS_PROMPT}\n\nFiles:\n- Request: ${requestPath}\n- Claude review: ${claudePath}\n- Codex review: ${codexPath}\n`;
}
