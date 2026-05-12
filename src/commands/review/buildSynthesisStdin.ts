const SYNTHESIS_PROMPT = `You are consolidating two independent code reviews of the same change. The original review request is in request.md. The two reviews are in claude.md and codex.md in the current working directory.

Read all three files, deduplicate findings, and produce a single consolidated review in Markdown with this exact structure:

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

Rules:
- \`confirmed\` = both reviewers raised it.
- \`disputed\` = the reviewers disagreed on the diagnosis or fix.
- \`claude-only\` / \`codex-only\` = only one reviewer raised it.
- \`already-raised\` = a prior review comment in request.md (under "Prior review comments") substantively covers this finding — same file, same defect or recommendation. Use this even when the prior thread is resolved or outdated. Cosmetic overlap is not enough; the prior comment must address the same underlying issue. Prefer \`already-raised\` over the other source values when it applies.
- Order findings by severity (blocker, major, minor, nit), then by source (confirmed first).
- If a finding has no specific file:line, set Location to \`n/a\` exactly.
- Do not invent findings beyond what the two reviews support.

Output only the consolidated Markdown. No preamble, no commentary about your process.`;

export function buildSynthesisStdin(
	requestPath: string,
	claudePath: string,
	codexPath: string,
): string {
	return `${SYNTHESIS_PROMPT}\n\nFiles:\n- Request: ${requestPath}\n- Claude review: ${claudePath}\n- Codex review: ${codexPath}\n`;
}
